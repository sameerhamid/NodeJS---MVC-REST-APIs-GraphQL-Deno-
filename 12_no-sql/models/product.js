const { getDb } = require("../util/database");
const { ObjectId } = require("mongodb");
class Product {
  constructor(title, price, description, imageUrl, id) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id;
  }

  save() {
    const db = getDb();
    let dbOp;
    const updateData = { ...this };
    delete updateData._id;
    if (this._id) {
      dbOp = db
        .collection("products")
        .updateOne(
          { _id: ObjectId.createFromHexString(this._id) },
          { $set: updateData }
        );
    } else {
      dbOp = db.collection("products").insertOne(updateData);
    }
    return dbOp
      .then((result) => {
        console.log("Product saved to database");
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

  static deleteById(productId) {
    const db = getDb();
    return db
      .collection("products")
      .deleteOne({ _id: ObjectId.createFromHexString(productId) })
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.log("Error deleting product", error);
      });
  }
}

module.exports = Product;
