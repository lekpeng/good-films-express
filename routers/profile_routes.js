const express = require("express");
const profileController = require("../controllers/profile_controller");
const authMiddleWare = require("../middleware/authmiddleware");
const router = express.Router();

// FOLLOW
router.patch("/:username/follow", authMiddleWare, profileController.updateFollowing);
router.patch("/:username/unfollow", authMiddleWare, profileController.updateFollowing);

// PROFILES
router.get("/", profileController.indexProfiles);
router.get("/:username", authMiddleWare, profileController.showProfile);

module.exports = router;
