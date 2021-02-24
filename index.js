// if(process.env.NODE_ENV !== "production") { //if you are running in development mode 
//     require('dotenv').config();     //require the dotenv and add it to your program
// }
require('dotenv').config();     //require the dotenv and add it to your program

// mongodb+srv://vmudiay:<password>@cluster-yelpcamp.3di2u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
// console.log(process.env.CLOUDINARY_CLOUD_NAME);
// console.log(process.env.KEYTWO);

const express = require('express'); //Import Express
const app = express();
const path = require('path'); //Import path for Views
const mongoose = require('mongoose'); //Import Mongoose
const ejsMate = require('ejs-mate');
const session = require('express-session'); // import express-session
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport'); //allows us to plugin multiple strategies for authentication
const LocalStrategy = require('passport-local');
const helmet = require('helmet') //deals with http;
const mongoSanitize = require('express-mongo-sanitize'); 

const dbUrl = process.env.DB_URL ||  'mongodb://localhost:27017/yelpCamp'; // virtual mongodb atlas link --> mongodb+srv://vmudiay:<password>@cluster-yelpcamp.3di2u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
// const dbUrl = 'mongodb://localhost:27017/yelpCamp';

const User = require('./models/user'); //user model used for passport
app.get('/fakeUser', async(req, res) => {
    const user = new User({email: 'vmudiay@gmail.com', username: 'tino', });
    const newUser = await User.register(user, 'monkey');
    res.send(newUser);
})
const campgroundsRoutes = require('./routes/campgroundsRoutes'); //import the campground routes
const reviewsRoutes = require('./routes/reviewsRoutes'); //import reviews routes
const usersRoutes = require('./routes/usersRoutes'); //import user routes6
const { contentSecurityPolicy } = require('helmet');
const MongoStore = require('connect-mongo').default;

// // _____ Connect to Local Mongo Database for YelpCamp _____
// mongoose.connect('mongodb://localhost:27017/yelpCamp', {
//     useNewUrlParser: true, 
//     useUnifiedTopology: true,
//     useCreateIndex: true,
//     useFindAndModify: false
// } );

//_____ Connect to Virtual MongoDB Atlas for YelpCamp ||  Local Mongo Database for YelpCamp_____
mongoose.connect(dbUrl, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
} );

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})


// _____ Configure App() _____
//Set the EJS Views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.engine('ejs', ejsMate);

// _____ Middleware _____
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public') ) );
app.use(mongoSanitize({replaceWith: '_'}));

const secret = process.env.SECRET ||'thisshouldbeabettersecret';
//MongoStore 
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 //time period in seconds - if data remains the same, update to this set frequency times instead of constantly updating
});

store.on('error', function(error) {     //catch errors
    console.log( "Session Store Error", error);
  });

// _____ Configure Sessions _____
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true, //only allows the cookie session to work on https secure 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

//Set flash  
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({contentSecurityPolicy: false})); // set helmet with custom contentSecurityPolicy 

//Content Security Policy set for helmet tells you what srcs are allowed
//If you add things from different srcs modify this section
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({  //replace content security policy defaults
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://res.cloudinary.com/df5amrxdm/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



//Set Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate() ) );

passport.serializeUser(User.serializeUser() ); // serialization = how to store a user data into a session
passport.deserializeUser(User.deserializeUser()); // deserializeUser = how to unstore a user data from a session

//Set the flash
app.use((req, res, next) => {
    // console.log("Flash Req is ...", req.user);
    // console.log("Current Flash User ... " , res.locals.currentUser);
    //console.log("Req.Session ... " , req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success'); //gives access to the flash via the locals.success which is accessible in all templates
    res.locals.error = req.flash('error');
    next();
})



//---------- Home Route
app.get('/', (req, res) => {
    res.render('home.ejs');
})

//---------- Register Pages
// (Get) Get register page - /register

//(Post) Create the registered user 

//---------- Campground Routes
app.use('/campgrounds', campgroundsRoutes);

//---------- Campground Reviews Routes 
app.use('/campgrounds/:id/reviews', reviewsRoutes);

//---------- Users Routes 
app.use('/', usersRoutes);

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





