const Joi = require('joi');

const inventoryValidator = {
  item: (data) => {
    const schema = Joi.object({
      itemName: Joi.string().required(),
      description: Joi.string().allow('', null),
      stockCount: Joi.number().min(0).required(),
      unit: Joi.string().required(),
      reorderLevel: Joi.number().min(0).default(5)
    });
    return schema.validate(data);
  },
  
  adjust: (data) => {
    const schema = Joi.object({
      amount: Joi.number().min(1).required(),
      mode: Joi.string().valid('IN', 'OUT').required()
    });
    return schema.validate(data);
  }
};

module.exports = inventoryValidator;
