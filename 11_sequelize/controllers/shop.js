const Product = require("../models/product");
const Cart = require("../models/cart");

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
  Cart.getProducts((cartProducts) => {
    const cart = [];
    Product.fetchAll((products) => {
      for (prod of products) {
        const cartProductDAta = cartProducts.products.find(
          (p) => p.id === prod.id
        );
        if (cartProductDAta) {
          cart.push({ productData: prod, qty: cartProductDAta.qty });
        }
      }

      console.log("cartProductDAta>>>", cart);
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: cart,
      });
    });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId, (product) => {
    Cart.addProduct(prodId, product.price);
  });
  res.redirect("/cart");
};

exports.postCartDelete = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    Cart.deleteProduct(prodId, product.price);
    res.redirect("/cart");
  });
};

exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    path: "/orders",
    pageTitle: "Your Orders",
  });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
