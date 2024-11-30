import pkg from 'mongodb';
import crypto from 'crypto';

const { MongoClient } = pkg;

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

class DBClient {
  constructor() {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (!err) {
        this.db = client.db(DB_DATABASE);
        this.usersCollection = this.db.collection('users');
        this.filesCollection = this.db.collection('files');
      } else {
        console.log(err.message);
        this.db = false;
      }
    });
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    const numberOfUsers = await this.usersCollection.countDocuments();
    return numberOfUsers;
  }

  async nbFiles() {
    const numberOfFiles = await this.filesCollection.countDocuments();
    return numberOfFiles;
  }

  async userEmailExist(email) {
    try {
      const user = await this.usersCollection.findOne({ email });
      return !!user;
    } catch (err) {
      console.error('Error checking user email existence:', err);
      return false;
    }
  }

  async insertNewUser(email, password) {
    try {
      const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
      const result = await this.usersCollection.insertOne({ email, password: hashedPassword });
      return { id: result.insertedId, email };
    } catch (err) {
      console.error('Error inserting new user:', err);
      throw new Error('Failed to insert new user');
    }
  }
}

const dbClient = new DBClient();

export default dbClient;
