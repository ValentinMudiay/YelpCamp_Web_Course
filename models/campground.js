const mongoose = require('mongoose');
const Review = require('./review.js'); //import Review Schema
const Schema = mongoose.Schema;

// https://res.cloudinary.com/douqbebwk/image/upload/w_300/v1600113904/YelpCamp/gxgle1ovzd2f3dgcpass.png

const ImageSchema = new Schema({
    url: String,
    filename: String
});
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON : { virtuals: true } };

const campgroundSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    image: [ImageSchema],
    price: Number,
    description: String,
    geometry: {     //used for geolocation geoJSON
        type: {
            type: String,   //Don't do `{ location : { type: String }}`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }, 
    reviews: [
        {
            type: Schema.Types.ObjectID,
            ref: 'review'
        }
    ]
}, opts) ;

campgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `
        <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
        <p>${this.description.substring(0, 20)}...</p>`
})

// campgroundSchema.pre('findOneAndDelete', async function (data) {
//     console.log("Pre Middleware");
//     console.log(data);
// })
campgroundSchema.post('findOneAndDelete', async function (deletedCampground) { //post middle ware to delete a Campground and all its reviews
    console.log("Post Middleware");
    //console.log(deletedCampground);
    if(deletedCampground.reviews.length){
        const res =  Review.deleteMany({
            _id: { 
                $in: deletedCampground.reviews 
            } 
        }); //delete all reviews that has an id within the deleted campground
        console.log(res);
    }
    
})

const Campground = mongoose.model('campground', campgroundSchema);

module.exports = Campground;

