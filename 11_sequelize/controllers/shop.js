const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
  // retrieves all products from the table
  Product.findAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((error) => {
      console.log("Error fetching products: ", error);
    });
};

exports.getProduct = (req, res, next) => {
  const { productId } = req.params;
  // gets single item from the table
  Product.findByPk(productId)
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
  Product.findAll()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((error) => {
      console.log("Error fetching products: ", error);
    });
};

exports.getCart = (req, res, next) => {
  // Cart.getProducts((cartProducts) => {
  //   const cart = [];
  //   Product.fetchAll((products) => {
  //     for (prod of products) {
  //       const cartProductDAta = cartProducts.products.find(
  //         (p) => p.id === prod.id
  //       );
  //       if (cartProductDAta) {
  //         cart.push({ productData: prod, qty: cartProductDAta.qty });
  //       }
  //     }

  //     console.log("cartProductDAta>>>", cart);
  //     res.render("shop/cart", {
  //       path: "/cart",
  //       pageTitle: "Your Cart",
  //       products: cart,
  //     });
  //   });
  // });

  req.user
    .getCart()
    .then((cart) => {
      return cart
        .getProducts()
        .then((products) => {
          res.render("shop/cart", {
            path: "/cart",
            pageTitle: "Your Cart",
            products: products,
          });
        })
        .catch((error) => {
          console.log("Error fetching products from cart: ", error);
          // res.redirect("/");
        });
    })
    .catch((error) => {
      console.log("Error fetching user's cart: ", error);
      // res.redirect("/");
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } }).then((products) => {
        let product;
        if (products.length > 0) {
          product = products[0];
        }

        if (product) {
          const oldQuantity = product.cartItem.quantity;
          newQuantity = oldQuantity + 1;
          return product;
        }

        return Product.findByPk(prodId);
      });
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log("Error fetching user's cart: ", err);
      return res.redirect("/");
    });
};

exports.postCartDelete = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((error) => {
      console.log("Error Delete from cart : ", error);
      return res.redirect("/");
    });
};

exports.postOrders = (req, res, next) => {
  let fetchedCart;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      console.log("cart>>>", cart);
      return cart.getProducts();
    })
    .then((products) => {
      return req.user
        .createOrder()
        .then((order) => {
          return order.addProduct(
            products.map((prod) => {
              prod.orderItem = { quantity: prod.cartItem.quantity };
              return prod;
            })
          );
        })
        .catch((error) => {
          console.log("Error while ordering products>>>", error);
        });
    })
    .then((result) => {
      // clearing the cart
      return fetchedCart.setProducts(null);
    })
    .then((result) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      console.log("error ordering products >>", err);
    });
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({ include: ["products"] })
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
