const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const cookieParser = require('cookie-parser');
dotenv.config();

const allowedOrigins = ['https://sodam.me', 'https://sodam-client.vercel.app', 'https://server.sodam.me']
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
};

app.use(cors(corsOptions)); // 옵션을 추가한 CORS 미들웨어 추가

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if(allowedOrigins.includes(origin)){
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, content-type, x-access-token');
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());

app.use('/', require('./routes'));

app.use('*', (req, res) => {
  res.status(404).json({
    status: 404,
    success: false,
    message: '페이지 주소를 찾을 수 없습니다.',
  });
});

app
  .listen(8080, () => {
    console.log('server is running');
  })
  .on('error', () => {
    process.exit(1);
  });
