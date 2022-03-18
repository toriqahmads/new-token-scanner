const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors());
app.use(helmet());

require('./app/workers/token-scanner').Run();

const routers = require('./routes');
routers(app);

//handling error
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;

  //pass const error to next middleware
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error:{
      message: error.message
    }
  });
});

module.exports = app;
