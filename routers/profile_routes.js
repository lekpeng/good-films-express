const express = require("express");
const profileController = require("../controllers/profile_controller");
const authMiddleWare = require("../middleware/authmiddleware");
const router = express.Router();

// PROFILES
router.get("/:username", authMiddleWare, profileController.showProfile);

// FOLLOW
router.post("/:follower/:followee", authMiddleWare, profileController.updateFollowing);

module.exports = router;
