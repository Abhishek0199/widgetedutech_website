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
    service: 'Yahoo',
    auth: {
        user: 'shreyanshdixit204@yahoo.com',
        pass: 'Co52j^eKCG'
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
    return new Promise((resolve, reject) => {
        console.log("Send Mesg started" + email);
        var mailOptions = {
            from: 'shreyanshdixit204@yahoo.com',
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
                        resolve('worked');
                    }
                });
            }
        });
    })
}

exports.instructor_register_get = function (req, res) {
    res.render('instructor/register');
};

//Register an instructor
exports.instructor_register_post = function (req, res) {
    user.findOne({ email: req.body.obj.email }).populate("inst").exec(function (err, inst) {
        if (err) {
            req.flash('error', err.message);
            console.log(err);
            res.redirect('/');
        }
        if (inst != null) {
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
        user.register(newinst, req.body.password, function (err, instnew) {
            if (err) {
                req.flash('error', "Oops Something went wrong!");
                console.log(err);
                res.redirect('/beinstructor');
            }
            else {
                console.log("Verification");
                sendEmailValidate(instnew.email, randomString()).then((suc) => {
                    if (suc == 'worked') {
                        req.body.obj.user = instnew._id;
                        instructor.create(req.body.obj, function (err, instructornew) {
                            if (err) {
                                req.flash('error', "Oops Something went wrong!");
                                console.log(err);
                                res.redirect('/beinstructor');
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
                        res.redirect('/beinstructor');
                    }
                })
            }
        })
    });
}

//Schedule and Start Section
exports.instructor_schedule_get = function (req, res) {
    var data = fs.readFileSync('client_secret.json');
    data = JSON.parse(data);
    res.render('instructor/scheduleform', { client_secret: data.web.client_id });
}

exports.instructor_schedule_post = function (req, res) {
    //console.log(req.body);
    req.body.obj.cast_id = req.body.cast_id;
    req.body.obj.stream_name = req.body.stream_name;
    req.body.obj.stream_id = req.body.stream_id;
    req.body.obj.iframe_embed = req.body.iframe;
    req.body.obj.url = req.body.url;
    var date = new Date(req.body.date);
    var x = (req.body.time).split(":");
    date.setHours(x[0]);
    date.setMinutes(x[1]);
    req.body.obj.timestamp = date;
    req.body.obj.instructor = req.user._id;
    schedule.create(req.body.obj, function (err, sche) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/instructor/schedule');
        }
        else {
            //console.log(sche);

            req.flash('success', 'Your Lecture has been Scheduled!');
            res.redirect('/');
        }
    })
}

exports.instructor_start = function (req, res) {
    schedule.find({ instructor: req.user._id }, function (err, sche) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/');
        }
        if (!sche) {
            req.flash('error', 'No Scheduled Lectures!');
            res.redirect('/');
        }
        else {
            res.render('instructor/start', { data: sche });
        }
    })
}

//Dashboard
exports.instructor_my_profile_get = function (req, res) {
    res.render('instructor/my-profile');
};