const express = require('express');
const router = express.Router();
const { googleLogin, login, register, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validateMiddleware');
const authValidator = require('../validators/auth/authValidator');
const verifyRecaptcha = require('../middleware/recaptchaMiddleware');

router.post('/google', googleLogin);
router.post('/register', verifyRecaptcha, validate(authValidator.register), register);
router.post('/login', validate(authValidator.login), login);
router.get('/me', protect, getMe);

module.exports = router;
