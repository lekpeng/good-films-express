const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const movieSchema = new Schema({
  movieApiId: {
    type: String,
    required: true,
    unique: true,
  },
  
  averageRating: {
    type: Number,
    default: 0,
  },

  reviewIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
      required: true,
    },
  ],
});

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
