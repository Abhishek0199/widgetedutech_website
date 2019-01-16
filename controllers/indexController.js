var user = require('../models/user.js');
var student = require('../models/student.js');
var admin = require('../models/admin.js');
var instructor = require('../models/instructor.js');
var location = require('../models/location.js');
var schedule = require('../models/schedule.js');
var passport = require("passport");
var ValidateUser = require("../models/validateuser");
var nodemailer = require("nodemailer");
var mongoose = require("mongoose");
var pdfUtil = require('pdf-to-text');
var smtpTransport =  require('nodemailer-smtp-transport');
var fs = require('fs');
var doubts = require('../models/doubts.js');

var transport = nodemailer.createTransport(smtpTransport({
  //debug: true,
  /*host: 'smtp.mail.yahoo.com',
  port: 587,
  secure: false, //true for 465, false for other ports*/
  service: 'Gmail',
  auth: {
    user: 'studyantra.widgetedutech@gmail.com',
    pass: 'Keepitsecured@2018'
  },
  tls:{
    rejectUnauthorized: false
  }
}));

function randomString() {
  var randomstring = [];
  var possible = "QWERTYUIOPLKJHGFDSAZXCVBNM1234567890qwertyuioplkjhgfdsazxcvbnm";

  for (var i=0; i<8; i++) {
    newChar = possible.charAt(Math.floor(Math.random() * possible.length));
    randomstring.push(newChar);
  }
  return randomstring.join('');
  //console.log(randomstring);
};


function sendEmailValidate(email, validateString)
{
  return new Promise((resolve, reject)=>{
    console.log("Send Mesg started" + email);
    var mailOptions = {
      from: 'shreyanshdixit204@yahoo.com',
      to: email,
      subject: 'Email Verification - WidgetEduTech',
      html: 'The mail has been sent from Node.js application! '+ validateString + '</p>'
    };
    transport.sendMail(mailOptions, (error, info) => {
      if (error)
      {
        console.log(error);
        reject('failed');
      }
      else{
        console.log('Email sent: ' + info.response);
        var obj = {email: email, validationKey: validateString};
        ValidateUser.create(obj, function(err, newlyCreated){
          if(err){
            console.log(err);
            reject('failed');
          }
          else{
            console.log(newlyCreated);
            resolve('worked');
        }});
      }
    });
  })
}

//feedback
exports.feedback_get = function(req, res) {
  res.render('feedback');
};

exports.feedback_post = function(req, res) {
  var newFeedback = new feedback({
    fullname: req.body.fullName,
    email: req.body.email,
    subject: req.body.subject,
    messege: req.body.messege
  });
  feedback.create(newFeedback, function(err, newfeedback){
    if(err){
      console.log(err);
    } else {
      console.log(newfeedback);
      res.redirect('/');
    }
  });
};

//verify email
exports.verify_email_get = function(req, res) {
  res.render('verifyEmail');
};
exports.verify_email_post = function(req, res) {
  ValidateUser.findOneAndRemove({validationKey: req.body.verificationCode}, function (err, userf){
    if(err) {
      res.flash('Wrong OTP')
      res.redirect('/verify-email');
    }
    console.log('inside otp check and remove');
    user.findOne({email: userf.email}, function(err, foundUserSchema){
      if (err) {
        req.flash('error', err.message);
        res.redirect('/');
      }
      console.log('inside altering user model');
      foundUserSchema.emailValid = true;
      user.findByIdAndUpdate(foundUserSchema._id, foundUserSchema, {new:true}, function(err, newuser){
        if(err){
          req.flash('error', err.message);
          res.redirect('/');
        }
        else{
          console.log(newuser);
          req.flash('success', 'Email verified');
          res.redirect('/');
        }
      })
    } );
  });
};

//home route
exports.home_get= function(req, res) {
	var user = req.user;
	console.log("HOME_Get method")
	console.log(user);
	if(user!= null && user!="undefined" && user.userType!= null &&  user.userType!= "undefined")
	{
		console.log("inside conditional check");
		if(user.userType === "student")
		{
		var foundStudent = student.findOne({user : user}).populate("foundStudent").exec(function(err, foundStudent){
        if(err || !foundStudent){
            console.log(err);
        }});
		req.session.student = foundStudent;
		res.render('student/home');
		}
		else if(user.userType === "instructor")
		{
			console.log("trying to find user");
			var foundInstructor = instructor.findOne({user : user}).populate("foundInstructor").exec(function(err, foundInstructor){
        if(err || !foundInstructor){
            console.log(err);
        }});
		req.session.instructor = foundInstructor;
		res.render('instructor/home');
		}
	}
	else
	{
			res.render('home');
	}

};

//login
exports.login_get = function(req, res) {
  res.render('login');
};

exports.login_post = function(req, res){
  passport.authenticate('local')(req, res, function(err){
    if(err){
      req.flash('error', "Wrong Username or Password!");
      res.redirect('/login');
    }
    if(!req.user){
      req.flash('error', "Wrong Username or Password!");
      res.redirect('/login');
    }
    if(req.user.userType == 'student'){
      req.flash('success', "Welcome Student " + req.user.username);
      res.redirect('/');
    }
    if(req.user.userType == 'instructor'){
      req.flash('success', "Welcome Instructor " + req.user.username);
      res.redirect('/');
    }
    if(req.user.userType == 'admin'){
      req.flash('success', "Welcome Admin " + req.user.username);
      res.redirect('/admin/home');
    }
  })
}

exports.instructor_register_post = function(req, res){
  user.findOne({email: req.body.obj.email}). populate("inst"). exec(function(err, inst){
    if(err){
      req.flash('error', err.message);
      console.log(err);
      res.redirect('/');
    }
    if(inst!=null){
      console.log("Instructor with the given email Id already exists!");
      req.flash('error', "User Already Exists with: " + req.body.obj.email);
      res.redirect('/beinstructor');
    }
    var newinst = new user({
      email: req.body.obj.email,
      username: req.body.obj.username,
      userType: 'instructor',
      emailValid: false
    });
    console.log("Instructor Initiated " + newinst);
    user.register(newinst, req.body.password, function(err, instnew){
      if(err){
        req.flash('error', "Oops Something went wrong!");
        console.log(err);
        res.redirect('/beinstructor');
      }
      else{
        console.log("Verification");
        sendEmailValidate(instnew.email, randomString()).then((suc)=>{
          if(suc == 'worked'){
            req.body.obj.user = instnew._id;
            instructor.create(req.body.obj, function(err, instructornew){
              if(err){
                req.flash('error', "Oops Something went wrong!");
                console.log(err);
                res.redirect('/beinstructor');
              }
              else{
                req.flash('error', "Verify Email with the OTP sent!");
                res.redirect('/verify-email');
              }
            })
          }
          else{
            console.log(suc);
            req.flash('error', "Oops Something went wrong!");
            res.redirect('/beinstructor');
          }
      })
    }
  })
        });
}

//About us
exports.about_us_get = function(req,res){
  res.render('aboutUs');
};

//Contact Us
exports.contact_us_get = function(req, res){
  res.render('contact-us');
}

//Course Structure
exports.courseStructure = function(req, res) {
  var constdata = fs.readFileSync('textdata/course.json');
  res.render('courseStructure', {data: constdata});
};

exports.oauthcallback = function(req, res){
  console.log(req.query.code);
  res.send('worked');
}

//Logout
exports.logout = function(req,res){
  req.logout();
  req.flash("Success", "See you later!");
  res.redirect("/");
};

//ping-pong
exports.ping = function(req, res) {
  res.status(200).send("ping!");
};
