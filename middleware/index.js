var middleware = {};
var multer = require("multer");
var forge = require("node-forge");
var path = require("path");


middleware.multer = {};

middleware.multer.storage = multer.diskStorage({
    destination: './public/bucket/',
    filename: function (req, file, cb) {
        forge.random.getBytes(32, function (err, bytes) {
            if (err) return cb(err)

            cb(null, forge.util.bytesToHex(bytes) + path.extname(file.originalname))
        })
    }
});

middleware.multer.fileFilter = function(req, file, cb) {
    mimeTypes = ["image/bmp", "image/emf", "image/png", "image/jpeg", "image/gif"];
    if (mimeTypes.indexOf(file.mimetype) >= 0) {
        console.log("image uploaded");
        cb(null, true);
    } else {
        console.log("failed to upload");
        cb(null, false);
    }    
}

middleware.multer.maxSize = 2097152;



middleware.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.send({error : "login required"});
}










module.exports = middleware;