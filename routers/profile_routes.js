const express = require("express");
const profileController = require("../controllers/profile_controller");
const authMiddleWare = require("../middleware/authmiddleware");
const router = express.Router();

// GET /
router.get("/:username", authMiddleWare, profileController.showProfile);

module.exports = router;
