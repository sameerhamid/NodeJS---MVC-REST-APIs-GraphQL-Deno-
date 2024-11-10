const Product = require("../models/product");
const { validationResult } = require("express-validator");
exports.getAddProduct = (req, res, next) => {
  // if (!req.session.isLoggedIn) {
  //   return res.redirect("/login");
  // }
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMsg: null,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
      },
      hasError: true,
      errorMsg: errors.array()[0].msg,
    });
  }
  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    // this will automatically pic id
    userId: req.user,
  });
  product
    .save()
    .then(() => {
      console.log("Save product data successfully");
      res.redirect("/admin/products");
    })
    .catch((error) => {
      console.log("Error while saving product: ", error);
      res.rederict("admin/products");
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit === "true";
  if (!editMode) {
    return res.redirect("/admin/products");
  }

  // get product details to pass prduct data
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/admin/products");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product,
        hasError: false,
        errorMsg: null,
      });
    })
    .catch((error) => {
      console.log("Error fetching product: ", error);
      res.redirect("/admin/products");
    });
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, price, description, imageUrl } = req.body;
  Product.findById(productId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = title;
      product.price = price;
      product.description = description;
      product.imageUrl = imageUrl;
      // it will automatically update the product
      return product.save().then((product) => {
        console.log("Product updated successfully");
        res.redirect("/admin/products");
      });
    })
    .catch((error) => {
      console.log("Error fetching product: ", error);
      return res.redirect("/admin/products");
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;
  Product.deleteOne({ _id: productId, userId: req.user._id })
    .then((result) => {
      if (result.deletedCount > 0) {
        console.log("Product deleted successfully");
      } else {
        console.log("No product found to delete");
      }
      return res.redirect("/admin/products");
    })
    .catch((error) => {
      console.log("Error deleting product: ", error);
      return res.redirect("/admin/products");
    });

  // Product.findByPk(productId)
  //   .then((product) => {
  //     if (!product) {
  //       console.log("product not found");
  //       return res.redirect("/admin/products");
  //     }

  //     return product.destroy();
  //   })
  //   .then(() => {
  //     return res.redirect("/admin/products");
  //   })
  //   .catch((error) => {
  //     console.log("Error deleting product: ", error);
  //     return res.redirect("/admin/products");
  //   });

  // when don't have to work on some logic before deleting the product
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // .select("title price -_id imageUrl")
    // .populate("userId", "name")
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((error) => {
      console.log("Error fetching products: ", error);
    });
};
