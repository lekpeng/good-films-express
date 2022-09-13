const axios = require("axios");
const cors = require("cors");
const Review = require("../models/review");
const User = require("../models/user");

module.exports = {
  submitRating: async (req, res) => {
    const currentUserAuthDetails = res.locals.userAuth;
    const currentUserUsername = currentUserAuthDetails.data.username;
    const movieApiId = req.params.movieApiId;
    const userRating = req.body;

    // find user
    const user = await User.findOne({ username: currentUserUsername });

    if (!user) {
      return res.status(404).json({ error: `User ${currentUserUsername} does not exist!` });
    } else {
      try {
        await User.findOneAndUpdate(user.reviewIds, {
          $push: {
            movieId: movieApiId,
            rating: userRating,
          },
        });
      } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Failed to rate movie" });
      }
    }
  },

  updateLikes: async (req, res) => {
    const reviewId = req.body.reviewId;
    const currentUserAuthDetails = res.locals.userAuth;
    const currentUserUsername = currentUserAuthDetails.data.username;

    const currentUser = await User.findOne({ username: currentUserUsername });

    if (!currentUser) {
      return res.status(404).json({ error: `Username ${currentUserUsername} does not exist!` });
    }

    try {
      let review;
      if (req.url === "/like") {
        review = await Review.findOneAndUpdate(
          { _id: reviewId },
          {
            $addToSet: { userIdsWhoLiked: currentUser._id },
          },
          { new: true }
        );
      } else {
        review = await Review.findOneAndUpdate(
          { _id: reviewId },
          {
            $pull: { userIdsWhoLiked: currentUser._id },
          },
          { new: true }
        );
      }

      if (!review) {
        return res.status(404).json({ error: `Review Id ${reviewId} does not exist!` });
      }
    } catch (err) {
      return res.status(500).json({
        error: `Failed to update ${currentUserUsername}'s like status of review with Id ${reviewId}`,
      });
    }
  },
};
