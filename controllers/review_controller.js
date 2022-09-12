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
};
