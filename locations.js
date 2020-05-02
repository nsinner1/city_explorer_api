'use strict';

const superagent= require('superagent');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

module.exports = handleLocation;

function handleLocation( request, response ) {
  let city = request.query.city.toLowerCase();
  const searchSQL = `
    SELECT * FROM locations 
    WHERE search_query = $1
  `;
  const searchValues =[city];

  client.query(searchSQL, searchValues)
    .then( results => {
      if (results.rowCount >= 1 ) {
        sendLocation(results.rows[0], response);
      } else {
        getLocationData(city)
          .then(location => saveLocation(location))
          .then(savedLocation => sendLocation(savedLocation, response));
      } 
    })
    .catch(error => {
      let errorObject = {
        status: 500,
        responseText: 'john is ugly or something',
      };
      response.status(500).json(errorObject);
    });
}

function sendLocation(location, response) {
  response.status(200).json(location);
}

function getLocationData(city) {
  const url = 'https://us1.locationiq.com/v1/search.php';
  const queryStringParams = {
    key: process.env.LOCATIONIQ,
    q: city,
    format: 'json',
    limit: 1,
  };
  return superagent.get(url)
    .query(queryStringParams)
    .then(data => {
      let locationData = data.body[0];
      return new Location(city, locationData);
    });
}

function saveLocation(location) {
  const SQL = `
    INSERT INTO locations (search_query, formatted_query, latitude, longitude)  
    VALUES($1, $2, $3, $4) RETURNING *
  `;
  let VALUES = [location.search_query, location.formatted_query, location.latitude, location.longitude];
  return client.query(SQL, VALUES)
    .then( result => {
      return result.rows[0];
    });
}

function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}
