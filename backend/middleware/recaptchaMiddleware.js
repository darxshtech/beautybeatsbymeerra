const axios = require('axios');
const ErrorResponse = require('../utils/errorHandler');

const verifyRecaptcha = async (req, res, next) => {
  const recaptchaToken = req.headers['x-recaptcha-token'] || req.body.recaptchaToken;

  if (!recaptchaToken) {
    return next(new ErrorResponse('Please complete the ReCaptcha', 400));
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    );

    if (!response.data.success) {
      return next(new ErrorResponse('ReCaptcha verification failed', 400));
    }

    next();
  } catch (err) {
    next(new ErrorResponse('ReCaptcha service error', 500));
  }
};

module.exports = verifyRecaptcha;
