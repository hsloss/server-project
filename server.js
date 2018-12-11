'use strict'
const express = require('express')
const superagent =require('superagent')
const app = express()
const cors = require('cors')
require('dotenv').config()
const PORT = process.env.PORT || 3000

app.use(cors())
app.get('/location',(req, res)=>
{
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.address}&key=${process.env.GOOGLE_API_KEY}`
  superagent.get(url)
    .then(result=>{
      console.log(result)
      res.send(new Location(result))
    })
    .catch(err=>res.send(err))})

app.get('/', (req,res)=>{
  res.send('<h1>This is the Correct route</h1>')
})

app.get('*', (req, res) =>
  res.send('500 error message'))



app.listen(PORT, ()=>{
  console.log(`Listening on port ${PORT}`)
})

const Location = function(loc){
  this.lat = loc.body.results[0].geometry.location.lat
  this.lng = loc.body.results[0].geometry.location.lng
}
