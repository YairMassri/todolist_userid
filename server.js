const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const fs = require('fs');
const crypto = require('crypto');
const app = express();
const port = process.env.PORT || 8001
const database = require('./db');

app.use(express.urlencoded({extended: true}));
app.use(express.json());

//purpose of this is to enable cross domain requests
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8001');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(flash());

app.use("/",express.static(__dirname + "/front"));
app.use("/",express.static(__dirname + "/images"));

// get the todos from the database
var todos = [];
database.query('SELECT * FROM todos', function(err, rows){
    // load todos from the database
    rows.forEach(function(data){
        todos[data.id] = data;
    });

    // include routers
    require('./routs')(app, todos, fs, database, crypto);

    // hande 404 errors
    app.use(function(req, res){
        res.status(404).render('404');
    });

    // handle generic errors
    app.use(function(err, req, res, next){
        console.log(err);
        res.status(500).send('The app found an error. Please try again later');
    });
});


// initialize the cookies and session
app.use(cookieParser());
app.use(session({secret: 'qwerty'}));

// initialize the views using ejs
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// start the server
app.listen(port, function (err) {
    if (err) console.log('error', err);

    console.log("Server listening on port " + port)
});
