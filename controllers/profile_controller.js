const axios = require("axios");
const cors = require("cors");
const User = require("../models/user");

module.exports = {
  showProfile: async (req, res) => {
    const profileUsername = req.params.username;
    console.log("profileUsername", profileUsername);
    const currentUserAuthDetails = res.locals.userAuth;
    console.log("currentUserAuthDetails", currentUserAuthDetails);
    const currentUserUsername = currentUserAuthDetails.data.username;

    try {
      const profileUser = await User.findOne({ username: profileUsername })
        .populate("reviewIds")
        .exec();
      const profile = {
        username: profileUser.username,
        reviews: profileUser.reviewIds,
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
