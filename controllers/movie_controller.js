const axios = require("axios");
const cors = require("cors");
const Movie = require("../models/movie");

module.exports = {
  showMovie: async (req, res) => {
    console.log("running show movie");
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

  showPopular: async (req, res) => {
    console.log("running popular");
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.API_KEY}`
      );
      const data = await response.data;
      res.json(data.results);
    } catch (error) {
      res.status(404);
      return res.json({ error: `Failed to get movie` });
    }
  },

  showTopRated: async (req, res) => {
    console.log("running top rated");
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.API_KEY}`
      );
      const data = await response.data;
      res.json(data.results);
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
  searchMovies: async (req, res) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&query=${req.params.query}`
      );
      const data = response.data.results.map((movie) => {
        return { movieApiId: movie.id, movieTitle: movie.title, movieImage: movie.poster_path };
      });
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: `${err}. Failed to get movie` });
    }
  },
};
