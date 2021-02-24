const express = require('express');
const router = express.Router();
const passport = require('passport'); //allows us to plugin multiple strategies for authentication
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const UsersCtrls = require('../controllers/usersControllers');

//----- Register
router.get('/register', UsersCtrls.renderRegisterForm);

router.post('/register', catchAsync( UsersCtrls.registerUser));

//----- Login In
router.get('/login', UsersCtrls.renderLoginForm);

//passport.authentication middleware 
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),  UsersCtrls.loginUser); 

router.get('/logout', UsersCtrls.logoutUser);

module.exports = router;