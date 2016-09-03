var mongoose = require("mongoose");

photoSchema = new mongoose.Schema({
    name: String,
    link: String,
    category: String,
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    date: Date,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

module.exports = mongoose.model("Photo", photoSchema);