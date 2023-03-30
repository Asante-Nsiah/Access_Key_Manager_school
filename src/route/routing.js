const express = require('express');
const auth = require('../controller/authCtrl');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const router = express.Router();

router.get('/login', auth.login)
router.post('/login', auth.loginPass)
// router.get('/signup', auth.checkAuthenticated)
router.get('/signup', auth.signup)
router.post('/signup', auth.signupPass)
router.get('/dashboard', auth.dashboard)





module.exports = router;