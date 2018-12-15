'use strict'
const mongoose = require('mongoose')
const express = require('express')
const superagent =require('superagent')
const app = express()
const cors = require('cors')
require('dotenv').config()
const PORT = process.env.PORT || 3000
const mongoURL =  `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@ds117128.mlab.com:17128/server-project`

mongoose.connect(mongoURL);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('db connected')
});

app.use(cors())

app.get('/location', locationController)

app.get('/weather', weatherController)

app.get('/yelp', yelpController)

app.get('/movies', theMovieDBController)

app.get('/meetup', meetupController)

app.get('/trails', hikingController)

app.get('/', (req, res) => {
  res.send('<div>This is the Home Route</div>')
})

app.use('*', (req, res) => {
  res.send('<img src="https://http.cat/404" />')
})


app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

const locationSchema = new mongoose.Schema({
  address: String,
  lat: Number,
  lng: Number
})

const Location = mongoose.model('Location', locationSchema)

function locationController(req, res) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.address}&key=${process.env.GOOGLE_API_KEY}`
  Location.findOne({address: req.query.address}, (err, addr) => {
    if(addr) {
      console.log('address found', req.query.address)
      res.send(addr)
    } else {
      superagent.get(url)
        .then(result => {
          console.log(result)
          const newLocation = new Location({
            address: req.query.address,
            lat: result.body.results[0].geometry.location.lat,
            lng: result.body.results[0].geometry.location.lng
          })
          newLocation.save()
          console.log('created new address')
          res.send(newLocation)
        })
    }
  })
    .catch(err => res.send('Got an error'))
}

function weatherController(req, res) {
  // const url = 'https://api.darksky.net/forecast/d3f4d353a9097935306705f81711b6da/37.8267,-122.4233'
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
      let arr = []
      for(let i =0; i < result.body.businesses.length; i++){
        const newYelp = new YelpConstructor(result.body.businesses[i])
        arr.push(newYelp)
      }
      console.log(result)
      res.send(arr)
    })
    .catch(err=>res.send(err))
}

function theMovieDBController(req, res) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.THE_MOVIE_DB_API_KEY}&query=${req.query.query}`
  superagent.get(url)
    .then(result => {
      let arr = []
      for(let i = 0; i < result.body.results.length; i++){
        let newMovie = new MovieConstructor(result.body.results[i])
        arr.push(newMovie)
      }
      console.log(result)
      res.send(arr)
    })
    .catch(err=>res.send(err))
}

function meetupController(req, res) {
  const url = `https://api.meetup.com/find/groups?key=${process.env.MEETUP_API_KEY}&sign=true&photo-host=public&location=${req.query.location}&page=20`
  superagent.get(url)
    .then(result => {
      console.log(result)
      let arr = []
      for(let i = 0; i < result.body.length; i++){
        let newMeetup = new MeetupConstructor(result.body[i])
        arr.push(newMeetup)
      }
      console.log(result)
      res.send(arr)
    })
    .catch(err=>res.send(err))
}

function hikingController(req, res) {
  const url = `https://www.hikingproject.com/data/get-trails?lat=${req.query.lat}&lon=${req.query.lon}&maxDistance=10&key=${process.env.HIKING_API_KEY}`
  superagent.get(url)
    .then(result => {
      console.log(result)
      let arr = []
      for(let i = 0; i < result.body.trails.length; i++){
        let newHiking = new HikingConstructor(result.body.trails[i])
        arr.push(newHiking)
      }
      console.log(result)
      res.send(arr)
    })
    .catch(err=>res.send(err))
}

const WeatherConstructor = function(weather) {
  this.time = weather.body.currently.time
  this.summary = weather.body.currently.summary
  this.temp = weather.body.currently.temperature
}

const YelpConstructor = function(yelp){
  this.name = yelp.name
  this.url = yelp.url
  this.image_url = yelp.image_url
  this.rating = yelp.rating
}

const MovieConstructor = function(mov) {
  this.title = mov.title
  this.overview = mov.overview
  this.average_votes = mov.vote_average
  this.total_votes = mov.vote_count
  this.popularity = mov.popularity
  this.released_on = mov.released_date
}

const MeetupConstructor = function(meetup) {
  this.link = meetup.link,
  this.name = meetup.name,
  this.created = meetup.created
  this.description = meetup.description
}

const HikingConstructor = function(hiking) {
  this.name = hiking.name,
  this.location = hiking.location,
  this.length = hiking.length,
  this.stars = hiking.stars,
  this.starVotes = hiking.starVotes,
  this.summary = hiking.summary,
  this.trail_url = hiking.trail_url,
  this.conditionStatus = hiking.conditionStatus,
  this.conditionDate = hiking.conditionDate
  this.conditionDetails = hiking.conditionDetails
}
