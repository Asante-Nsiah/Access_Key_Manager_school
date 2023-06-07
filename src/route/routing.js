const express = require('express');
const auth = require('../controller/authCtrl');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
// const { keys, revokeKey, populateTable } = require('../controller/keys');

const router = express.Router();

router.get('/login', auth.login)
router.post('/login', auth.loginPass)
// router.get('/signup', auth.checkAuthenticated)
router.get('/signup', auth.signup)
router.post('/signup', auth.signupPass)
router.get('/verify', auth.verify)
router.get('/dashboard', auth.dashboard)
router.get('/reset-password', auth.resetPassword)
router.post('/reset-password', auth.forgetPassword)
router.get('/reset-actual-password/:token', auth.resetActualPassword)
router.post('/:token', auth.resetActualPasswordPass)

router.get('/adminsPage', auth.admin)
router.get('/users', auth.users)
router.get('/accessKeys', auth.accessKeys)
router.put('/adminsPage/:users', auth.keyRevoke)
module.exports = router;