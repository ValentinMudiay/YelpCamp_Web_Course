const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground'); //import Campground Schema 
const Review = require('./models/review.js'); //import Review Schema
const {joiCampgroundSchema, joiReviewSchema} = require("./schemas.js"); //the Joi Validations for campgroundschema and the review schema

const isLoggedIn = (req, res, next) => {
    console.log("Req.User ... " , req.user);
    if(!req.isAuthenticated()) {
        //store the url they are requesting
        //console.log(req.path, req.originalUrl); //see the url they are requesting
        req.session.returnTo = req.originalUrl; //method to redirect the user back to the url
        console.log("Return to ... " , req.session.returnTo);
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next()
}

// ---------- Campground Middlewares ----------
//Client Side Validation for Campground Schema
const validateCampground = (req, res, next) => {
    const result = joiCampgroundSchema.validate(req.body);
    console.log("The joi Campground Schema validation obj" + result);
    const {error} = result;
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError("Server side error for campground schema validation " + msg, 400);
    } else {
        next();
    }
}

//Campground Authorization Middleware
const checkCampAuthorization = async (req, res, next) => {
    const {id} = req.params;
    const foundCampground = await Campground.findById(id);
    if(! foundCampground.author.equals(req.user._id) ){ //check if the loggedin user matches author
        req.flash('error', 'You are not owner of this campground. You do not have permission to modify the campground.');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


// ---------- Reviews Middleware ----------
//Middleware Client Side Validation for Review Schema
const validateReview = (req, res, next) => {
    const result = joiReviewSchema.validate(req.body);
    console.log("The joi Review Schema validation obj" + result);
    const {error} = result;
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError("Server side error for Review Schema Validation " + msg, 400);
    } else {
        next();
    }
}

//Review Authorization Middleware
const checkReviewAuthorization = async (req, res, next) => {
    const {id, reviewId} = req.params;
    const foundReview = await Review.findById(reviewId);
    if(! foundReview.author.equals(req.user._id) ){ //check if the loggedin user matches author
        req.flash('error', 'You are not owner of this review. You do not have permission to modify the review.');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


module.exports.isLoggedIn = isLoggedIn;
module.exports.validateCampground = validateCampground;
module.exports.checkCampAuthorization = checkCampAuthorization;
module.exports.validateReview = validateReview;
module.exports.checkReviewAuthorization = checkReviewAuthorization;