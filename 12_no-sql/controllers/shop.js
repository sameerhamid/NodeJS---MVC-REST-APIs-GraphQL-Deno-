const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
  // retrieves all products from the table
  Product.fetchAll()
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
  Product.fetchAll()
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
  req.user
    .getCart()
    .then((products) => {
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
  let fetchedCart;
  req.user
    .addOrder()
    .then((cart) => {
      res.redirect("/orders");
    })
    .catch((error) => {
      console.log("Error while adding order", error);
      res.redirect("/cart");
    });
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
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
