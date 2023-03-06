const express = require('express');
const auth = require('../controller/authCtrl');
const { Pool } = require('pg');


const router = express.Router();

router.get('/login', auth.login)
router.all('/signup', auth.signup)
// router.post('/signup', auth.processSignup)




module.exports = router;