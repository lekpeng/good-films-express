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
      res.json(data);
    } catch (error) {
      res.status(404);
      return res.json({ error: `Failed to get movie` });
    }
  },

  listOfGenres: async (req, res) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.API_KEY}`
      );
      const data = await response.data;
      res.json(data.genres);
    } catch (error) {
      res.status(404);
      return res.json({ error: `Failed to get list of genres` });
      console.log(error);
    }
  },

  filterByGenre: async (req, res) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?with_genres=${req.params.genreId}&api_key=${process.env.API_KEY}`
      );
      const data = await response.data;
      res.json(data.results);
    } catch (error) {
      res.status(404);
      return res.json({ error: `Failed to get movie` });
    }
  },
};
