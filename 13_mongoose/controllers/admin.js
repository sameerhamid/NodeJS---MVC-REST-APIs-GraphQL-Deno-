const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const product = new Product({ title, price, description, imageUrl });
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
      });
    })
    .catch((error) => {
      console.log("Error fetching product: ", error);
      res.redirect("/admin/products");
    });
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, price, description, imageUrl } = req.body;
  const product = new Product(title, price, description, imageUrl, productId);
  product
    .save()
    .then((product) => {
      console.log("Product updated successfully");
      return res.redirect("/admin/products");
    })
    .catch((error) => {
      console.log("Error fetching product: ", error);
      return res.redirect("/admin/products");
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;

  Product.deleteById(productId)
    .then((result) => {
      console.log("Product deleted successfully");
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
  Product.fetchAll()
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
