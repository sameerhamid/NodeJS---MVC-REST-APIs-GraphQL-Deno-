const { getDb } = require("../util/database");

class Product {
  constructor(title, price, description, imageUrl) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
  }

  save() {
    const db = getDb();
    return db
      .collection("products")
      .insertOne(this)
      .then((result) => {
        console.log("Product saved to database", result);
      })
      .catch((error) => {
        console.log("Error while saving product", error);
      });
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        return products;
      })
      .catch((error) => {
        console.log("Error fetching products", error);
        return [];
      });
  }
}

module.exports = Product;
