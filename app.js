// require all the 3rd party code
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// import our code from routes/
var indexRouter = require('./routes/index');
let votesRouter = require('./routes/votes')

var db = require('./model/db');
let vote = require('./model/votes');

// create an app
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// process urls with the index router (routes/index.js)
app.use('/', indexRouter);
app.use('/votes', votesRouter);

//TODO No auth error handler

// catch 404 errors and forward to error handler
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

// export our app to import from other files
module.exports = app;
