const { MongoClient, ServerApiVersion } = require("mongodb");

let _db; // Global variable to store the database instance
const uri =
  "mongodb+srv://codewithsamiir:NSXtwPvAKpa1RFra@cluster0.zfjhc.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

function mongoConnect() {
  return new Promise(async (resolve, reject) => {
    try {
      await client.connect();
      _db = client.db("shop"); // Assign the database instance here
      console.log("Successfully connected to MongoDB!");
      resolve("Connection successful!");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      reject("Connection failed.");
    }
  });
}

function mongoClose() {
  return client.close();
}

function getDb() {
  if (_db) {
    return _db; // Now _db is the actual database instance
  }
  throw "No database found!";
}

module.exports = { mongoConnect, mongoClose, client, getDb };
