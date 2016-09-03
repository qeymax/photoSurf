var express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    multer = require("multer"),
    forge = require("node-forge"),
    path = require("path"),
    middleware = require("./middleware"),
    User = require("./models/user"),
    Photo = require("./models/photo"),
    passport = require("passport"),
    fbStrategy = require("./middleware/fb-auth"),
    bodyParser = require("body-parser")

var mainRoutes = require("./routes/main");
var authRoutes = require("./routes/auth");
var ajaxRoutes = require("./routes/ajax");


var url = process.env.URL || "mongodb://qeymax:sallam2100@ds019976.mlab.com:19976/photosurfdev";
mongoose.connect(url);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));    
app.set("view engine", "ejs");
app.use(require("express-session")({
    secret: process.env.SECRETWORD || "this is the secret !!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(fbStrategy);
passport.serializeUser(function (user, done) {
        done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});




Photo.remove({}, function (err) {
    console.log("removed");
});    


  

app.use(mainRoutes);
app.use(authRoutes);
app.use(ajaxRoutes);




app.listen(process.env.PORT || 3000, function () {
    console.log("server started")
});

