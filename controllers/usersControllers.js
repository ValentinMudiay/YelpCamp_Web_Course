const User = require('../models/user');

//----- Register
module.exports.renderRegisterForm =  (req, res) => {
    res.render('users/register');
}

module.exports.registerUser = async (req, res, next) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        console.log(registeredUser);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch(e) {
        req.flash('error' , e.message);
        res.redirect('/register');
    }
}

//----- Login In
module.exports.renderLoginForm =  (req, res) => {
    res.render('users/login');
}

module.exports.loginUser =  (req, res) => {
    req.flash('sucess', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);

}

module.exports.logoutUser =  (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
}