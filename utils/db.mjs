import { MongoClient } from 'mongodb';

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${host}:${port}/`;

class DBClient {
  constructor() {
    this.db = null;
    MongoClient.connect(url, { useUnifiedTopology: true }, (error, client) => {
      if (error) {
        console.log(error);
        return;
      }
      this.db = client.db(database);
      (async () => {
        try {
          const collections = await this.db.listCollections().toArray();
          const collectionNames = collections.map((col) => col.name);
          if (!collectionNames.includes('users')) {
            await this.db.createCollection('users');
          }
          if (!collectionNames.includes('files')) {
            await this.db.createCollection('files');
          }
        } catch (err) {
          console.error('Failed to create collections', err);
        }
      })();
    });
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  async getUser(query) {
    console.log('QUERY IN DB.JS', query);
    const user = await this.db.collection('users').findOne(query);
    console.log('GET USER IN DB.JS', user);
    return user;
  }

  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }

  async saveFile(fileData) {
    const result = await this.db.collection('files').insertOne(fileData);
    return { _id: result.insertedId, ...fileData };
  }
}

module.exports = new DBClient();
