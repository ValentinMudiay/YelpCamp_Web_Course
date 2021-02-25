const Campground = require('../models/campground'); //import Campground Schema 
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

//(Read) Show All Campgrounds for the Index Home Page
module.exports.campsIndex = async (req, res, next) => {
    const campgrounds = await Campground.find({}); 
    console.log("--- Viewing all campgrounds. Campground object ...");
    // console.log("Image filename ... " , campgrounds[0].image.filename);
    // console.log("Image url ... ", campgrounds[0].image.url);
    //---- use to populate geodata for campgrounds after reseeding all of them
    //  let totalCamps = 0;
    // for (let campground of campgrounds) {
    //     const geoData = await geocoder.forwardGeocode({ query: campground.location, limit: 1 }).send();
    //     console.log("Longitude: ", geoData.body.features[0].geometry.coordinates[0]);
    //     console.log("Latitude: ", geoData.body.features[0].geometry.coordinates[1]);
    //     campground.geometry = geoData.body.features[0].geometry; //add the geoJSON data for location to the campground instance
    //     await campground.save();
    //     console.log(campground.title);
    //     totalCamps ++;
    // }
    // console.log(totalCamps); //-------------------------------
    res.render('campgrounds/index.ejs', {campgrounds});
}

// -- Create New Campground
//(Read) Get form to create a new campground
module.exports.renderNewCampForm = (req, res) => {
    console.log("---About to make a new campground---");
    res.render('campgrounds/newCampground.ejs');
}
//(Create) Post the created campground
module.exports.createCampground = async(req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    console.log("Longitude: ", geoData.body.features[0].geometry.coordinates[0]);
    console.log("Latitude: ", geoData.body.features[0].geometry.coordinates[1]);
    //res.send("ok");
    // ...if(!req.body.campground) throw new ExpressError('Invalid campground data', 400);
    console.log("---New Campground being made -Req.body ...\n", req.body, '\n---end of create campground req body.');
    const newCampground = new Campground(req.body.campground); //create new campground entity
    newCampground.geometry = geoData.body.features[0].geometry; //add the geoJSON data for location to the campground instance
    newCampground.image = req.files.map( f => ({url: f.path, filename: f.filename}));
    newCampground.author = req.user._id; //save the user id that is logged in and set it to the author id
    await newCampground.save();
    console.log("--- Displaying the New Campground ...", newCampground);
    console.log("--- End of new campground body. Successfully made new campground.");
    req.flash('success', 'Successfuly made a new campground');
    res.redirect(`/campgrounds/${newCampground._id}`); 
}

//-- View a Campground
// (Read) Show individual campgrounds 
module.exports.viewCampground = async (req, res, next) =>{
    const {id} = req.params; 
    console.log("--- My id is", id); //see the camp id
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews', //populate all of the reviews from the reviews array on the campground that we are on
        populate: {
            path: 'author' //populate the author for each of the reviews 
        }
    }).populate('author'); //populate the author of the campground we are on
    if(!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    console.log("--- Campground currently being viewed ... ", campground, " --- End of viewed campground object"); //for testing
    console.log("---Coordinated Geometry ... ", campground.geometry.coordinates);
    res.render('campgrounds/showCampground.ejs', {campground});
}

// -- Edit a campground
//(Read) Get-Show form to edit a campground
module.exports.renderEditCampForm = async (req, res, next) => {
    console.log("--- Selected campground to edit---");
    const {id} = req.params;
    const foundCampground = await Campground.findById(id);
    if(!foundCampground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    console.log("---The campground being edited is --- \n" + foundCampground + '\n --end of displayed pre-edit campground--');
    res.render('campgrounds/editCampground.ejs', {foundCampground})
}
//(Update) Edit a campground 
module.exports.editCampground = async (req, res, next) => {
    console.log("Editing the campground");
    const {id} = req.params;
    console.log("--- Campground selected for edit ...", req.body);
    // const foundCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground}, {runValidators: true, new: true});
    const foundCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    foundCampground.image.push(...imgs);
    await foundCampground.save();
    if (req.body.deleteImages) { // if any images are selected for deletion
        for (let filename of req.body.deleteImages) { //for each selected image
            await cloudinary.uploader.destroy(filename); //delete the image file from the cloudinary server storage
        }
        await foundCampground.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } }) //pull all elements from the image array with a filename that is in deleteImages
    }

    console.log("--The campground after the edit:--" + foundCampground  + '\n --end of displayed post-edit campground--'); 
    req.flash('success', 'Successfuly updated a new campground');
    res.redirect(`/campgrounds/${foundCampground._id}`)
}

// -- Delete a campground
//(Delete) Delete a campground
module.exports.deleteCampground = async (req, res, next) => {
    const {id} = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    console.log("---Delete Successful---");
    console.log("---Deleted Campground: --- \n" + deletedCampground  + '\n --end of deleted campground--');
    req.flash('success', 'Successfuly updated a new campground');
    res.redirect('/campgrounds');
}
