const express = require("express");
const reviewController = require("../controllers/review_controller");
const authMiddleWare = require("../middleware/authmiddleware");
const router = express.Router();

router.patch("/:reviewId/like", authMiddleWare, reviewController.updateLikes);
router.patch("/:reviewId/unlike", authMiddleWare, reviewController.updateLikes);
router.post("/:reviewId/comments", authMiddleWare, reviewController.createComment);
router.get("/:reviewId", authMiddleWare, reviewController.showReview);

router.post("/rating", reviewController.submitRating);

module.exports = router;
