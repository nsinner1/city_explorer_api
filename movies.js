'use strict';

const superagent = require('superagent');

module.exports = handleMovies;

function handleMovies (request, response) {
  try {

    let url = 'https://api.themoviedb.org/3/search/movie';
    const location = request.query.search_query;
    const queryStringParams = {
      api_key: process.env.MOVIES_TOKEN,
      query: location,
    };


    superagent.get(url)
      .query(queryStringParams)
      .then(data => {
        let moviesData = data.body.results.map( movie => {
          return new Movie(movie);
        });
        response.json(moviesData);
      }).catch(error => {
        console.log(error);
      });
  } catch(error) {
    let errorObject = {
      status: 500,
      responseText: 'john is ugly or something',
    };
    response.status(500).json(errorObject);
  }
}

function Movie(movie){
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  this.total_votes = movie.vote_count;
  this.image_url = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
}
