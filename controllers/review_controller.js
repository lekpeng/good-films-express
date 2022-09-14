const axios = require("axios");
const cors = require("cors");
const Review = require("../models/review");
const User = require("../models/user");
const Movie = require("../models/movie");

module.exports = {
  submitRating: async (req, res) => {
    const currentUserAuthDetails = res.locals.userAuth;
    const currentUserUsername = currentUserAuthDetails.data.username;
    const movieReviewed = req.params.movieApiId;
    const userRating = req.body.rating;
    const userReview = req.body.review.text;

    const movieExists = await Movie.findOne({ movieApiId: movieReviewed });
    console.log("Movie:", movieExists);

    // check if movieId exists in DB

    // if doesn't exist, create a new movie doc

    if (!movieExists) {
      try {
        await Movie.create({
          movieApiId: movieReviewed,
          reviewIds: {
            movieId: movieReviewed,
            reviewText: userReview,
            rating: userRating,
          },
        });
      } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Unable to create movie review" });
      }
    }
  },

  //   try {
  //     // find user
  //     const user = await User.findOneAndUpdate(
  //       { username: currentUserUsername },
  //       {
  //         $push: {
  //           reviewIds: {
  //             movieId: movieApiId,
  //             rating: userRating,
  //           },
  //         },
  //       }
  //     );

  //     if (!user) {
  //       res.status(404);
  //       return res.json({ error: `User ${user} does not exist!` });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(400).json({ error: "Failed to rate movie" });
  //   }

  //   console.log("Rating:", userRating.rating);
  //   console.log("User:", user);
  //   console.log("Current User Name:", currentUserUsername);
  // },

  updateLikes: async (req, res) => {
    const reviewId = req.body.reviewId;
    const currentUserAuthDetails = res.locals.userAuth;
    const currentUserUsername = currentUserAuthDetails.data.username;

    const currentUser = await User.findOne({ username: currentUserUsername });

    if (!currentUser) {
      return res
        .status(404)
        .json({ error: `Username ${currentUserUsername} does not exist!` });
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
        return res
          .status(404)
          .json({ error: `Review Id ${reviewId} does not exist!` });
      }
    } catch (err) {
      return res.status(500).json({
        error: `Failed to update ${currentUserUsername}'s like status of review with Id ${reviewId}`,
      });
    }
  },
};
