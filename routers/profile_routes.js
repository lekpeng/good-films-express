const express = require("express");
const profileController = require("../controllers/profile_controller");
const authMiddleWare = require("../middleware/authmiddleware");
const router = express.Router();

// FOLLOW
router.get("/follow/:followee", authMiddleWare, profileController.addFollowing);
router.get("/unfollow/:followee", authMiddleWare, profileController.removeFollowing);

// PROFILES
router.get("/:username", authMiddleWare, profileController.showProfile);

module.exports = router;
