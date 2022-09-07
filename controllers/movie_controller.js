const axios = require("axios");
const cors = require("cors");
const Movie = require("../models/movie");

module.exports = {
  showMovie: async (req, res) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${req.params.movieApiId}?api_key=${process.env.API_KEY}`
      );
      const data = await response.data;
      console.log(data);
      res.json(data);
    } catch (error) {
      res.status(404);
      console.log(error);
      return res.json({ error: `Failed to get movie` });
    }
  },

  showTrending: async (req, res) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/trending/all/day?api_key=${process.env.API_KEY}`
      );
      const data = await response.data;
      console.log(data.results);
      res.json(data.results);
    } catch (error) {
      res.status(404);
      return res.json({ error: `Failed to get movie` });
    }
  },
};
