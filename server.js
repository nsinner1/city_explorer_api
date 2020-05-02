'use strict';


require('dotenv').config();
const cors = require('cors');
const express = require('express');
const pg = require('pg');

const handleLocation = require('./locations.js');
const handleWeather = require('./weather.js');
const handleTrails = require('./trails.js');
const handleRestaurants = require('./restaurants.js');
const handleMovies = require('./movies.js');

const PORT = process.env.PORT;

const client = new pg.Client(process.env.DATABASE_URL);
const app = express();

client.connect();
app.use(cors());

app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/trails', handleTrails);
app.get('/movies', handleMovies);
app.get('/yelp', handleRestaurants);


app.listen( PORT, () => console.log('Server up on', PORT));

