const ErrorResponse = require('../utils/errorHandler');

/**
 * Higher-order function to validate request body using a Joi validator function
 * @param {Function} validatorFunc - The joi validator function (e.g., authValidator.login)
 */
const validate = (validatorFunc) => {
  return (req, res, next) => {
    const { error } = validatorFunc(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return next(new ErrorResponse(errorMessage, 400));
    }
    
    next();
  };
};

module.exports = validate;
