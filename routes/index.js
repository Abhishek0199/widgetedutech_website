var express = require('express');
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var fileUpload = require('express-fileupload');
var indexController = require('../controllers/indexController.js');
router.use(fileUpload());
/* GET home page. */
//router.get('/oauthcallback', indexController.oauthcallback);
router.get('/test', indexController.test);
router.get('/',  indexController.home_get );
router.get('/student', isLoggedin_std, indexController.student_home_get );
router.get('/beinstructor',  indexController.instructor_register_get );
router.post('/beinstructor', indexController.instructor_register_post );
router.get('/login', indexController.login_get );

router.get('/adminregister', isLoggedin_adm, indexController.admin_register_get);
router.post('/adminregister', isLoggedin_adm, indexController.admin_register_post);
router.get('/allinstructors', isLoggedin_adm, indexController.instructor_all);
router.get('/allstudents', isLoggedin_adm, indexController.students_all);
router.get('/admin/home', isLoggedin_adm, indexController.admin_home_get);
router.get('/admin/:id/instructor/edit', isLoggedin_adm, indexController.admin_instedit_get);
router.put('/admin/:id/instructor/edit', isLoggedin_adm, indexController.admin_instedit_put);
router.get('/admin/:id/instructor/delete', isLoggedin_adm, indexController.admin_instdel_get);
router.delete('/admin/:id/instructor/delete', isLoggedin_adm, indexController.admin_instdel_del);
router.get('/admin/:id/student/edit', isLoggedin_adm, indexController.admin_stdedit_get);
router.put('/admin/:id/student/edit', isLoggedin_adm, indexController.admin_stdedit_put);
router.get('/admin/:id/student/delete', isLoggedin_adm, indexController.admin_stddel_get);
router.delete('/admin/:id/student/delete', isLoggedin_adm, indexController.admin_stddel_del);

router.get('/feedback', indexController.feedback_get );
router.post('/feedback', indexController.feedback_post );

router.get('/about-us', indexController.about_us_get);
router.get('/contact-us', indexController.contact_us_get);

router.get('/verify-email', indexController.verify_email_get);
router.post('/verify-email', indexController.verify_email_post);
router.get('/student/my-account', indexController.student_my_account_get);
router.get('/instructor/my-profile', indexController.instructor_my_profile_get);
router.get('/student/doubt-book', isLoggedin_std, indexController.doubtbook_get);
router.post('/student/doubt-book', isLoggedin_std, indexController.doubtbook_post);

router.post("/login", indexController.login_post);

router.get('/studentregister', indexController.student_register_get);
router.post('/studentregister', indexController.student_register_post);
router.get('/instructor/schedule',isLoggedin_inst, indexController.instructor_schedule_get);
router.post('/instructor/schedule', isLoggedin_inst, indexController.instructor_schedule_post);
router.get('/instructor/start', isLoggedin_inst, indexController.instructor_start);

router.get('/courses', indexController.courseStructure);

//router.get('/settings', indexController.settings);

router.get('/logout', indexController.logout);

router.get('/ping', indexController.ping);

function isLoggedin_inst(req, res, next){
  if(req.isAuthenticated()){
    if(req.user.userType == 'instructor'){
      next();
    }
    else{
      req.flash('error', 'Access Denied! Please Login to Continue!');
      res.redirect('/logout');
    }
  }
  else{
    req.flash('error', 'Please Login to Continue!');
    res.redirect('/login');
  }
}

function isLoggedin_std(req, res, next){
  if(req.isAuthenticated()){
    if(req.user.userType == 'student'){
      next();
    }
    else{
      req.flash('error', 'Access Denied! Please Login to Continue!');
      res.redirect('/logout');
    }
  }
  else{
    req.flash('error', 'Please Login to Continue!');
    res.redirect('/login');
  }
}

function isLoggedin_adm(req, res, next){
  if(req.isAuthenticated()){
    if(req.user.userType == 'admin'){
      next();
    }
    else{
      req.flash('error', 'Access Denied! Please Login to Continue!');
      res.redirect('/logout');
    }
  }
  else{
    req.flash('error', 'Please Login to Continue!');
    res.redirect('/login');
  }
}

module.exports = router;
