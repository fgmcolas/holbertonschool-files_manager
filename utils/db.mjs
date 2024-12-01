import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    this.client = new MongoClient(`mongodb://${this.host}:${this.port}`, { useUnifiedTopology: true });
    this.client.connect();
    this.db = this.client.db(this.database);
  }

  async isAlive() {
    try {
      await this.client.db().command({ ping: 1 });
      return true;
    } catch (e) {
      return false;
    }
  }

  async nbUsers() {
    const collection = this.db.collection('users');
    return collection.countDocuments();
  }

  async nbFiles() {
    const collection = this.db.collection('files');
    return collection.countDocuments();
  }

  async findFiles(query, limit, skip) {
    const collection = this.db.collection('files');
    return collection.find(query).skip(skip).limit(limit).toArray();
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
