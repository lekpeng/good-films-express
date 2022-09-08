const express = require("express");
const movieController = require("../controllers/movie_controller");
const router = express.Router();

// GET /
router.get("/:movieApiId", movieController.showMovie);
router.get("/popular", movieController.showPopular);
router.get("/top_rated", movieController.showTopRated);

module.exports = router;
