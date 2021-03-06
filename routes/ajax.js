var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var User = require("../models/user");
var Photo = require("../models/photo");
var mongoose = require("mongoose");
var multer = require("multer");
var cloudinary = require("cloudinary");
var fs = require("fs");

cloudinary.config({
    cloud_name: process.env.CLOUDNAME || '',
    api_key: process.env.APIKEY || '',
    api_secret: process.env.APISECRET || ''
});


var upload = multer({
    storage: middleware.multer.storage,
    fileFilter: middleware.multer.fileFilter,
    limits: { fileSize: middleware.multer.maxSize }
});

var upload = upload.single("file");

router.post("/upload", middleware.isLoggedIn, function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            console.log(err);
            res.send({ name: "error" });
        } else {
            if (req.file){
                if (req.body.name != "") {
                    cloudinary.uploader.upload(req.file.path, function(result) { 
                        console.log(result);
 
                            var photo = new Photo({
                            name: req.body.name,
                            link: result.secure_url,
                            category: req.body.category,
                            date: new Date(),
                            user: req.user
                            });
                            photo.save();
                            User.findById(req.user._id).exec(function (err, user) {
                                user.uploads.push(photo);
                                user.save();
                            });
                            fs.unlink(req.file.path);
                            res.send(photo);

                    });
                }
            } else {
                res.send({ name: "error" });
            }
        }
        
    })
       
});

router.post("/searchajax", function (req, res) {
    upload(req, res, function (err) {
        if (req.body.category == "category") {
            Photo.find({ name: { $regex: req.body.name } })
                .sort("-date").skip(req.body.skip).limit(10).populate("user").exec(function (err, photos) {
                    res.render("ajax", { photos: photos });
            });
        } else {
            Photo.find({ name: { $regex: req.body.name } }).where('category').equals(req.body.category)
                .sort("-date").skip(req.body.skip).limit(10).populate("user").exec(function (err, photos) {
                    res.render("ajax", { photos: photos });
            });
        }
    });
    
});

router.post("/userajax", function (req, res) {
    upload(req, res, function (err) {
        if (req.body.menu == "uploads") {
            User.findById(req.body.user).populate({ path: "uploads", populate: { path: 'user' } }).exec(function (err, user) {
                var uploads = user.uploads;
                uploads.splice(0, req.body.skip);
                uploads.splice(10, uploads.length - 10);
                photos = uploads;
                res.render("ajax", { photos: photos });
            });
        } else {
            User.findById(req.body.user).populate({ path: "likes", populate: { path: 'user' } }).exec(function (err, user) {
                var likes = user.likes;
                likes.splice(0, req.body.skip);
                likes.splice(10, likes.length - 10);
                photos = likes;
                res.render("ajax", { photos: photos });
            });
        }
    });   
});


router.post("/like", middleware.isLoggedIn ,  function (req, res) {
    upload(req, res, function (err) {
        if (req.body.like == "like") {
            Photo.findById(req.body.id).populate("likes").exec(function (err, photo) {
                User.findById(req.user._id).populate("likes").exec(function (err, user) {
                    if (photo.likes.indexOf(user) >= 0) {
                        //already liked
                    } else {
                        user.likes.push(photo);
                        photo.likes.push(user);
                        user.save();
                        photo.save();
                    } 
                });
            });    
        } else {
            
            Photo.findById(req.body.id).populate("likes").exec(function (err, photo) {
                var userIndex = photo.likes.indexOf(req.user);
                User.findById(req.user._id).populate("likes").exec(function (err, user) {
                    var photoIndex = user.likes.indexOf(photo);
                    photo.likes.splice(userIndex, 1);
                    user.likes.splice(photoIndex, 1);
                    photo.save();
                    user.save();
                });
            });
            
        }
    });
})



module.exports = router;