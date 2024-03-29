const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');
const usersRouter = require('./routes/users');
const db = require('./connection');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser())

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost', 'https://127.0.0.1', 'https://jiyoungglee.github.io', 'http://jiyoungglee.github.io', 'https://www.jiyoung-lee.com'],
  credentials: true,
  methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE']
}));

// Passport session
app.enable('trust proxy')
app.use(session({
  key: 'userId',
  secret: process.env.SESSION_SECRET,
  store: new MySQLStore({}, db),
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    maxAge: 1000*60*60*24
  }
}))

app.use(passport.initialize());
app.use(passport.session());
require('./passport.js');

app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
