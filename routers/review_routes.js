const express = require("express");
const reviewController = require("../controllers/review_controller");
const authMiddleWare = require("../middleware/authmiddleware");
const router = express.Router();

router.patch("/:reviewId/like", authMiddleWare, reviewController.updateLikes);
router.patch("/:reviewId/unlike", authMiddleWare, reviewController.updateLikes);
// router.post("/comment", authMiddleWare, reviewController.createComment);

router.post("/rating", reviewController.submitRating);

module.exports = router;
