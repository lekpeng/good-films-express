const express = require("express");
const movieController = require("../controllers/movie_controller");
const router = express.Router();

// GET /
router.get("/:movieId", movieController.showMovie);
router.get("/", movieController.showTrending);

module.exports = router;
