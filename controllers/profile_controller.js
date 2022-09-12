const axios = require("axios");
const cors = require("cors");
const User = require("../models/user");

module.exports = {
  indexProfiles: async (req, res) => {
    try {
      const profileUsers = await User.find({});

      return res.json(profileUsers);
    } catch (err) {
      res.status(500);
      console.log(err);
      return res.json({ error: `${err}. Failed to get users` });
    }
  },
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
        .populate("followingIds")
        .lean()
        .exec();

      if (!profileUser) {
        res.status(404);
        return res.json({ error: `User ${profileUsername} does not exist!` });
      }
      const reviews = await Promise.all(
        profileUser.reviewIds.map(async (review) => {
          try {
            const response = await axios.get(
              `https://api.themoviedb.org/3/movie/${review.movieId.movieApiId}?api_key=${process.env.API_KEY}`
            );
            const data = await response.data;
            review.movieTitle = data.title;
          } catch (err) {
            review.movieTitle = "This movie title is not available for some reason.";
          }
          return review;
        })
      );

      const profile = {
        username: profileUser.username,
        followees: profileUser.followingIds.map((followingId) => followingId.username),
        reviews: reviews,
        isCurrentUser: profileUsername === currentUserUsername,
      };
      return res.json(profile);
    } catch (err) {
      res.status(500);
      return res.json({ error: `${err}. Failed to get profile of username ${profileUsername} ` });
    }
  },

  updateFollowing: async (req, res) => {
    const followee = req.body.followee;
    const currentUserAuthDetails = res.locals.userAuth;
    const follower = currentUserAuthDetails.data.username;

    try {
      if (followee === follower) {
        res.status(400);
        return res.json({ error: `You cannot follow yourself!` });
      }
      const followeeUser = await User.findOne({ username: followee });

      if (!followeeUser) {
        res.status(404);
        return res.json({ error: `Username ${followee} does not exist!` });
      }

      let followerUser;
      if (req.url === "/follow") {
        followerUser = await User.findOneAndUpdate(
          { username: follower },
          {
            $addToSet: { followingIds: followeeUser._id },
          },
          { new: true }
        );
      } else {
        followerUser = await User.findOneAndUpdate(
          { username: follower },
          {
            $pull: { followingIds: followeeUser._id },
          },
          { new: true }
        );
      }

      if (!followerUser) {
        res.status(404);
        return res.json({ error: `Username ${follower} does not exist!` });
      }

      res.json(followerUser);
      return;
    } catch (err) {
      res.status(500);
      return res.json({ error: `Failed to allow ${follower} to follow ${followee}` });
    }
  },

  // removeFollowing: async (req, res) => {
  //   console.log("BACKEND remove following");
  //   const followee = req.body.followee;
  //   const currentUserAuthDetails = res.locals.userAuth;
  //   const follower = currentUserAuthDetails.data.username;

  //   try {
  //     const followeeUser = await User.findOne({ username: followee });

  //     if (!followeeUser) {
  //       res.status(404);
  //       return res.json({ error: `Username ${followee} does not exist!` });
  //     }

  //     const followerUser = await User.findOneAndUpdate(
  //       { username: follower },
  //       {
  //         $pull: { followingIds: followeeUser._id },
  //       },
  //       { new: true }
  //     );

  //     if (!followerUser) {
  //       res.status(404);
  //       return res.json({ error: `Username ${follower} does not exist!` });
  //     }

  //     res.json(followerUser);
  //     return;
  //   } catch (err) {
  //     res.status(500);
  //     return res.json({ error: `Failed to allow ${follower} to unfollow ${followee}` });
  //   }
  // },
};
