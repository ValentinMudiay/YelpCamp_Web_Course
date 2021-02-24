//File to modify the database with seed information
const mongoose = require('mongoose'); //Import Mongoose
const cities = require('./cities.js');
//const {places, descriptors} = require('./seedHelper.js')


const Campground = require('../models/campground.js'); //import Campground Schema
const Review = require('../models/review.js'); //import Campground Schema
const { descriptors, places } = require('./seedHelper.js');
mongoose.connect('mongodb://localhost:27017/yelpCamp', {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true
} );

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected for seeds index");
})


const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    await Review.deleteMany({});
    for(let i = 0; i < 300; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: '6024010423b7a61bc0c7eee3', //user id
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            //image: 'https://source.unsplash.com/collection/483251',
            image: [
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png',
                    filename: 'YelpCamp/ahfnenvca4tha00h2ubt'
                },
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png',
                    filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi'
                }
            ],
            description: '  Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusantium vitae aperiam illum sunt odio asperiores! Ipsum cumque deserunt delectus, porro veritatis id. Perspiciatis, natus! Enim, eum? Velit natus nihil alias.  Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusantium vitae aperiam illum sunt odio asperiores! Ipsum cumque deserunt delectus, porro veritatis id. Perspiciatis, natus! Enim, eum? Velit natus nihil alias.',
            price: price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    console.log("Databased Closed for seeds index");
    mongoose.connection.close();
});