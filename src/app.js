const express = require('express');
const routes = require('./route/routing');
const ejs = require('ejs');
const { dirname } = require('path');
const path = require('path')
const pool = require('./db');
const bcrypt = require('./controller/authCtrl');




const app = express();



app.use(express.json()); // Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies
app.use(routes)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views') );
app.use(express.static(path.join(__dirname, './../public')));












app.listen(3000, () => {
    console.log('App listening on port 3000!');
});