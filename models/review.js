const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },

    userIdsWhoLiked: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    commentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],

    reviewText: {
      type: String,
    },

    rating: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
