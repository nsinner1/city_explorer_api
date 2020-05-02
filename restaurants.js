'use strict';

const superagent = require('superagent');

module.exports = handleRestaurants;

function handleRestaurants(request, response) {
  try {

    let key = process.env.YELP_TOKEN;
    let city = request.query.search_query;
    let url = `https://api.yelp.com/v3/businesses/search?location=${city}`;

    superagent.get (url)
      .set ('Authorization', `Bearer ${key}`)
      .then( data => {
        let restaurantsData = data.body.businesses.map( restaurant => {
          return new Restaurant(restaurant);
        });
        response.json(restaurantsData);
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

function Restaurant (restaurant) {
  this.name= restaurant.name;
  this.image_url= restaurant.image_url;
  this.price= restaurant.price;
  this.rating= restaurant.rating;
  this.url = restaurant.url;
}
