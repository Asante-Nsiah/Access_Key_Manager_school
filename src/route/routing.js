const express = require('express');
const auth = require('../controller/authCtrl');

const router = express.Router();

router.get('/login', auth.login)





module.exports = router;