const { getDb } = require("../util/database");
const { ObjectId } = require("mongodb");
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

  static findById(productId) {
    const db = getDb();
    return db
      .collection("products")
      .findOne({ _id: ObjectId.createFromHexString(productId) })
      .then((product) => {
        return product;
      })
      .catch((err) => {
        console.log("Error finding product by ID", err);
        return null;
      });
  }
}

module.exports = Product;
