const express = require('express'); //Import Express
const path = require('path'); //Import path for Views
const mongoose = require('mongoose'); //Import Mongoose
const ejsMate = require('ejs-mate');
// const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

const methodOverride = require('method-override');
const {joiCampgroundSchema} = require("./schemas.js"); //the Joi Validations for campgroundschema 
const {joiReviewSchema} = require("./schemas.js") // the joi validations for review schema


const Campground = require('./models/campground.js'); //import Campground Schema
const Review = require('./models/review.js'); //import Review Schema
mongoose.connect('mongodb://localhost:27017/yelpCamp', {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true
} );

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();

//Set the EJS Views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.engine('ejs', ejsMate);

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));


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
//Client Side Validation for Review Schema
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


//---------- Campground Routes
app.get('/', (req, res) => {
    res.render('home.ejs');
})

//(Read) Show All Campgrounds for the Index Home Page
app.get('/campgrounds', catchAsync ( async (req, res, next) => {
    const campgrounds = await Campground.find({}); 
    res.render('campgrounds/index.ejs', {campgrounds});
}))

//(Create) Make new campground
app.get('/campgrounds/newCampground', (req, res) => {
    console.log("---About to make a new campground---");
    res.render('campgrounds/newCampground.ejs');
})
//(Create) Post the created campground
app.post('/campgrounds', validateCampground, catchAsync( async(req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid campground data', 400);
    console.log("---New Campground is made---")
    console.log(req.body  + '\n --end of displayed campground--');
    const newCampground = new Campground(req.body.campground );
    await newCampground.save();
    console.log(newCampground  + '\n --end of displayed campground--');
    res.redirect(`/campgrounds/${newCampground._id}`); 
}))

// (Read) Show individual campgrounds 
app.get('/campgrounds/:id', catchAsync( async (req, res, next) =>{
    const {id} = req.params; 
    console.log("My id is");
    console.dir(id); //see the camp id

    const campground = await Campground.findById(req.params.id).populate('reviews');
    // console.log("---The campground page you are currently displaying is for: --- " + campground + '\n --end of displayed campground--'); //for testing
    res.render('campgrounds/showCampground.ejs', {campground});
}))

//(Update) Edit a campground 
app.get('/campgrounds/:id/edit', catchAsync( async (req, res, next) => {
    console.log("--- Selected campground to edit---");
    const {id} = req.params;
    const foundCampground = await Campground.findById(id);
    console.log("---The campground being edited is --- \n" + foundCampground + '\n --end of displayed campground--');
    res.render('campgrounds/editCampground.ejs', {foundCampground})
}))

app.put('/campgrounds/:id', catchAsync( async (req, res, next) => {
    console.log("Editing the campground");
    const {id} = req.params;
    const foundCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground}, {runValidators: true, new: true});
    console.log("--The campground after the edit:--" + foundCampground  + '\n --end of displayed campground--'); 
    res.redirect(`/campgrounds/${foundCampground._id}`)
}))

//(Delete) Delete a campground
app.delete('/campgrounds/:id', catchAsync( async (req, res, next) => {
    const {id} = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    console.log("---Delete Successful---");
    console.log("---Deleted Campground: --- \n" + deletedCampground  + '\n --end of deleted campground--');
    res.redirect('/campgrounds');
}))

//---------- Campground Reviews Routes 
//(Create) Post the created review
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    console.log("---Posting a review---");
    const{id,} = req.params;
    const theCampground = await Campground.findById(id); 
    const theReview = new Review(req.body.review);
    theCampground.reviews.push(theReview);
    await theReview.save();
    await theCampground.save();
    console.log("---The Reviewed comment:--- \n " + theCampground  + '\n --end of displayed campground--');
    //console.log("The comment added: " + theReview);
    res.redirect(`/campgrounds/${theCampground._id}`);
}))

//(Delete) Delete a Review of a Campground
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync( async (req, res, next) => {
    console.log("---Deleting a review---");
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    console.log("Delete Successful");
    res.redirect(`/campgrounds/${id}`);
}))


//---------- Error Catching
app.all('*', (req, res, next) => {
    // res.send("404!!!");
    next(new ExpressError('Page not found', 404 ));
})


//Error Handling Middleware
app.use((err, req, res, next) => {
    if(!err.message) err.message = "Oh No, Something went wrong!";
    const {statusCode = 500, message} = err;
    console.log(statusCode, err.stack, )
    
    res.status(statusCode).render('error', {statusCode, message});
    // res.send("Oh boy, something went wrong!");
})

app.listen(3000, () => {
    console.log("Listening on Port 3000!")
})