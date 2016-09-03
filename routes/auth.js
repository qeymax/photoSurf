var express = require("express");
var router = express.Router();
var passport = require("passport");
var middleware = require("../middleware");


router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});

router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

module.exports = router;