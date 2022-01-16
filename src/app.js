const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const admin = require('firebase-admin');
const serviceAccount = require('./sodam-server-authentication.json');

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

let firebase;

if (admin.apps.length === 0) {
  firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  firebase = admin.app();
}

app.use('/', require('./routes'));

app.use('*', (req, res) => {
  res.status(404).json({
    status: 404,
    success: false,
    message: '404 페이지인데 이거 안되면 안녕하지 않음 :(',
  });
});

app
  .listen(8080, () => {
    console.log('server is running');
  })
  .on('error', () => {
    process.exit(1);
  });
