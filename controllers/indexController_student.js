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
var smtpTransport = require('nodemailer-smtp-transport');
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
    tls: {
        rejectUnauthorized: false
    }
}));

function randomString() {
    var randomstring = [];
    var possible = "QWERTYUIOPLKJHGFDSAZXCVBNM1234567890qwertyuioplkjhgfdsazxcvbnm";

    for (var i = 0; i < 8; i++) {
        newChar = possible.charAt(Math.floor(Math.random() * possible.length));
        randomstring.push(newChar);
    }
    return randomstring.join('');
    //console.log(randomstring);
};


function sendEmailValidate(email, validateString) {
    return new Promise((resolve, reject)=>{
        console.log("Send Mesg started" + email);
        var mailOptions = {
            from: 'studyantra.widgetedutech@gmail.com',
            to: email,
            subject: 'Email Verification - WidgetEduTech',
            html: 'The mail has been sent from Node.js application! ' + validateString + '</p>'
        };
        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                reject('failed');
            }
            else {
                console.log('Email sent: ' + info.response);
                var obj = { email: email, validationKey: validateString };
                ValidateUser.create(obj, function (err, newlyCreated) {
                    if (err) {
                        console.log(err);
                        reject('failed');
                    }
                    else {
                        console.log(newlyCreated);
                        resolve ('worked');
                    }
                });
            }
        });
    })
}

exports.student_home_get = function (req, res) {
    res.render('student/home', { usertype: "student" });
};

//Register Student
exports.student_register_get = function (req, res) {
    res.render('student/register');
}

exports.student_register_post = function (req, res) {
    user.findOne({ email: req.body.obj.email }).populate("std").exec(function (err, std) {
        if (err) {
            req.flash('error', err.message);
            console.log(err);
            res.redirect('/');
        }
        if (std != null) {
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
        user.register(newstd, req.body.password, function (err, stdnew) {
            if (err) {
                req.flash('error', "Oops Something went wrong!");
                console.log(err);
                res.redirect('/studentregister');
            }
            else {
                sendEmailValidate(stdnew.email, randomString()).then((suc)=>{
                    if (suc == 'worked') {
                        req.body.obj.user = stdnew._id;
                        delete req.body.obj.username;
                        student.create(req.body.obj, function (err, studentnew) {
                            if (err) {
                                req.flash('error', "Oops Something went wrong!");
                                console.log(err);
                                res.redirect('/studentregister');
                            }
                            else {
                                req.flash('error', "Verify Email with the OTP sent!");
                                res.redirect('/verify-email');
                            }
                        })
                    }
                    else {
                        console.log(suc);
                        req.flash('error', "Oops Something went wrong!");
                        res.redirect('/studentregister');
                    }
                });
            }
        })
    });
}

//View all Student videos
exports.student_videos = function (req, res) {
    schedule.find({}, function (err, vid) {
        if (err) {
            console.log(err);
            res.redirect('/');
        }
        else {
            res.render('student/videos', { vid: vid });
        }
    })
}

//Doubtbook
exports.doubtbook_get = function (req, res) {
    res.render('student/doubtbook');
}

exports.doubtbook_post = function (req, res) {
    var newobj = {
        student: req.user._id,
        doubt: req.body.doubt,
        proof: {
            data: req.files.file.data,
            contentType: req.files.file.mimetype
        }
    }
    doubts.create(newobj, function (err, dbt) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/student/doubt-book');
        }
        else {
            req.flash('success', 'Your doubt has been submitted! Our executives will contact you in 2 hours');
            //res.contentType(dbt.proof.contentType);
            //res.send(dbt.proof.data);
            res.redirect('/');
        }
    })
}

//Dashboard
exports.student_my_account_get = function (req, res) {
    res.render('student/my-account');
};