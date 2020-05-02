'use strict';

const superagent = require('superagent');

module.exports = handleWeather;

function handleWeather(request, response) {
  try {

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
