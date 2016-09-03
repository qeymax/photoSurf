var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var User = require("../models/user");
var Photo = require("../models/photo");
var mongoose = require("mongoose");


router.get("/", function (req, res) {
    Photo.find().sort("-date").limit(10).populate("user").exec(function (err, photos) {
        res.render("index", { photos: photos });
    });
    
});


router.get("/search", function (req, res) {
    if (req.query.searchcategory == "category") {
        Photo.find({ name: { $regex : req.query.search } })
        .sort("-date").skip(0).limit(10).populate("user").exec(function (err, photos) {
            res.render("search", { photos: photos });
        });
    } else {
        Photo.find({ name: { $regex : req.query.search } }).where('category').equals(req.query.searchcategory)
        .sort("-date").skip(0).limit(10).populate("user").exec(function (err, photos) {
            res.render("search", { photos: photos });
        });
    }  
});

router.get("/user/:id", function (req, res) {
    User.findById(req.params.id).populate("uploads").exec(function (err, user) {
        var uploads = user.uploads;
        uploads.splice(10, uploads.length - 10);
        res.render("profile", { user: user  , photos : uploads }); 
    });
});

router.get("/user/:id/likes", function (req , res) {
    User.findById(req.params.id).populate("likes").exec(function (err, user) {
       
        var likes = user.likes;
        likes.splice(10, likes.length - 10);
        res.render("profilelikes", { user: user  ,  photos : likes}); 
    });
});


module.exports = router;