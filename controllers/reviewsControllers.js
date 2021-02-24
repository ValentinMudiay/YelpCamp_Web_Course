const Campground = require('../models/campground'); //import Campground Schema
const Review = require('../models/review.js'); //import Review Schema

//---------- Campground Reviews Routes 
//(Create) Post the created review
module.exports.createReview = async (req, res) => {
    console.log("---Posting a review---");
    const{id,} = req.params;
    const theCampground = await Campground.findById(id); 
    const theReview = new Review(req.body.review);
    theReview.author = req.user._id;
    theCampground.reviews.push(theReview);
    await theReview.save();
    await theCampground.save();
    console.log("---The Reviewed comment:--- \n " + theCampground  + '\n --end of displayed campground--');
    //console.log("The comment added: " + theReview);
    req.flash('success', 'Successfuly made a new review');
    res.redirect(`/campgrounds/${theCampground._id}`);
}


//(Delete) Delete a Review of a Campground
module.exports.deleteReview = async (req, res, next) => {
    console.log("---Deleting a review---");
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    console.log("Delete Successful");
    req.flash('success', 'Successfuly deleted a review');
    res.redirect(`/campgrounds/${id}`);
}