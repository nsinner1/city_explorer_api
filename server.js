'use strict';

/*
  The .env file has this in it:
  PORT=3000
*/
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const superagent = require('superagent');

const PORT = process.env.PORT;

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
    // eventually, get this from a real live API
    // But today, pull it from a file.
    // let locationData = require('./data/geo.json');
    // let location = new Location(city, locationData[0]);
    // throw 'john is ugly or something';
    // response.json(location);
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
  // use darksky fake data
  // eventually will be an api call
    let weatherData = require('./data/darksky.json');
    let listofDays = [];
    weatherData.daily.data.map( day => {
      let weather = new Weather(day);
      listofDays.push(weather);
    })
    response.json(listofDays);
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

// Restaurants

// function handleRestaurants(request, response) {

  // let restaurantData = require('./data/restaurants.json');
//   let listOfRestaurants = [];
  
//   let url = 'https://developers.zomato.com/api/v2.1/geocode';
//   let queryStringParams = {
    // lat: request.query.latitude,
    // lon: request.query.longitude,
//   };
  
  // user-key
//   superagent.get(url)
//     .query(queryStringParams)
//     .set('user-key', process.env.ZOMATO_TOKEN)
//     .then( data => {
//       let restaurantData = data.body;
//       restaurantData.nearby_restaurants.forEach(r => {
//         let restaurant = new Restaurant(r);
//         listOfRestaurants.push(restaurant);
//       });
  
//       response.json(listOfRestaurants);
//     });
  
// }
  
// function Restaurant(data) {
//   this.name = data.restaurant.name;
//   this.cuisines = data.restaurant.cuisines;
//   this.locality = data.restaurant.location.locality;
// }


app.listen( PORT, () => console.log('Server up on', PORT));