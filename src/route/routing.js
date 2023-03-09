const express = require('express');
const auth = require('../controller/authCtrl');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const router = express.Router();

router.get('/login', auth.login)
router.all('/signup', auth.signup)
// router.get('/dashboard', auth.dashboard)





module.exports = router;