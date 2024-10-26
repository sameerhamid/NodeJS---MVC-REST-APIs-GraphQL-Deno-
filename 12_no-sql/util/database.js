const { MongoClient, ServerApiVersion } = require("mongodb");

const uri =
  "mongodb+srv://codewithsamiir:NSXtwPvAKpa1RFra@cluster0.zfjhc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
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
      await client.db("admin").command({ ping: 1 });
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

module.exports = { mongoConnect, mongoClose, client };
