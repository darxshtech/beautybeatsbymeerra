const Joi = require('joi');

const authValidator = {
  login: (data) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });
    return schema.validate(data);
  },
  
  register: (data) => {
    const schema = Joi.object({
      name: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      phone: Joi.string().required(),
      role: Joi.string().valid('ADMIN', 'STAFF', 'CUSTOMER')
    });
    return schema.validate(data);
  }
};

module.exports = authValidator;
