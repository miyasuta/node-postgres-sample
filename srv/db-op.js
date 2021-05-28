'use strict'

function getAll(db, res) {
    const query = 'SELECT * FROM products'
    db.manyOrNone(query)
        .then((data) => {
            // success
            res.status(200).json(data)
        })
        .catch((error) => {
            // error
            res.status(500)
            res.end(`Error accessing DB: ${JSON.stringify(error)}`)
        })
}

function getOne(db, res, id) {
    db.one({
        name: 'find-product',
        text: 'SELECT * FROM products WHERE id = $1',
        values : [id]
    })
        .then((product) => {
            res.status(200).json(product)
        })
        .catch((error) => {
            // error
            res.status(500)
            res.end(`Error accessing DB: ${JSON.stringify(error)}`)
        })
}

function insertOne(db, res, newData) {
    db.one({
        name: 'insert-product',
        text: 'INSERT INTO products(name, price) values($1, $2) RETURNING *',
        values : [newData.name, newData.price]
    })
        .then((product) => {
            res.status(201).json(product)
        })
        .catch((error) => {
            // error
            res.status(500)
            res.end(`Error accessing DB: ${JSON.stringify(error)}`)
        })    
}

function modifyOne(db, res, id, newData) {
    db.one({
        name: 'update-product',
        text: 'UPDATE products set name = $1, price = $2 WHERE id = $3 RETURNING *',
        values : [newData.name, newData.price, id]
    })
        .then((product) => {
            res.status(200).json(product)
        })
        .catch((error) => {
            // error
            res.status(500)
            res.end(`Error accessing DB: ${JSON.stringify(error)}`)
        })    
}

function deleteOne(db, res, id) {
    db.result({
        name: 'delete-product',
        text: 'DELETE FROM products WHERE id = $1',
        values: [id]
    })
    .then((product) => {
        res.status(200).end('OK')
    })
    .catch((error) => {
        // error
        res.status(500)
        res.end(`Error accessing DB: ${JSON.stringify(error)}`)
    })       
}

module.exports = {
    getAll: getAll,
    getOne: getOne,
    insertOne: insertOne,
    modifyOne: modifyOne,
    deleteOne: deleteOne
}