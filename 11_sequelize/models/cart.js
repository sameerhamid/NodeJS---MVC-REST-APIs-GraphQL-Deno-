const fs = require("fs");
const path = require("path");

const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "cart.json"
);

module.exports = class Cart {
  static addProduct(id, productPrice) {
    // Fetch the previous cart
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      // Analyze the cart => Find existing product
      const existingProductIndex = cart.products.findIndex(
        (prod) => prod.id === id
      );
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      // Add new product/ increase quantity
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice = cart.totalPrice + +productPrice;
      fs.writeFile(p, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(p, (error, data) => {
      if (error) {
        return;
      }

      let cart = { products: [], totalPrice: 0 };
      cart = JSON.parse(data);

      const product = cart.products.find((p) => p.id === id);
      if (!product) {
        return;
      }

      const productQty = product.qty;
      cart.products = cart.products.filter((p) => p.id !== id);
      cart.totalPrice = cart.totalPrice - productPrice * productQty;
      fs.writeFile(p, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
  }

  static getProducts(cb) {
    fs.readFile(p, (err, data) => {
      if (err) {
        console.log(err);
        cb(null);
      } else {
        const cart = JSON.parse(data);
        cb(cart);
      }
    });
  }
};
