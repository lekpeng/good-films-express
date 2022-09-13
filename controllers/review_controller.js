const axios = require("axios");
const cors = require("cors");
const Review = require("../models/review");
const User = require("../models/user");

module.exports = {
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
    } catch (err) {
      res.status(500);
      return res.json({ error: "Failed to rate movie" });
    }
    console.log("Rating:", userRating.rating);
    console.log("User:", user);
    console.log("Current User Name:", currentUserUsername);
  },
};
