'use strict';

const superagent = require('superagent');

module.exports = handleTrails;

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
