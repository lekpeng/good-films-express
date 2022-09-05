const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  hash: {
    type: String,
    required: true,
  },

  followingIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  reviewIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

const User = mongoose.model("User", userSchema); //User is converted to users as the collection name

module.exports = User;
