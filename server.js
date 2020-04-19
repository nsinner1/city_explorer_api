'use strict';

/*
  The .env file has this in it:
  PORT=3000
*/
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

const PORT = process.env.PORT;

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

const app = express();
app.use(cors());


app.get('/location', handleLocation);

function handleLocation( request, response ) {

  try {
    let city = request.query.city;
    const url = 'https://us1.locationiq.com/v1/search.php';
    const queryStringParams = {
      key: process.env.LOCATION_TOKEN,
      q: city,
      format: 'json',
      limit: 1,
    };
    superagent.get(url)
      .query(queryStringParams)
      .then( data => {
        let locationData = data.body[0];
        let location = new Location(city, locationData);
        response.json(location);
      });
  }
  catch(error) {
    let errorObject = {
      status: 500,
      responseText: 'john is ugly or something',
    };
    response.status(500).json(errorObject);
  }
}

function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}


// Weather

app.get('/weather', handleWeather);

function handleWeather(request, response) {
  try {

    // let listofDays = [];
    let url = 'https://api.darksky.net/forecast/';
    let key = process.env.DARKSKY_TOKEN;
    let lat = request.query.latitude;
    let lon = request.query.longitude;

    let newUrl = `${url}${key}/${lat},${lon}`;

    superagent.get(newUrl)
      .then( data => {
        let listofDays = data.body.daily.data.map( day => {
          return new Weather(day);
        });
        response.json(listofDays);
      }).catch(error => {
        console.log(error);
      });
  }
  catch(error) {
    let errorObject = {
      status: 500,
      responseText: 'john is ugly or something',
    };
    response.status(500).json(errorObject);
  }
}

function Weather(data) {
  this.time = data.time;
  this.forecast = data.summary;
}


// trails

app.get('/trails', handleTrails);

function handleTrails (request, response) {
  try {

    const url = 'https://www.hikingproject.com/data/get-trails';
    const queryStringParams = {
      key: process.env.TRAILS_TOKEN,
      lat: request.query.latitude,
      lon: request.query.longitude,
      maxResults: 10,
    };

    superagent.get(url)
      .query(queryStringParams)
      .then(data => {
        let trailsData = data.body.trails.map( trail => {
          return new Hiking(trail);
        });
        response.json(trailsData);
      }).catch(error => {
        console.log(error);
      });
  }
  catch(error) {
    let errorObject = {
      status: 500,
      responseText: 'john is ugly or something',
    };
    response.status(500).json(errorObject);
  }
}


function Hiking(trail){
  this.name = trail.name;
  this.location = trail.location;
  this.length = trail.length;
  this.stars = trail.stars;
  this.star_votes = trail.starVotes;
  this.summary = trail.summary;
  this.trail_url = trail.url;
  this.conditions = trail.conditionDetails;
  this.condition_date = trail.conditionDate.substring(0,10);
  this.condition_time = trail.conditionDate.substring(11,20);
}



//Movies
app.get('/movies', handleMovies);

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
  }
  catch(error) {
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


// Restaurants

app.get('/restaurant', handleRestaurants);

function handleRestaurants(request, response) {
  try {
    let url = 'https://api.yelp.com/v3/businesses/search';
    // const location = request.query.search_query;
    let queryStringParams = {
      key: process.env.YELP_TOKEN,
      lat: request.query.latitude,
      lon: request.query.longitude,
      maxResults: 10,
    };

    superagent.get(url)
      .query(queryStringParams)
      .then(data => {
        let restaurantData = data.body.results.map( restaurant => {
          return new Restaurant(restaurant);
        });
        response.json(restaurantData);
      }).catch(error => {
        console.log(error);
      });
  }
  catch(error) {
    let errorObject = {
      status: 500,
      responseText: 'john is ugly or something',
    };
    response.status(500).json(errorObject);
  }
}
  
function Restaurant(data) {
  this.name = data.name;
  this.image_url = data.image_url;
  this.price = data.price;
  this.rating = data.rating;
  this.url = data.url;
}



// SQL locations

app.get('/location', (req,res) => {

  const SQL = 'SELECT * FROM location';

  client.query(SQL)
    .then( results => {
      if( results.rowCount >= 1 ) {
        res.status(200).json(location);
      }
      else {
        res.status(400).send('No Results Found');
      }
    })
    .catch(err => res.status(500).send(err));
});

app.get('/new', (req,res) => {


  let SQL = `
      INSERT INTO location (latitude, longitude)
      VALUES($1, $2)
    `;

  let VALUES = [req.query.latitude, req.query.longitude];

  client.query(SQL, VALUES)
    .then( results => {
      if ( results.rowCount >= 1 ) {
        res.status(301).redirect('https://us1.locationiq.com/v1/search.php');
      }
      else {
        res.status(200).send('Not Added');
      }
    })
    .catch(err => res.status(500).send(err));

});



app.listen( PORT, () => console.log('Server up on', PORT));
