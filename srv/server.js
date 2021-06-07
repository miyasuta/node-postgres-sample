'use strict';

const express = require('express')
const bodyParser = require('body-parser')

var _db = undefined
const app = express()

app.use(bodyParser.json())

app.get('/', function (req, res) {
    res.send("Hello!")
})

var PORT = process.env.PORT || 8088
var server = app.listen(PORT, function() {
var server = app.listen(PORT, function() {
    const host = server.address().address
    const port = server.address().port
    console.log(`Example app listening at http://${host}:${port}`)    
})