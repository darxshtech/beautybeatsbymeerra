const Joi = require('joi');

const serviceValidator = {
  create: (data) => {
    const schema = Joi.object({
      name: Joi.string().min(2).max(100).required(),
      description: Joi.string().allow('', null),
      category: Joi.string().required(),
      duration: Joi.number().min(5).required(),
      price: Joi.number().min(0).required(),
      isActive: Joi.boolean().default(true)
    });
    return schema.validate(data);
  },
  
  createPackage: (data) => {
    const schema = Joi.object({
      name: Joi.string().required(),
      serviceIds: Joi.array().items(Joi.string()).required(),
      totalPrice: Joi.number().min(0).required(),
      description: Joi.string().allow('', null)
    });
    return schema.validate(data);
  }
};

module.exports = serviceValidator;
