var passport = require("passport");
var facebookStrategy = require("passport-facebook");
var User = require("../models/user");

var fbStrategy = new facebookStrategy({
    clientID: process.env.APPID || "",
    clientSecret: process.env.APPSECRET || "",
    callbackURL:  "https://photosurf.herokuapp.com/auth/facebook/callback",
    profileFields: ["id", "displayName", 'picture.width(999)' , "link"]
}, function (accessToken, refreshToken, profile, done) {
    User.findOne({ "profileID": profile.id }, function (err, user) {
        if (user) {
            done(null, user);
        } else {
            var newUser = new User({
                profileID: profile.id,
                name: profile.displayName,
                picture: profile.photos[0].value || "",
                link: profile.profileUrl
            });
            newUser.save(function (err) {
                done(null, newUser);
            });
        }
    })
    });

module.exports = fbStrategy;