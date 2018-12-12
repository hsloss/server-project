'use strict'
const express = require('express')
const superagent =require('superagent')
const app = express()
const cors = require('cors')
require('dotenv').config()
const PORT = process.env.PORT || 3000

app.use(cors())

app.get('/location', locationController)

app.get('/weather', weatherController)

app.get('/yelp', yelpController)

app.get('/movies', theMovieDBController)

app.get('/', (req, res) => {
  res.send('<div>This is the Home Route</div>')
})

app.use('*', (req, res) => {
  res.send('<img src="https://http.cat/404" />')
})


app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

function locationController(req, res) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.address}&key=${process.env.GOOGLE_API_KEY}`
  superagent.get(url)
    .then(result=>{
      res.send(new Location(result))
    })
    .catch(err=>res.send(err))
}

function weatherController(req, res) {
  const url =`https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}/${req.query.lat},${req.query.lng}`
  superagent.get(url)
    .then(result => {
      const newWeather = new WeatherConstructor(result)
      console.log(result)
      res.send(newWeather)
    })
    .catch(err=>res.send(err))
}

function yelpController(req, res) {
  const url =`https://api.yelp.com/v3/businesses/search?term=${req.query.term}&latitude=${req.query.latitude}&longitude=${req.query.longitude}`
  superagent.get(url).set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(result => {
      const newYelp = new YelpConstructor(result)
      console.log(result)
      res.send(newYelp)
      console.log(newYelp)
    })
    .catch(err=>res.send(err))
}

function theMovieDBController(req, res) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.THE_MOVIE_DB_API_KEY}&query=${req.query.query}`
  superagent.get(url)
    .then(result => {
      const newMovie = new MovieConstructor(result)
      console.log(result)
      res.send(newMovie)
    })
    .catch(err=>res.send(err))
}

const Location = function(loc){
  this.lat = loc.body.results[0].geometry.location.lat
  this.lng = loc.body.results[0].geometry.location.lng
}

const WeatherConstructor = function(weather) {
  this.time = weather.body.currently.time
  this.summary = weather.body.currently.summary
  this.temp = weather.body.currently.temperature
}

const YelpConstructor = function(yelp){
  this.name = yelp.body.businesses[0].name
  this.url = yelp.body.businesses[0].url
  this.image_url = yelp.body.businesses[0].image_url
  this.rating = yelp.body.businesses[0].rating
}

const MovieConstructor = function(mov) {
  this.title = mov.body.results[0].title
  this.overview = mov.body.results[0].overview
  this.average_votes = mov.body.results[0].vote_average
  this.total_votes = mov.body.results[0].vote_count
  this.popularity = mov.body.results[0].popularity
  this.released_on = mov.body.results[0].released_date
}
