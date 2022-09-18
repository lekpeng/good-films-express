const express = require("express");
const { showReview } = require("../controllers/review_controller");
const reviewController = require("../controllers/review_controller");
const authMiddleWare = require("../middleware/authmiddleware");
const router = express.Router();

// Reviews
router.get(
  "/from-movie-and-user/:movieApiId",
  authMiddleWare,
  reviewController.showReviewFromMovieAndUser
);
router.get("/:reviewId", authMiddleWare, reviewController.showReview);
router.post("/:movieApiId", authMiddleWare, reviewController.createReview);
router.delete("/:reviewId/", authMiddleWare, reviewController.deleteReview);

// Actions on reviews
router.put("/:reviewId", authMiddleWare, reviewController.updateReview);
router.patch("/:reviewId/like", authMiddleWare, reviewController.updateLikes);
router.patch("/:reviewId/unlike", authMiddleWare, reviewController.updateLikes);
router.post("/:reviewId/comments", authMiddleWare, reviewController.createComment);

module.exports = router;
