
require('dotenv').config();

const express = require('express');
const routes = require('./route/routing');
const { dirname } = require('path');
const path = require('path');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db');
const port = process.env.PORT || 3000;

const app = express();

const initializePassport = require('./controller/passport-config');
initializePassport(passport);




app.use(flash())
app.use(session({
    store: new pgSession({
        pool: pool,
        // conString: 'postgres://postgres:postgres@localhost:5433/project',
        tableName: 'session',
    }),
    secret: 'imhotep',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, // Set to true for HTTPS-only cookie
        httpOnly: true, // Set to true to prevent client-side access to the cookie
        maxAge: 86400000, // Session expiration time in milliseconds (e.g., 1 day)
      },
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(express.json()); // Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies
app.use(routes)




app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views') );
app.use(express.static(path.join(__dirname, './../public')));


app.get('/', (req, res) => {
    res.send('Hello, World! THIS IS MY FIRST PROJECT');
  });


app.listen(port, () => {
    console.log('App listening on port 3000!');
});