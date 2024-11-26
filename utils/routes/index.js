const express = require('express');
const router = express.Router();

const AppController = require('../controllers/AppController');

app.get('/status', (req, res) => {
  res.send(AppController.getStatus);
});

app.get('/stats', (req, res) => {
  res.send(AppController.getStats);
});

module.exports = router;
