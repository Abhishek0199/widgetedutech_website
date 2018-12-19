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

router.get('/feedback', indexController.feedback_get );
router.post('/feedback', indexController.feedback_post );

router.get('/about-us', indexController.about_us_get);

router.get('/verify-email', indexController.verify_email_get);
router.post('/verify-email', indexController.verify_email_post);

router.get('/student/my-account', indexController.student_my_account_get);
router.get('/instructor/my-profile', indexController.instructor_my_profile_get);

router.post("/login", passport.authenticate("local",  {
                                   failureRedirect: '/login', failureFlash: 'Invalid username or password.' }), function(req, res){
		 var foundUser = User.findOne({username : req.body.username}).populate("foundUser").exec(function(err, foundUser){
        if(err || !foundUser){
            console.log(err);
        }
        /*if(foundUser.verified === false )
		{
			console.log("User not verified later!");
			return res.render("verify", {username: foundUser.username});

		}*/

		req.flash("success", "Hi User " + foundUser.username);
		session = req.session;
		session.user = foundUser;
		console.log("user verified")
        res.redirect("/");
    });
});

router.get('/register', indexController.register_get);

router.post('/newUserRegister', indexController.newUserRegister_post);

router.get('/courses', indexController.courseStructure);

//router.get('/settings', indexController.settings);

router.get('/logout', indexController.logout);

router.get('/ping', indexController.ping);

module.exports = router;
