var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
//var MongoClient = require('mongodb').MongoClient;
//var url = 'mongodb://localhost/development-studymantra';

//MongoClient.connect(url, function(err, db) {
//  console.log("Database Connected");
//    db.close();
//});

//mongoose.Promise = global.Promise;
var mongoDB = "mongodb://test:password123@ds237808.mlab.com:37808/studymantra";
mongoose.connect(mongoDB);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));


var user = require("./models/user");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(logger('dev'));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + "/public"));
app.use('/bootstrap/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/bootstrap/spec/js', express.static(__dirname + '/node_modules/bootstrap/js/dist')); // redirect bootstrap JS
app.use('/jquery/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/bootstrap/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});


app.use('/', indexRouter);
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

app.listen(process.env.PORT, process.env.IP, function(){
  console.log("Port has started!");
})

module.exports = app;
