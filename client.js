const mongodb = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new mongodb.MongoClient(url);

exports.getClient = async (dbName) => {
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  return {
    client,
    db,
  };
};
