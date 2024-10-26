const { getDb } = require("../util/database");
const { ObjectId } = require("mongodb");
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: ObjectId.createFromHexString(userId) })
      .then((user) => {
        return user;
      })
      .catch((error) => {
        console.log("Error fetching user", error);
        return error;
      });
  }
}

module.exports = User;
