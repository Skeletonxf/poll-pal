// run with: node app.js

// import our server library
const express = require('express')
// create a server
const app = express()
// use this port so http://localhost:3000/ to connect when running locally
const port = 3000

// when user accesses the root of the site return their browser 'Hello world'
app.get('/', (req, res) => res.send('Hello World!'))

// listen to this port
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// (something) => foo
// is a function that takes something and does foo
// long form is
//
// function(something) {
//   foo
// }
//
