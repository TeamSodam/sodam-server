const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

dotenv.config();

app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, content-type, x-access-token');
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', require('./routes'));

app.use('*', (req, res) => {
  res.status(404).json({
    status: 404,
    success: false,
    message: '잘 나왔으면 좋겠다 ! 제발 !',
  });
});

app
  .listen(8080, () => {
    console.log('server is running');
  })
  .on('error', () => {
    process.exit(1);
  });
