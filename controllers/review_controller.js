const axios = require("axios");
const cors = require("cors");
const Review = require("../models/review");
const User = require("../models/user");
const Comment = require("../models/comment");

module.exports = {
  showReview: async (req, res) => {
    const reviewId = req.params.reviewId;
    const review = await Review.findById(reviewId)
      .populate("authorUserId")
      .populate("userIdsWhoLiked")
      .populate("movieId")
      .populate({ path: "commentIds", populate: "authorUserId" })
      .lean();

    if (!review) {
      return res.status(404).json({ error: `Review with ID ${reviewId} does not exist!` });
    }

    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${review.movieId.movieApiId}?api_key=${process.env.API_KEY}`
      );
      const data = await response.data;
      review.movieTitle = data.title;
    } catch (err) {
      review.movieTitle = "This movie title is not available for some reason.";
    }

    return res.json(review);
  },
  submitRating: async (req, res) => {
    const currentUserAuthDetails = res.locals.userAuth;
    const currentUserUsername = currentUserAuthDetails.data.username;
    const movieApiId = req.params.movieApiId;
    const userRating = req.body.rating;

    try {
      // find user
      const user = await User.findOneAndUpdate(
        { username: currentUserUsername },
        {
          $push: {
            reviewIds: {
              movieId: movieApiId,
              rating: userRating,
            },
          },
        }
      );

      if (!user) {
        res.status(404);
        return res.json({ error: `User ${user} does not exist!` });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: "Failed to rate movie" });
    }

    console.log("Rating:", userRating.rating);
    console.log("User:", user);
    console.log("Current User Name:", currentUserUsername);
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
      const type = req.url.split("/")[2];
      if (type === "like") {
        review = await Review.findOneAndUpdate(
          { _id: reviewId },
          {
            $addToSet: { userIdsWhoLiked: currentUser._id },
          },
          { new: true }
        ).populate("userIdsWhoLiked");
      } else {
        review = await Review.findOneAndUpdate(
          { _id: reviewId },
          {
            $pull: { userIdsWhoLiked: currentUser._id },
          },
          { new: true }
        ).populate("userIdsWhoLiked");
      }

      if (!review) {
        return res.status(404).json({ error: `Review Id ${reviewId} does not exist!` });
      }

      return res.json(review);
    } catch (err) {
      return res.status(500).json({
        error: `Failed to update ${currentUserUsername}'s like status of review with Id ${reviewId}`,
      });
    }
  },
  createComment: async (req, res) => {
    const commentText = req.body.commentText;
    const reviewId = req.params.reviewId;
    const currentUserAuthDetails = res.locals.userAuth;
    const currentUserUsername = currentUserAuthDetails.data.username;

    const currentUser = await User.findOne({ username: currentUserUsername });

    if (!currentUser) {
      return res.status(404).json({ error: `Username ${currentUserUsername} does not exist!` });
    }

    try {
      const review = await Review.findById(reviewId);

      if (!review) {
        return res.status(404).json({ error: `Review with Id ${reviewId} does not exist!` });
      }
      const comment = await Comment.create({
        authorUserId: currentUser._id,
        commentText,
      });

      const updatedReview = await Review.findOneAndUpdate(
        { _id: reviewId },
        {
          $addToSet: { commentIds: comment._id },
        },
        { new: true }
      ).populate({ path: "commentIds", populate: "authorUserId" });

      return res.json(updatedReview);
    } catch (err) {
      console.log("err creating comment", err);
      return res.status(500).json({
        error: `Failed to post comment`,
      });
    }
  },
};
