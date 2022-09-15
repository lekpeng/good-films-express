const axios = require("axios");
const cors = require("cors");
const Review = require("../models/review");
const User = require("../models/user");
const Movie = require("../models/movie");
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

  createReview: async (req, res) => {
    const currentUserAuthDetails = res.locals.userAuth;
    const currentUserUsername = currentUserAuthDetails.data.username;
    const movieReviewedId = req.params.movieApiId;
    const userRating = req.body.rating;
    const userReview = req.body.review.text;

    const currentUser = await User.findOne({ username: currentUserUsername });
    const movieExists = await Movie.findOne({
      movieApiId: movieReviewedId,
    });
    console.log("Current User", currentUser);
    console.log("Movie", movieExists);

    // Function to create new review document and tag it to Movie and User
    const tagReview = async (newMovie) => {
      const newReview = await Review.create({
        movieId: newMovie._id,
        authorUserId: currentUser._id,
        reviewText: userReview,
        rating: userRating,
      });

      console.log("new review:", newReview);

      await Movie.findOneAndUpdate(
        { _id: newMovie._id },
        {
          $push: { reviewIds: newReview._id },
        }
      ),
        await User.findOneAndUpdate(
          { _id: currentUser._id },
          {
            $push: { reviewIds: newReview._id },
          }
        );
    };

    // Check if movie exists
    if (movieExists === null) {
      const newMovie = await Movie.create({ movieApiId: movieReviewedId });
      tagReview(newMovie);
      console.log("movie:", newMovie);
    } else {
      const newMovie = await Movie.findOne({ movieApiId: movieReviewedId });
      tagReview(newMovie);
    }
  },

  deleteReview: async (req, res) => {
    const reviewId = req.params.reviewId;
    const currentUserAuthDetails = res.locals.userAuth;
    const currentUserUsername = currentUserAuthDetails.data.username;
    const currentUser = await User.findOne({ username: currentUserUsername });
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: `Review with ID ${reviewId} does not exist` });
    }

    if (review.authorUserId.toString() !== currentUser._id.toString()) {
      return res.status(401).json({ error: "You are not authorized to delete this review" });
    }

    // pull reviewId from User and Movie
    await currentUser.updateOne({
      $pull: { reviewIds: review._id },
    });
    await Movie.findOneAndUpdate(
      { _id: review.movieId },
      {
        $pull: { reviewIds: review._id },
      }
    );

    // delete Comments on that review
    await Promise.all(
      review.commentIds.map(async (commentId) => {
        await Comment.findByIdAndDelete(commentId);
      })
    );

    // delete Review itself
    await review.deleteOne();
    return res.json();
  },
  updateLikes: async (req, res) => {
    const reviewId = req.params.reviewId;
    const currentUserAuthDetails = res.locals.userAuth;
    const currentUserUsername = currentUserAuthDetails.data.username;
    const currentUser = await User.findOne({ username: currentUserUsername });

    if (!currentUser) {
      return res.status(404).json({ error: `Username ${currentUserUsername} does not exist!` });
    }

    try {
      let review;
      const type = req.url.split("/")[2];
      console.log("type", type);
      if (type === "like") {
        review = await Review.findOneAndUpdate(
          { _id: reviewId },
          {
            $addToSet: { userIdsWhoLiked: currentUser._id },
          },
          { new: true }
        ).populate("userIdsWhoLiked");
        console.log("review", review);
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
