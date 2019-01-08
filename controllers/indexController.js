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
  service: 'Yahoo',
  auth: {
    user: 'shreyanshdixit204@yahoo.com',
    pass: 'Co52j^eKCG'
  },
  tls:{
    rejectUnauthorized: false
  }
}));

exports.test= function(req, res){
  res.render('test');
}


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

//Schedule and Start Section
exports.instructor_schedule_get = function(req, res){
  var data = fs.readFileSync('client_secret.json');
  data = JSON.parse(data);
  res.render('instructor/scheduleform', {client_secret: data.web.client_id});
}

exports.instructor_schedule_post = function(req, res){
  console.log(req.body);
  var date = new Date(req.body.date);
  var x = (req.body.time).split(":");
  date.setHours(x[0]);
  date.setMinutes(x[1]);
  req.body.obj.timestamp = date;
  req.body.obj.instructor = req.user._id;
  schedule.create(req.body.obj, function(err, sche){
    if(err){
      console.log(err);
      req.flash('error', err.message);
      res.redirect('/instructor/schedule');
    }
    else{
      console.log(sche);
      req.flash('success', 'Your Lecture has been Scheduled!');
      res.redirect('/');
    }
  })
}

exports.instructor_start = function(req, res){
  schedule.find({instructor: req.user._id}, function(err, sche){
    if(err){
      console.log(err);
      req.flash('error', err.message);
      res.redirect('/');
    }
    if(!sche){
      req.flash('error', 'No Scheduled Lectures!');
      res.redirect('/');
    }
    else{
      res.render('instructor/start', {data: sche});
    }
  })
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

//Edit and Delete Buttons
exports.admin_instedit_get = function(req, res){
  instructor.findById(req.params.id, function(err, inst){
    if(err){
      console.log(err);
      req.flash('error', err.message);
      res.redirect('/allinstructors');
    }
    else{
      res.render('admin/edit_inst', {data: inst});
    }
  })
}

exports.admin_instedit_put = function(req, res){
  instructor.findByIdAndUpdate(req.params.id, req.body.obj, {new: true}, function(err, inst){
    if(err){
      console.log(err);
      req.flash('error', err.message);
      res.redirect('/allinstructors');
    }
    else{
      var obj = {
        email: req.body.obj.email
      };
      user.findByIdAndUpdate(inst.user, obj, {new: true}, function(err, nuser){
        if(err){
          console.log(err);
          req.flash('error', err.message);
          res.redirect('/allinstructors');
        }
        else{
          console.log(inst);
          console.log(nuser);
          req.flash('success', "Instructor has been successfully updated!");
          res.redirect('/allinstructors');
        }
      })
    }
  })
}

exports.admin_instdel_get = function(req, res){
  instructor.findById(req.params.id, function(err, inst){
    if(err){
      console.log(err);
      req.flash('error', err.message);
      res.redirect('/allinstructors');
    }
    else{
      res.render('admin/del_inst', {data: inst});
    }
  })
}

exports.admin_instdel_del = function(req, res){
  instructor.findById(req.params.id, function(err, inst){
    if(err){
      console.log(err);
      req.flash('error', err.message);
      res.redirect('/allinstructors');
    }
    else{
      var id = inst.user;
      instructor.findByIdAndRemove(req.params.id, function(err, instructor){
        if(err){
          console.log(err);
          req.flash('error', err.message);
          res.redirect('/allinstructors');
        }
        else{
          user.findByIdAndRemove(id, function(err, nuser){
            if(err){
              console.log(err);
              req.flash('error', err.message);
              res.redirect('/allinstructors');
            }
            else{
              req.flash('success', 'Instructor has been successfully deleted!');
              res.redirect('/allinstructors');
            }
          })
        }
      })
    }
  })
}

exports.admin_stdedit_get = function(req, res){
  student.findById(req.params.id, function(err, std){
    if(err){
      console.log(err);
      req.flash('error', err.message);
      res.redirect('/allstudents');
    }
    else{
      res.render('admin/edit_std', {data: std});
    }
  })
}

exports.admin_stdedit_put = function(req, res){
  student.findByIdAndUpdate(req.params.id, req.body.obj, {new: true}, function(err, std){
    if(err){
      console.log(err);
      req.flash('error', err.message);
      res.redirect('/allstudents');
    }
    else{
      var obj = {
        email: req.body.obj.email
      };
      user.findByIdAndUpdate(inst.user, obj, {new: true}, function(err, nuser){
        if(err){
          console.log(err);
          req.flash('error', err.message);
          res.redirect('/allstudents');
        }
        else{
          console.log(std);
          console.log(nuser);
          req.flash('success', "Student has been successfully updated!");
          res.redirect('/allstudents');
        }
      })
    }
  })
}

exports.admin_stddel_get = function(req, res){
  student.findById(req.params.id, function(err, std){
    if(err){
      console.log(err);
      req.flash('error', err.message);
      res.redirect('/allstudents');
    }
    else{
      res.render('admin/del_std', {data: std});
    }
  })
}

exports.admin_stddel_del = function(req, res){
  student.findById(req.params.id, function(err, std){
    if(err){
      console.log(err);
      req.flash('error', err.message);
      res.redirect('/allstudents');
    }
    else{
      var id = std.user;
      student.findByIdAndRemove(req.params.id, function(err, student){
        if(err){
          console.log(err);
          req.flash('error', err.message);
          res.redirect('/allstudents');
        }
        else{
          user.findByIdAndRemove(id, function(err, nuser){
            if(err){
              console.log(err);
              req.flash('error', err.message);
              res.redirect('/allstudents');
            }
            else{
              req.flash('success', 'Student has been successfully deleted!');
              res.redirect('/allstudents');
            }
          })
        }
      })
    }
  })
}
exports.doubtbook_get = function(req, res){
  res.render('student/doubtbook');
}

exports.doubtbook_post = function(req, res){
  var newobj = {
    student: req.user._id,
    doubt: req.body.doubt,
    proof: {
      data: req.files.file.data,
      contentType: req.files.file.mimetype
    }
  }
  doubts.create(newobj, function(err, dbt){
    if(err){
      console.log(err);
      req.flash('error', err.message);
      res.redirect('/student/doubt-book');
    }
    else{
      req.flash('success', 'Your doubt has been submitted! Our executives will contact you in 2 hours');
      //res.contentType(dbt.proof.contentType);
      //res.send(dbt.proof.data);
      res.redirect('/student');
    }
  })
}

exports.about_us_get = function(req,res){
  res.render('aboutUs');
};

exports.contact_us_get = function(req, res){
  res.render('contact-us');
}


exports.courseStructure = function(req, res) {
  var constdata = fs.readFileSync('textdata/course.json');
  res.render('courseStructure', {data: constdata});
};

exports.oauthcallback = function(req, res){
  console.log(req.query.code);
  res.send('worked');
}

exports.student_my_account_get = function(req, res) {
  res.render('student/my-account');
};

exports.instructor_my_profile_get = function(req, res) {
  res.render('instructor/my-profile');
};

exports.logout = function(req,res){
  req.logout();
  req.flash("Success", "See you later!");
  res.redirect("/");
};
//ping-pong
exports.ping = function(req, res) {
  res.status(200).send("ping!");
};
