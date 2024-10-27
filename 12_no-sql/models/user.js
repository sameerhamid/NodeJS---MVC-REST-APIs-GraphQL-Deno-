const { getDb } = require("../util/database");
const { ObjectId } = require("mongodb");
class User {
  constructor(name, email, cart, id) {
    this.name = name;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex(
      (cp) => cp.productId.toString() === product._id.toString()
    );

    const updateCartItems = [...this.cart.items];
    let newQuantity = 1;
    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;

      updateCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updateCartItems.push({ productId: product._id, quantity: newQuantity });
    }
    const updatedCart = {
      items: updateCartItems,
    };
    const db = getDb();

    return db.collection("users").updateOne(
      {
        _id: this._id,
      },
      {
        $set: { cart: updatedCart },
      }
    );
  }

  getCart() {
    const db = getDb();

    const productIds = this.cart.items.map((item) => item.productId);
    return db
      .collection("products")
      .find({
        _id: {
          $in: productIds,
        },
      })
      .toArray()
      .then((products) => {
        return products.map((product) => {
          return {
            ...product,
            quantity: this.cart.items.find(
              (i) => i.productId.toString() === product._id.toString()
            ).quantity,
          };
        });
      });
  }

  deleteCartById(productId) {
    const updatedCartItems = this.cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );
    const db = getDb();
    return db.collection("users").updateOne(
      {
        _id: this._id,
      },
      {
        $set: { cart: { items: updatedCartItems } },
      }
    );
  }

  addOrder() {
    const db = getDb();
    db.collection("orders")
      .insertOne(this.cart)
      .then((result) => {
        this.cart = { items: [] };
        return db.collection("users").updateOne(
          {
            _id: this._id,
          },
          { $set: { cart: { items: [] } } }
        );
      });
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
