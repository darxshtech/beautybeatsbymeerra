const Joi = require('joi');

const appointmentValidator = {
  create: (data) => {
    const schema = Joi.object({
      service: Joi.string().required(),
      appointmentDate: Joi.date().required(),
      timeSlot: Joi.string().required(),
      notes: Joi.string().allow('', null),
      customerInfo: Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().required()
      }).optional(),
      customerId: Joi.string().optional(),
      staff: Joi.string().allow('', null),
      paymentMethod: Joi.string().allow('', null),
      couponCode: Joi.string().allow('', null),
      totalPrice: Joi.number().optional(),
      pointsRedeemed: Joi.number().optional().default(0),
      type: Joi.string().valid('ONLINE', 'WALKIN').optional().default('ONLINE')
    });
    return schema.validate(data);
  },
  
  update: (data) => {
    const schema = Joi.object({
      status: Joi.string().uppercase().valid('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'IN-PROGRESS', 'COMPLETED', 'CANCELLED', 'NOSHOW'),
      appointmentDate: Joi.date(),
      timeSlot: Joi.string(),
      notes: Joi.string().allow('', null),
      staff: Joi.string().allow('', null)
    });
    return schema.validate(data);
  }
};

module.exports = appointmentValidator;
