const express = require("express");
const reviewController = require("../controllers/review_controller");
const authMiddleWare = require("../middleware/authmiddleware");
const router = express.Router();

router.post("/:movieApiId", authMiddleWare, reviewController.submitRating);
router.patch("/like", authMiddleWare, reviewController.updateLikes);
router.patch("/unlike", authMiddleWare, reviewController.updateLikes);
router.patch("/:reviewId/like", authMiddleWare, reviewController.updateLikes);
router.patch("/:reviewId/unlike", authMiddleWare, reviewController.updateLikes);
router.post(
  "/:reviewId/comments",
  authMiddleWare,
  reviewController.createComment
);
router.get("/:reviewId", authMiddleWare, reviewController.showReview);

module.exports = router;
