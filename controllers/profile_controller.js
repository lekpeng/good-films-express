const axios = require("axios");
const cors = require("cors");
const User = require("../models/user");

module.exports = {
  showProfile: async (req, res) => {
    const profileUsername = req.params.username;
    const currentUserAuthDetails = res.locals.userAuth;
    const currentUserUsername = currentUserAuthDetails.data.username;

    try {
      const profileUser = await User.findOne({ username: profileUsername })
        .populate({
          path: "reviewIds",
          populate: [
            { path: "movieId" },
            { path: "userIdsWhoLiked" },
            // { path: "commentIds", populate: "authorUserId" },
          ],
        })
        .lean()
        .exec();
      const reviews = await Promise.all(
        profileUser.reviewIds.map(async (review) => {
          try {
            const response = await axios.get(
              `https://api.themoviedb.org/3/movie/${review.movieId.movieApiId}?api_key=${process.env.API_KEY}`
            );
            const data = await response.data;
            review.movieTitle = data.title;
          } catch (error) {
            review.movieTitle = "This movie title is not available for some reason.";
          }
          return review;
        })
      );

      const profile = {
        username: profileUser.username,
        reviews: reviews,
        isCurrentUser: profileUsername === currentUserUsername,
      };
      res.json(profile);
      return;
    } catch (err) {
      res.send(err);
      return;
    }
  },
};
