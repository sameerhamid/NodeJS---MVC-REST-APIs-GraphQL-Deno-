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
  let fetchedCart;
  let newQuantity = 1;
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
