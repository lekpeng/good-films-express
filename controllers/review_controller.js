const axios = require("axios");
const cors = require("cors");
const Review = require("../models/review");
const User = require("../models/user");
const Movie = require("../models/movie");
const Comment = require("../models/comment");
const { text } = require("express");

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

    // console.log("review sent: " + JSON.stringify(review));
    return res.json(review);
  },

  createReview: async (req, res) => {
    const currentUserAuthDetails = res.locals.userAuth;
    const currentUserUsername = currentUserAuthDetails.data.username;
    const movieReviewedId = req.params.movieApiId;
    const userRating = req.body.newRating;
    const userReview = req.body.newReview.text;

    const currentUser = await User.findOne({ username: currentUserUsername });
    const movieExists = await Movie.findOne({
      movieApiId: movieReviewedId,
    }).populate("reviewIds");

    // Function to create new review document and tag it to Movie and User
    const tagReview = async (newMovie) => {
      const newReview = await Review.create({
        movieId: newMovie._id,
        authorUserId: currentUser._id,
        reviewText: userReview,
        rating: userRating,
      });

      const numberOfVotes = newMovie.reviewIds.filter((reviewId) => reviewId.rating).length;
      let updatedAverageRating = newMovie.averageRating;
      if (userRating > 0) {
        updatedAverageRating =
          (newMovie.averageRating * numberOfVotes + userRating) / (numberOfVotes + 1);
      }

      await Movie.findOneAndUpdate(
        { _id: newMovie._id },
        {
          $push: { reviewIds: newReview._id },
          $set: { averageRating: updatedAverageRating },
        }
      );
      await User.findOneAndUpdate(
        { _id: currentUser._id },
        {
          $push: { reviewIds: newReview._id },
        }
      );

      return res.json(newReview);
    };

    // Check if movie exists before tagging review
    if (movieExists === null) {
      const newMovie = await Movie.create({ movieApiId: movieReviewedId });
      return tagReview(newMovie);
    } else {
      const newMovie = await Movie.findOne({ movieApiId: movieReviewedId });
      return tagReview(newMovie);
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

    // pull reviewId from User and Movie, update movie average rating
    const movie = await Movie.findById(review.movieId).populate("reviewIds");
    const numberOfVotes = movie.reviewIds.filter((reviewId) => reviewId.rating).length;
    let updatedAverageRating = movie.averageRating;
    if (review.rating > 0) {
      if (numberOfVotes === 1) {
        updatedAverageRating = 0;
      } else {
        updatedAverageRating =
          (movie.averageRating * numberOfVotes - review.rating) / (numberOfVotes - 1);
      }
    }

    await currentUser.updateOne({
      $pull: { reviewIds: review._id },
    });
    await movie.updateOne({
      $pull: { reviewIds: review._id },
      $set: { averageRating: updatedAverageRating },
    });

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

  updateReview: async (req, res) => {
    const reviewId = req.params.reviewId;
    const updatedRating = req.body.rating;
    const updatedReviewText = req.body.review.text;
    const previousReview = await Review.findById(reviewId);
    const previousRating = previousReview.rating;

    const movie = await Movie.findById(previousReview.movieId).populate("reviewIds");
    const numberOfVotes = movie.reviewIds.filter((reviewId) => reviewId.rating).length;
    console.log("number of votes", numberOfVotes);
    let updatedAverageRating = movie.averageRating;

    if (previousRating !== updatedRating) {
      console.log("PREVIOUS RATING", previousRating);
      console.log("UPDATED RATING", updatedRating);

      if (previousRating === 0) {
        updatedAverageRating =
          (movie.averageRating * numberOfVotes + updatedRating) / (numberOfVotes + 1);
      } else if (updatedRating === 0) {
        if (numberOfVotes === 1) {
          updatedAverageRating = 0;
        } else {
          updatedAverageRating =
            (movie.averageRating * numberOfVotes - previousRating) / (numberOfVotes - 1);
        }
      } else {
        updatedAverageRating =
          (movie.averageRating * numberOfVotes + updatedRating - previousRating) / numberOfVotes;
      }
    }

    await movie.updateOne({
      $set: { averageRating: updatedAverageRating },
    });

    await previousReview.updateOne(
      {
        reviewText: updatedReviewText,
        rating: updatedRating,
      },
      { upsert: true }
    ); // add validations

    return res.json("updated!");
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
      return res.status(500).json({
        error: `Failed to post comment`,
      });
    }
  },

  showReviewFromMovieAndUser: async (req, res) => {
    const currentUserAuthDetails = res.locals.userAuth;
    const currentUserUsername = currentUserAuthDetails.data.username;
    const currentMovie = req.params.movieApiId;

    // Check if review exists based on username and movie API id
    const checkUser = await User.findOne({ username: currentUserUsername });
    const checkMovie = await Movie.findOne({ movieApiId: currentMovie });

    if (!checkMovie) {
      // Check if movie exists in DB as proxy for whether review exists
      return res.json(null);
    } else {
      const checkReview = await Review.findOne({
        authorUserId: checkUser._id,
        movieId: checkMovie._id,
      });
      return res.json(checkReview);
    }
  },
};
