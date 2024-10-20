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

  // it will create and save the object in database in one go

  Product.create({
    title,
    price,
    imageUrl,
    description,
  })
    .then((result) => {
      console.log("saving product>>>");
      res.redirect("/admin/products");
    })
    .catch((error) => {
      console.log("Error creating product>>>", error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit === "true";
  if (!editMode) {
    return res.redirect("/admin/products");
  }

  // get product details to pass prduct data
  const prodId = req.params.productId;

  Product.findByPk(prodId)
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
  Product.findByPk(productId)
    .then((product) => {
      if (!product) {
        // If no product is found, you may want to create a new product
        // Create a new instance of the Product model
        product = Product.build({
          title: title,
          price: price,
          description: description,
          imageUrl: imageUrl,
        });
      } else {
        // If product exists, update its properties
        product.title = title;
        product.price = price;
        product.description = description;
        product.imageUrl = imageUrl;
      }

      // Save the updated or newly created product
      return product.save();
    })
    .then((result) => {
      console.log("product updated successfully");
      return res.redirect("/admin/products");
    })
    .catch((error) => {
      console.log("Error fetching product: ", error);
      return res.redirect("/admin/products");
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;

  Product.findByPk(productId)
    .then((product) => {
      if (!product) {
        console.log("product not found");
        return res.redirect("/admin/products");
      }

      return product.destroy();
    })
    .then(() => {
      return res.redirect("/admin/products");
    })
    .catch((error) => {
      console.log("Error deleting product: ", error);
      return res.redirect("/admin/products");
    });
};

exports.getProducts = (req, res, next) => {
  Product.findAll()
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
