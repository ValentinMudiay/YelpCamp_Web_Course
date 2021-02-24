const express = require('express');
const router = express.Router({ mergeParams: true }); //gives access to the id params in the routes 
const catchAsync = require('../utils/catchAsync');
const ReviewCtrls = require('../controllers/reviewsControllers');
const {isLoggedIn, validateReview, checkReviewAuthorization} = require('../middleware'); //import middlewares Client Side Validation for Review Schema
const ExpressError = require('../utils/ExpressError');



//---------- Campground Reviews Routes 
//(Create) Post the created review
router.post('/', isLoggedIn, validateReview, catchAsync(ReviewCtrls.createReview));

//(Delete) Delete a Review of a Campground
router.delete('/:reviewId', isLoggedIn, checkReviewAuthorization, catchAsync( ReviewCtrls.deleteReview));

module.exports = router;