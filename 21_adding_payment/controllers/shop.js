const fs = require("fs");
const PDFDocument = require("pdfkit");

const stripe = require("stripe")(
  "sk_test_51OlrSRSHi37alanBdIW5pfnjcK8kh8EAs3dnkmHDks8z07I683v0zxo1ng1omvoIObbYluRhKA1VAVjfe4PnKHOG00cucxvOcs"
);

const path = require("path");
const Product = require("../models/product");
const Order = require("../models/order");
const ITEMS_PER_PAGE = 1;
exports.getProducts = (req, res, next) => {
  // retrieves all products from the table
  // Product.find()
  //   .then((products) => {
  //     res.render("shop/product-list", {
  //       prods: products,
  //       pageTitle: "All Products",
  //       path: "/products",
  //     });
  //   })
  //   .catch((error) => {
  //     console.log("Error fetching products: ", error);
  //   });

  const page = +req.query.page || 1;
  let totalItems = 0;
  Product.countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((error) => {
      console.log("Error fetching products: ", error);
    });
};

exports.getProduct = (req, res, next) => {
  const { productId } = req.params;
  // gets single item from the table
  Product.findById(productId)
    .then((product) => {
      res.render("shop/product-detail", {
        product,
        pageTitle: "Product detail",
        path: "/products",
      });
    })
    .catch((error) => {
      console.log("Error fetching product: ", error);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems = 0;
  Product.countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        csrfToken: req.csrfToken(),
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((error) => {
      console.log("Error fetching products: ", error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((error) => {
      console.log("Error fetching products from cart: ", error);
      res.redirect("/");
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  if (!req.user) {
    return res.redirect("/login"); // Redirect to login if no user is found
  }
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((error) => {
      console.log("Erorr adding to cart>>>", error);
      res.redirect("/");
    });
};

exports.postCartDelete = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteCartById(prodId)
    .then((cart) => {
      res.redirect("/cart");
    })
    .catch((error) => {
      console.log("Error while deleting product from cart", error);
    });
};

exports.postOrders = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((item) => {
        return {
          quantity: item.quantity,
          product: { ...item.productId._doc },
        };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });

      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((error) => {
      console.log("Error while adding order", error);
      res.redirect("/cart");
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((item) => {
        return {
          quantity: item.quantity,
          product: { ...item.productId._doc },
        };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });

      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((error) => {
      console.log("Error while adding order", error);
      res.redirect("/cart");
    });
};
exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders,
      });
    })
    .catch((error) => {
      console.log("error while getting orders", error);
    });
};

exports.getInvoice = (req, res, next) => {
  const { orderId } = req.params;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found"));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }

      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join("data", "invoices", invoiceName);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${invoiceName}"`);
      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });

      pdfDoc.text("----------------------------");
      let total = 0;
      order.products.forEach((prod) => {
        total += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            `${prod.quantity} x ${prod.product.title} $ ${prod.product.price}`
          );
      });

      pdfDoc.text("----------------------------");
      pdfDoc.fontSize(20).text(`Total Price: $ ${total}`);
      pdfDoc.end();
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader("Content-Type", "application/pdf");
      //   res.setHeader(
      //     "Content-Disposition",
      //     `inline; filename="${invoiceName}"`
      //   );
      //   res.send(data);
      // });

      // streamed data instead of reading all data at once if file is large
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader("Content-Type", "application/pdf");
      // res.setHeader("Content-Disposition", `inline; filename="${invoiceName}"`);

      // file.pipe(res);
    })
    .catch((err) => next(err));
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;

  req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items;
      total = 0;

      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"], // Accept domestic card payments only
        line_items: products.map((p) => {
          return {
            price_data: {
              currency: "inr", // Set currency to INR
              product_data: {
                name: p.productId.title,
                description: p.productId.description,
              },
              unit_amount: Math.round(p.productId.price * 100), // Convert price to smallest currency unit
            },
            quantity: p.quantity,
          };
        }),
        mode: "payment", // Payment mode for one-time purchases
        success_url: `${req.protocol}://${req.get("host")}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`,
      });
    })
    .then((session) => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch((error) => {
      console.log("Error fetching products from cart: ", error);
      res.redirect("/");
    });
};
