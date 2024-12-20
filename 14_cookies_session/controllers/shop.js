const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  // retrieves all products from the table
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        isAuthenticated: req.session?.isLoggedIn ?? false,
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
        isAuthenticated: req.session?.isLoggedIn ?? false,
      });
    })
    .catch((error) => {
      console.log("Error fetching product: ", error);
    });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        isAuthenticated: req.session?.isLoggedIn ?? false,
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
        isAuthenticated: req.session?.isLoggedIn ?? false,
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
          name: req.user.name,
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
        isAuthenticated: req.session?.isLoggedIn ?? false,
      });
    })
    .catch((error) => {
      console.log("error while getting orders", error);
    });
};
