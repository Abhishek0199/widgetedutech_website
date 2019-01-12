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

//All Instructors
exports.instructor_all = function (req, res) {
    instructor.find({}, function (err, inst) {
        if (err) {
            console.log(err);
            req.flash('error', "Oops! Something went Wrong");
            res.redirect('/admin/home');
        }
        else {
            res.render('admin/allinstructors', { data: inst });
        }
    })
}

//All Students
exports.students_all = function (req, res) {
    student.find({}, function (err, std) {
        if (err) {
            console.log(err);
            req.flash('error', "Oops! Something went Wrong");
            res.redirect('/admin/home');
        }
        else {
            res.render('admin/allstudents', { data: std });
        }
    })
}

//Admin HOME
exports.admin_home_get = function (req, res) {
    res.render('admin/home');
}

exports.admin_register_get = function (req, res) {
    res.render('admin/register');
}

exports.admin_register_post = function (req, res) {
    user.findOne({ email: req.body.obj.email }).populate("adm").exec(function (err, adm) {
        if (err) {
            req.flash('error', err.message);
            console.log(err);
            res.redirect('/');
        }
        if (adm != null) {
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
        user.register(newadm, req.body.password, function (err, admnew) {
            if (err) {
                req.flash('error', "Oops Something went wrong!");
                console.log(err);
                res.redirect('/adminregister');
            }
            else {
                sendEmailValidate(admnew.email, randomString()).then((suc) => {
                    if (suc == 'worked') {
                        req.body.obj.user = admnew._id;
                        delete req.body.obj.username;
                        admin.create(req.body.obj, function (err, adminnew) {
                            if (err) {
                                req.flash('error', "Oops Something went wrong!");
                                console.log(err);
                                res.redirect('/adminregister');
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
                        res.redirect('/adminregister');
                    }
                })
            }
        })
    });
}

//Edit and Delete Buttons
exports.admin_instedit_get = function (req, res) {
    instructor.findById(req.params.id, function (err, inst) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/allinstructors');
        }
        else {
            res.render('admin/edit_inst', { data: inst });
        }
    })
}

exports.admin_instedit_put = function (req, res) {
    instructor.findByIdAndUpdate(req.params.id, req.body.obj, { new: true }, function (err, inst) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/allinstructors');
        }
        else {
            var obj = {
                email: req.body.obj.email
            };
            user.findByIdAndUpdate(inst.user, obj, { new: true }, function (err, nuser) {
                if (err) {
                    console.log(err);
                    req.flash('error', err.message);
                    res.redirect('/allinstructors');
                }
                else {
                    console.log(inst);
                    console.log(nuser);
                    req.flash('success', "Instructor has been successfully updated!");
                    res.redirect('/allinstructors');
                }
            })
        }
    })
}

exports.admin_instdel_get = function (req, res) {
    instructor.findById(req.params.id, function (err, inst) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/allinstructors');
        }
        else {
            res.render('admin/del_inst', { data: inst });
        }
    })
}

exports.admin_instdel_del = function (req, res) {
    instructor.findById(req.params.id, function (err, inst) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/allinstructors');
        }
        else {
            var id = inst.user;
            instructor.findByIdAndRemove(req.params.id, function (err, instructor) {
                if (err) {
                    console.log(err);
                    req.flash('error', err.message);
                    res.redirect('/allinstructors');
                }
                else {
                    user.findByIdAndRemove(id, function (err, nuser) {
                        if (err) {
                            console.log(err);
                            req.flash('error', err.message);
                            res.redirect('/allinstructors');
                        }
                        else {
                            req.flash('success', 'Instructor has been successfully deleted!');
                            res.redirect('/allinstructors');
                        }
                    })
                }
            })
        }
    })
}

exports.admin_stdedit_get = function (req, res) {
    student.findById(req.params.id, function (err, std) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/allstudents');
        }
        else {
            res.render('admin/edit_std', { data: std });
        }
    })
}

exports.admin_stdedit_put = function (req, res) {
    student.findByIdAndUpdate(req.params.id, req.body.obj, { new: true }, function (err, std) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/allstudents');
        }
        else {
            var obj = {
                email: req.body.obj.email
            };
            user.findByIdAndUpdate(inst.user, obj, { new: true }, function (err, nuser) {
                if (err) {
                    console.log(err);
                    req.flash('error', err.message);
                    res.redirect('/allstudents');
                }
                else {
                    console.log(std);
                    console.log(nuser);
                    req.flash('success', "Student has been successfully updated!");
                    res.redirect('/allstudents');
                }
            })
        }
    })
}

exports.admin_stddel_get = function (req, res) {
    student.findById(req.params.id, function (err, std) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/allstudents');
        }
        else {
            res.render('admin/del_std', { data: std });
        }
    })
}

exports.admin_stddel_del = function (req, res) {
    student.findById(req.params.id, function (err, std) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/allstudents');
        }
        else {
            var id = std.user;
            student.findByIdAndRemove(req.params.id, function (err, student) {
                if (err) {
                    console.log(err);
                    req.flash('error', err.message);
                    res.redirect('/allstudents');
                }
                else {
                    user.findByIdAndRemove(id, function (err, nuser) {
                        if (err) {
                            console.log(err);
                            req.flash('error', err.message);
                            res.redirect('/allstudents');
                        }
                        else {
                            req.flash('success', 'Student has been successfully deleted!');
                            res.redirect('/allstudents');
                        }
                    })
                }
            })
        }
    })
}