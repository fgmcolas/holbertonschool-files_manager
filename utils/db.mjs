import pkg from 'mongodb';
const { MongoClient } = pkg;

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    this.isConnected = false;

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.isConnected = true;
    } catch (error) {
      console.error('Connection to MongoDB failed:', error);
      this.isConnected = false;
    }
  }

  isAlive() {
    return this.isConnected;
  }

  async nbUsers() {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }
    const db = this.client.db();
    const usersCollection = db.collection('users');
    return await usersCollection.countDocuments();
  }

  async nbFiles() {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }
    const db = this.client.db();
    const filesCollection = db.collection('files');
    return await filesCollection.countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
