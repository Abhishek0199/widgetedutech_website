var express = require('express');
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var indexController = require('../controllers/indexController.js');
/* GET home page. */
router.get('/',  indexController.home_get );
router.get('/student',  indexController.student_home_get );
router.get('/beinstructor',  indexController.instructor_register_get );
router.post('/beinstructor', indexController.instructor_register_post );
router.get('/login', indexController.login_get );

router.get('/adminregister', indexController.admin_register_get);
router.post('/adminregister', indexController.admin_register_post);
router.get('/allinstructors', indexController.instructor_all);
router.get('/allstudents', indexController.students_all);
router.get('/admin/home', indexController.admin_home_get);
router.get('/admin/:id/instructor/edit', indexController.admin_instedit_get);
router.put('/admin/:id/instructor/edit', indexController.admin_instedit_put);
router.get('/admin/:id/instructor/delete', indexController.admin_instdel_get);
router.delete('/admin/:id/instructor/delete', indexController.admin_instdel_del);
router.get('/admin/:id/student/edit', indexController.admin_stdedit_get);
router.put('/admin/:id/student/edit', indexController.admin_stdedit_put);
router.get('/admin/:id/student/delete', indexController.admin_stddel_get);
router.delete('/admin/:id/student/delete', indexController.admin_stddel_del);

router.get('/feedback', indexController.feedback_get );
router.post('/feedback', indexController.feedback_post );

router.get('/about-us', indexController.about_us_get);
router.get('/contact-us', indexController.contact_us_get);

router.get('/verify-email', indexController.verify_email_get);
router.post('/verify-email', indexController.verify_email_post);

router.get('/student/my-account', indexController.student_my_account_get);
router.get('/instructor/my-profile', indexController.instructor_my_profile_get);

router.post("/login", indexController.login_post);

router.get('/studentregister', indexController.student_register_get);
router.post('/studentregister', indexController.student_register_post);

router.get('/courses', indexController.courseStructure);

//router.get('/settings', indexController.settings);

router.get('/logout', indexController.logout);

router.get('/ping', indexController.ping);

module.exports = router;
