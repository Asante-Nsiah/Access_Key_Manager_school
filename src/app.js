const express = require('express');
const routes = require('./route/routing');
const ejs = require('ejs');
const { dirname } = require('path');
const path = require('path')


const app = express();
app.use(express.json())

app.use(routes)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views') );
app.use(express.static(path.join(__dirname, './../public')));








app.get('/', (req, res) => {
    res.send("I'm backend developer");
});




app.listen(3000, () => {
    console.log('App listening on port 3000!');
});