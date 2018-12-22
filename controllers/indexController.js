var user = require('../models/user.js');
var student = require('../models/student.js');
var admin = require('../models/admin.js');
var instructor = require('../models/instructor.js');
var location = require('../models/location.js');
var passport = require("passport");
var ValidateUser = require("../models/validateuser");
var nodemailer = require("nodemailer");
var mongoose = require("mongoose");
var pdfUtil = require('pdf-to-text');
var smtpTransport =  require('nodemailer-smtp-transport');

var transport = nodemailer.createTransport(smtpTransport({
  //debug: true,
  /*host: 'smtp.mail.yahoo.com',
  port: 587,
  secure: false, //true for 465, false for other ports*/
  service: 'Yahoo',
  auth: {
    user: 'shreyanshdixit204@yahoo.com',
    pass: 'Co52j^eKCG'
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

//All Instructors
exports.instructor_all = function(req, res){
  instructor.find({}, function(err, inst){
    if(err){
      console.log(err);
      req.flash('error', "Oops! Something went Wrong");
      res.redirect('/admin/home');
    }
    else{
      res.render('admin/allinstructors', {data: inst});
    }
  })
}

//All Students
exports.students_all = function(req, res){
  student.find({}, function(err, std){
    if(err){
      console.log(err);
      req.flash('error', "Oops! Something went Wrong");
      res.redirect('/admin/home');
    }
    else{
      res.render('admin/allstudents', {data: std});
    }
  })
}

//Admin HOME
exports.admin_home_get = function(req, res){
  res.render('admin/home');
}


//register page
exports.student_home_get = function(req, res) {
	res.render('student/home', {usertype: "student"});
};

exports.instructor_register_get = function(req, res) {
	res.render('instructor/register');
};

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

exports.student_register_get = function(req, res){
  res.render('student/register');
}

exports.student_register_post = function(req, res){
  user.findOne({email: req.body.obj.email}). populate("std"). exec(function(err, std){
    if(err){
      req.flash('error', err.message);
      console.log(err);
      res.redirect('/');
    }
    if(std!=null){
      console.log("Student with the given email Id already exists!");
      req.flash('error', "Student Already Exists with: " + req.body.obj.email);
      res.redirect('/studentregister');
    }
    var newstd = new user({
      email: req.body.obj.email,
      username: req.body.obj.username,
      userType: 'student',
      emailValid: false
    });
    console.log("Student Initiated " + newstd);
    user.register(newstd, req.body.password, function(err, stdnew){
      if(err){
        req.flash('error', "Oops Something went wrong!");
        console.log(err);
        res.redirect('/studentregister');
      }
      else{
        sendEmailValidate(stdnew.email, randomString()).then((suc)=>{
          if(suc == 'worked'){
            req.body.obj.user = stdnew._id;
            delete req.body.obj.username;
            student.create(req.body.obj, function(err, studentnew){
              if(err){
                req.flash('error', "Oops Something went wrong!");
                console.log(err);
                res.redirect('/studentregister');
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
            res.redirect('/studentregister');
          }
      })
    }
  })
        });
}

exports.admin_register_get = function(req, res){
  res.render('admin/register');
}

exports.admin_register_post = function(req, res){
  user.findOne({email: req.body.obj.email}). populate("adm"). exec(function(err, adm){
    if(err){
      req.flash('error', err.message);
      console.log(err);
      res.redirect('/');
    }
    if(adm!=null){
      console.log("Admin with the given email Id already exists!");
      req.flash('error', "Admin Already Exists with: " + req.body.obj.email);
      res.redirect('/adminregister');
    }
    var newadm = new user({
      email: req.body.obj.email,
      username: req.body.obj.username,
      userType: 'admin',
      emailValid: false
    });
    console.log("Admin Initiated " + newadm);
    user.register(newadm, req.body.password, function(err, admnew){
      if(err){
        req.flash('error', "Oops Something went wrong!");
        console.log(err);
        res.redirect('/adminregister');
      }
      else{
        sendEmailValidate(admnew.email, randomString()).then((suc)=>{
          if(suc == 'worked'){
            req.body.obj.user = admnew._id;
            delete req.body.obj.username;
            admin.create(req.body.obj, function(err, adminnew){
              if(err){
                req.flash('error', "Oops Something went wrong!");
                console.log(err);
                res.redirect('/adminregister');
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
            res.redirect('/adminregister');
          }
      })
    }
  })
        });
}

exports.about_us_get = function(req,res){
  res.render('aboutUs');
};

exports.contact_us_get = function(req, res){
  res.render('contact-us');
}


exports.courseStructure = function(req, res) {
  res.render('courseStructure');
};

exports.student_my_account_get = function(req, res) {
  res.render('student/my-account');
};

exports.instructor_my_profile_get = function(req, res) {
  res.render('instructor/my-profile');
};

exports.logout = function(req,res){
  req.logout();
  req.flash("Success", "see you later!");
  res.redirect("/");
};
//ping-pong
exports.ping = function(req, res) {
  res.status(200).send("ping!");
};
