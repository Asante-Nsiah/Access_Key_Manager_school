const express = require('express');
const auth = require('../controller/authCtrl');
const { Pool } = require('pg');


const router = express.Router();

router.get('/login', auth.login)
router.post('/login', auth.loginPass)

router.get('/signup', auth.signup)
router.post('/signup', auth.signupPass)
router.get('/verify', auth.verify)
router.get('/logout', auth.logout) 

router.get('/dashboard', auth.checkSession, auth.dashboard)
router.get('/adminsPage', auth.checkSession, auth.admin)

router.get('/reset-password', auth.resetPassword)
router.post('/reset-password', auth.forgetPassword)
router.get('/reset-actual-password/:token', auth.resetActualPassword)
router.post('/reset-actual-password', auth.resetActualPasswordPass)


router.get('/users', auth.users)
router.get('/accessKeys', auth.accessKeys)
router.get('/status', auth.getKeyRevoke)

router.get('/users/:id/status', auth.keyRevoke)
router.put('/users/:id/status', auth.keyRevoke)
router.post('/users/:id/status', auth.keyRevoke)
module.exports = router;