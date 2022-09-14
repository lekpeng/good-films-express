const express = require("express");
const movieController = require("../controllers/movie_controller");
const reviewController = require("../controllers/review_controller");
const router = express.Router();
const authMiddleWare = require("../middleware/authmiddleware");

// GET MOVIE DETAILS
router.get("/listofgenres", movieController.listOfGenres);
router.get("/:movieApiId", movieController.showMovie);
router.get("/popular", movieController.showPopular);
router.get("/top_rated", movieController.showTopRated);
router.get("/:genre/:genreId", movieController.filterByGenre);

module.exports = router;
