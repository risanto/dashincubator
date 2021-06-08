const { MongoClient } = require("mongodb");

let mongoClient;
let database;
const tables = {};

const init = async (url, name) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(
      url,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (error, client) => {
        if (error) {
          reject(error);
          return;
        }

        mongoClient = client;
        database = client.db(name);
        console.log(`🔥 Connected to ${name} 🔥`);
        resolve();
      }
    );
  });
};

const getTable = (tableName) => {
  if (tables[tableName] === undefined) {
    tables[tableName] = database.collection(tableName);
  }

  return tables[tableName];
};

const getClient = () => mongoClient;

const getDatabase = () => database;

module.exports = {
  getTable,
  getClient,
  init,
  getDatabase,
};
