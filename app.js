
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LocalStrategy = require('passport-local');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var methodOverride = require('method-override');
var fs = require('fs');
var user = require('./models/user.js');
var student = require('./models/student.js');

//var MongoClient = require('mongodb').MongoClient;
//var url = 'mongodb://localhost/development-studymantra';

//MongoClient.connect(url, function(err, db) {
//  console.log("Database Connected");
//    db.close();
//});

//mongoose.Promise = global.Promise;
let data = fs.readFileSync(path.resolve(__dirname, "client_secret.json"));
data = JSON.parse(data);
var mongoDB = "mongodb://test:password123@ds237808.mlab.com:37808/studymantra";
mongoose.connect(mongoDB);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));


var user = require("./models/user");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
/*const server = app.listen(3000);
const io = require('socket.io').listen(server);

io.on("connection", function (socket) {
  // at this point a client has connected
  socket.on("draw", function (data) {
    socket.broadcast.emit("draw", data);
  });

  socket.on("draw begin path", function () {
    socket.broadcast.emit("draw begin path");
  });
});*/

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

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + "/public"));
app.use('/bootstrap/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/bootstrap/spec/js', express.static(__dirname + '/node_modules/bootstrap/js/dist')); // redirect bootstrap JS
app.use('/jquery/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/bootstrap/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
passport.use(new LocalStrategy(user.authenticate()));
passport.use(new GoogleStrategy({
  clientID: data.web.client_id,
  clientSecret: data.web.client_secret,
  callbackURL: "http://localhost:3000/auth/google/callback"
},
function(accessToken, refreshToken, profile, done){
  let newobj = {
    "googleid": profile.id,
    "username": profile.displayName,
    "userType": "student",
  }
  user.findOne({googleid: newobj.googleid}, function(err, found){
    if(err){
      console.log(err);
      done(err, null);
    }
    if(!found){
      user.create(newobj, function(err, user){
        if (err) {
          console.log(err);
          done(err, null);
        }
        else{
          let obj = {
            "fullName": newobj.username,
            "user": user._id,
          }
          student.create(obj, function(err, std){
            if (err) {
              console.log(err);
              done(err, null);
            }
            else{
              done(err, user);
            }
          })
        }        
      })
    }
    else{
      done(err, found);
    }
  })
}))
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
