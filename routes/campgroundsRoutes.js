const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const campgroundsCtrls = require('../controllers/campgroundsControllers');
const {isLoggedIn, validateCampground, checkCampAuthorization} = require('../middleware');  //import middlewares
var multer  = require('multer') //npm install multer -- used for file uploads to parse the data
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const {Campground} = require('../models/campground');

//(Read) Show All Campgrounds for the Index Home Page
router.get('/', catchAsync ( campgroundsCtrls.campsIndex));

// -- Create New Campground
//(Read) Get-Show form to create a new campground
router.get('/newCampground', isLoggedIn, campgroundsCtrls.renderNewCampForm );

//(Create) Post-Make the new campground
router.post('/', isLoggedIn,  upload.array('image'), validateCampground, catchAsync(campgroundsCtrls.createCampground));

// router.post('/', upload.array("image"), (req, res) => {
//     console.log("Req. body ... ", req.body);
//     console.log("Req.file ..." , req.file);
//     res.send("It worked");
// })

//-- View a Campground
// (Read) Get-Show an individual campground
router.get('/:id', catchAsync( campgroundsCtrls.viewCampground))

// -- Edit a campground
//(Read) Get-Show form to edit a campground
router.get('/:id/edit', isLoggedIn, checkCampAuthorization, catchAsync( campgroundsCtrls.renderEditCampForm))

//(Update) Edit a campground 
router.put('/:id', isLoggedIn,  checkCampAuthorization, upload.array('image'), validateCampground, catchAsync( campgroundsCtrls.editCampground))

//(Delete) Delete a campground
router.delete('/:id', checkCampAuthorization, catchAsync( campgroundsCtrls.deleteCampground))

module.exports = router;

