'use strict';

const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const JWTStrategy = require('@sap/xssec').JWTStrategy
const xsenv = require('@sap/xsenv')
const xssec = require('@sap/xssec')

const dbConn = require('./db-conn')
const dbOp = require('./db-op');
const xssecConfig = require('@sap/xssec/lib/xssec.config');

var _db = undefined
const app = express()

app.use(bodyParser.json())
passport.use(new JWTStrategy(xsenv.getServices({xsuaa:{tag:'xsuaa'}}).xsuaa));
app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));

app.get('/', function (req, res) {
    res.send('Hello!')
})

function logJWT (req) {
    var jwt = req.header('authorization');
    if (!jwt) {
        res.send('No JWT in Request - Call performed directly to App')
        return
    }
    jwt = jwt.substring('Bearer '.length);
    console.log(`JWT is: ${jwt}`)
    xssec.createSecurityContext(jwt, xsenv.getServices({uaa: 'node-postgres-sample-uaa'}).uaa, function(error, securityContext) {
        if (error) {
            console.log('Security Context creation failed')
            return            
        }
        var userInfo = {
            logonName: securityContext.getLogonName(),
            givenName: securityContext.getGivenName(),
            familyName: securityContext.getFamilyName(),
            emal: securityContext.getEmail()
        }
        console.log(`User Info retrieved successfully: ${JSON.stringify(userInfo)}`)

        if (req.user) {
            var myUser = JSON.stringify(req.user)
            console.log(`user: ${JSON.stringify(req.user)}`)          
        }
    })
}

app.get('/products', function(req, res) {
    //logJWT(req)
    dbOp.getAll(_db, res)

    // console.log(`req.user: ${JSON.stringify(req.user)}`)
    // console.log(`req.authInfo: ${JSON.stringify(req.authInfo)}`)
    // console.log(`req.tokenInfo: ${JSON.stringify(req.tokenInfo)}`)
    // console.log(`getLogonName: ${req.authInfo.getLogonName()}`)
    // console.log(`TokenInfo-payload 1: ${JSON.stringify(req.authInfo.getTokenInfo().getPayload())}`)    
    // console.log(`TokenInfo-payload 2: ${JSON.stringify(req.tokenInfo.getPayload())}`)   

    // console.log('TokenInfo functions: ' + Object.getOwnPropertyNames(req.tokenInfo).filter(function (p) {
    //     return typeof req.tokenInfo[p] === 'function';
    // }));  
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


