const Joi = require('joi');

const billingValidator = {
  create: (data) => {
    const schema = Joi.object({
      customer: Joi.string().required(),
      items: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        price: Joi.number().min(0).required(),
        quantity: Joi.number().min(1).default(1)
      })).required(),
      subtotal: Joi.number().min(0).required(),
      discount: Joi.number().min(0).default(0),
      total: Joi.number().min(0).required(),
      paymentMethod: Joi.string().valid('CASH', 'CARD', 'UPI', 'CREDIT').required(),
      appointment: Joi.string().optional(),
      paymentStatus: Joi.string().valid('PAID', 'PENDING', 'PARTIAL')
    });
    return schema.validate(data);
  },
  
  updateStatus: (data) => {
    const schema = Joi.object({
      status: Joi.string().valid('PAID', 'PENDING', 'PARTIAL').required()
    });
    return schema.validate(data);
  }
};

module.exports = billingValidator;
