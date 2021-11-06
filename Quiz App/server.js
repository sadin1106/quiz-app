var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
// const MongoClient = require('mongodb').MongoClient
var DATABASE_NAME = "dbs";
var DATABASE_URL = `mongodb://localhost:27017/${DATABASE_NAME}`
const routes = require('./routes/posts');
const cors = require('cors')

// create express app
const app = express();
app.use(cors());

// serve static files (html, css, js, images...)
app.use(express.static('public'));

// decode req.body from form-data
app.use(express.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

app.use('/attempt', routes);

// connect to mongodb
async function startServer() {
    await mongoose.connect(DATABASE_URL, { useUnifiedTopology: true, useNewUrlParser: true })
    let db = mongoose.connection;
    db.on('error', (error) => console.error(error));
    if (!db)
        console.log('cannot connect to database');
    else
        console.log('database connected')

    app.listen(3000, function() {
        console.log('Listening on port 3000!');
    });

}
startServer();