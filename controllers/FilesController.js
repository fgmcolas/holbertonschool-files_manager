import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

if (!fs.existsSync(FOLDER_PATH)) {
  fs.mkdirSync(FOLDER_PATH, { recursive: true });
}

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name,
      type,
      data,
      parentId = 0,
      isPublic = false,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== 0) {
      const parentFile = await dbClient.filesCollection.findOne({ _id: parentId });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    let localPath = '';
    let fileDocument = null;

    if (type === 'folder') {
      fileDocument = await dbClient.filesCollection.insertOne({
        userId,
        name,
        type,
        parentId,
        isPublic,
      });
    } else {
      const fileBuffer = Buffer.from(data, 'base64');
      const fileUuid = uuidv4();
      localPath = path.join(FOLDER_PATH, fileUuid);

      fs.writeFileSync(localPath, fileBuffer);

      fileDocument = await dbClient.filesCollection.insertOne({
        userId,
        name,
        type,
        isPublic,
        parentId,
        localPath,
      });
    }

    return res.status(201).json({
      id: fileDocument.insertedId,
      userId,
      name,
      type,
      isPublic,
      parentId,
      localPath: fileDocument.localPath || '',
    });
  }
}

export default FilesController;
