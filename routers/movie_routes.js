const express = require("express");
const movieController = require("../controllers/movie_controller");
const reviewController = require("../controllers/review_controller");
const router = express.Router();
const authMiddleWare = require("../middleware/authmiddleware");

// Index movie metadata
router.get("/listofgenres", movieController.listOfGenres);
router.get("/:movieApiId", movieController.showMovie);

// router.get("/popular", movieController.showPopular);
// router.get("/top_rated", movieController.showTopRated);

// Index movies
router.get("/search/:query", movieController.searchMovies);
router.get("/:genre/:genreId", movieController.filterByGenre);

module.exports = router;
