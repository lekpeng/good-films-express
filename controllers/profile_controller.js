const axios = require("axios");
const cors = require("cors");
const User = require("../models/user");

module.exports = {
  indexProfiles: async (req, res) => {
    try {
      const profileUsers = await User.find({});

      return res.json(profileUsers);
    } catch (err) {
      return res.status(500).json({ error: `${err}. Failed to get users` });
    }
  },
  showProfile: async (req, res) => {
    const profileUsername = req.params.username;
    const currentUserAuthDetails = res.locals.userAuth;
    const currentUserUsername = currentUserAuthDetails.data.username;

    try {
      // check which populates can be removed
      const profileUser = await User.findOne({ username: profileUsername })
        .populate("reviewIds")
        .populate("followingIds")
        .exec();

      if (!profileUser) {
        return res.status(404).json({ error: `User ${profileUsername} does not exist!` });
      }

      const profile = {
        username: profileUser.username,
        followees: profileUser.followingIds.map((followingId) => followingId.username),
        reviews: profileUser.reviewIds,
        isCurrentUser: profileUsername === currentUserUsername,
      };
      return res.json(profile);
    } catch (err) {
      return res
        .status(500)
        .json({ error: `${err}. Failed to get profile of username ${profileUsername} ` });
    }
  },

  updateFollowing: async (req, res) => {
    const followee = req.body.followee;
    const currentUserAuthDetails = res.locals.userAuth;
    const follower = currentUserAuthDetails.data.username;

    try {
      if (followee === follower) {
        return res.status(400).json({ error: `You cannot follow yourself!` });
      }
      const followeeUser = await User.findOne({ username: followee });

      if (!followeeUser) {
        return res.status(404).json({ error: `Username ${followee} does not exist!` });
      }

      let followerUser;
      const type = req.url.split("/")[2];

      if (type === "follow") {
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
        return res.status(404).json({ error: `Username ${follower} does not exist!` });
      }

      return res.json(followerUser);
    } catch (err) {
      return res
        .status(500)
        .json({ error: `Failed to update ${follower}'s following status of ${followee}` });
    }
  },
};
