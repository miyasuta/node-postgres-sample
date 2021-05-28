'use strict';

const express = require('express')
const bodyParser = require('body-parser')

const dbConn = require('./db-conn')
const dbOp = require('./db-op')

var _db = undefined
const app = express()

app.use(bodyParser.json())

app.get('/', function (req, res) {
    res.send('Hello!')
})

app.get('/products', function(req, res) {
    dbOp.getAll(_db, res)
})

app.get('/products/:id', function(req, res) {
    dbOp.getOne(_db, res, req.params.id)
})

app.post('/products', function(req, res) {
    dbOp.insertOne(_db, res, req.body)
})

app.put('/products/:id', function (req, res) {
    dbOp.modifyOne(_db, res, req.params.id, req.body)
})

app.delete('/products/:id', function(req, res) {
    dbOp.deleteOne(_db, res, req.params.id)
})

function setDBCallback (error, db) {
    if (error !== null) {
        console.log('error when fetching the DB connection ' + JSON.stringify(error))
        return
    }
    _db = db;
}

var PORT = process.env.PORT || 8088
var server = app.listen(PORT, function() {
    const host = server.address().address
    const port = server.address().port
    console.log(`Example app listening at http://${server}:${port}`)

    dbConn.getDB(setDBCallback);

})


