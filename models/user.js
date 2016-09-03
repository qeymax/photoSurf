var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    profileID: String,
    name: String,
    picture: String,
    link: String,
    uploads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Photo"
        }
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Photo"
        }
    ]
});

module.exports = mongoose.model("User", userSchema);