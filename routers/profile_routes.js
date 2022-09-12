const express = require("express");
const profileController = require("../controllers/profile_controller");
const authMiddleWare = require("../middleware/authmiddleware");
const router = express.Router();

// FOLLOW
router.patch("/follow", authMiddleWare, profileController.updateFollowing);
router.patch("/unfollow", authMiddleWare, profileController.updateFollowing);

// PROFILES
router.get("/:username", authMiddleWare, profileController.showProfile);

module.exports = router;
