const express = require('express');
const router = require('./routes/index.js')

const app = express();
const port = process.env.PORT || 5000;

app.use('/', router);

app.listen(port, () => {
  console.log(`Serveur start http://'127.0.0.1:${port}`)
})
