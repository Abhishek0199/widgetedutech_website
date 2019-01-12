var express = require('express');
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var fileUpload = require('express-fileupload');
var indexController = require('../controllers/indexController.js');
var indexController_std = require('../controllers/indexController_student.js');
var indexController_adm = require('../controllers/indexController_admin.js');
var indexController_inst = require('../controllers/indexController_instructor.js');
router.use(fileUpload());
/* General Pages*/
router.get('/',  indexController.home_get );

router.get('/login', indexController.login_get);
router.post("/login", indexController.login_post);

router.get('/logout', indexController.logout);

router.get('/ping', indexController.ping);

router.get('/courses', indexController.courseStructure);

router.get('/feedback', indexController.feedback_get);
router.post('/feedback', indexController.feedback_post);

router.get('/about-us', indexController.about_us_get);
router.get('/contact-us', indexController.contact_us_get);

router.get('/verify-email', indexController.verify_email_get);
router.post('/verify-email', indexController.verify_email_post);

//STUDENT SECTION
router.get('/student', isLoggedin_std, indexController_std.student_home_get );

router.get('/student/my-account', indexController_std.student_my_account_get);

router.get('/student/doubt-book', isLoggedin_std, indexController_std.doubtbook_get);
router.post('/student/doubt-book', isLoggedin_std, indexController_std.doubtbook_post);

router.get('/studentregister', indexController_std.student_register_get);
router.post('/studentregister', indexController_std.student_register_post);

router.get('/student/allvideos', isLoggedin_std, indexController_std.student_videos);


//ADMIN SECTION
router.get('/adminregister', isLoggedin_adm, indexController_adm.admin_register_get);
router.post('/adminregister', isLoggedin_adm, indexController_adm.admin_register_post);

router.get('/allinstructors', isLoggedin_adm, indexController_adm.instructor_all);

router.get('/allstudents', isLoggedin_adm, indexController_adm.students_all);

router.get('/admin/home', isLoggedin_adm, indexController_adm.admin_home_get);

router.get('/admin/:id/instructor/edit', isLoggedin_adm, indexController_adm.admin_instedit_get);
router.put('/admin/:id/instructor/edit', isLoggedin_adm, indexController_adm.admin_instedit_put);

router.get('/admin/:id/instructor/delete', isLoggedin_adm, indexController_adm.admin_instdel_get);
router.delete('/admin/:id/instructor/delete', isLoggedin_adm, indexController_adm.admin_instdel_del);

router.get('/admin/:id/student/edit', isLoggedin_adm, indexController_adm.admin_stdedit_get);
router.put('/admin/:id/student/edit', isLoggedin_adm, indexController_adm.admin_stdedit_put);

router.get('/admin/:id/student/delete', isLoggedin_adm, indexController_adm.admin_stddel_get);
router.delete('/admin/:id/student/delete', isLoggedin_adm, indexController_adm.admin_stddel_del);

//INSTRUCTOR SECTION
router.get('/beinstructor',  indexController_inst.instructor_register_get );
router.post('/beinstructor', indexController_inst.instructor_register_post );

router.get('/instructor/my-profile', indexController_inst.instructor_my_profile_get);

router.get('/instructor/schedule',isLoggedin_inst, indexController_inst.instructor_schedule_get);
router.post('/instructor/schedule', isLoggedin_inst, indexController_inst.instructor_schedule_post);

router.get('/instructor/start', isLoggedin_inst, indexController_inst.instructor_start);

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
