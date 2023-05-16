if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const routes = require('./route/routing');
const ejs = require('ejs');
const { dirname } = require('path');
const path = require('path')
const pool = require('./db');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const validator = require('validator');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const app = express();


const initializePassport = require('./controller/passport-config');
initializePassport(passport);



app.use(helmet());
app.use(flash())
app.use(session({
    secret: 'imhotep',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.json()); // Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies
app.use(routes)




app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views') );
app.use(express.static(path.join(__dirname, './../public')));






app.listen(3000, () => {
    console.log('App listening on port 3000!');
});