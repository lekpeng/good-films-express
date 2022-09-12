const express = require("express");
const reviewController = require("../controllers/review_controller");
const router = express.Router();

router.post("/rating", reviewController.submitRating);

module.exports = router;
