const Joi = require('joi');

const customerValidator = {
  create: (data) => {
    const schema = Joi.object({
      name: Joi.string().min(2).max(50).required(),
      phone: Joi.string().required(),
      email: Joi.string().email().allow('', null),
      address: Joi.string().allow('', null),
      birthday: Joi.date().allow(null, ''),
      dateOfBirth: Joi.date().allow(null, ''),
      anniversary: Joi.date().allow(null, ''),
      skinToneInfo: Joi.object({
        skinType: Joi.string().allow('', null),
        concerns: Joi.array().items(Joi.string()),
        notes: Joi.string().allow('', null)
      }),
      password: Joi.string().min(6).allow('', null),
      role: Joi.string().valid('ADMIN', 'STAFF', 'CUSTOMER'),
      subscription: Joi.object({
        planName: Joi.string().allow('', null),
        status: Joi.string().valid('ACTIVE', 'INACTIVE', 'EXPIRED', 'CANCELLED').allow('', null),
        startDate: Joi.date().allow(null, ''),
        endDate: Joi.date().allow(null, '')
      }).allow(null)
    });
    return schema.validate(data);
  },
  update: (data) => {
    const schema = Joi.object({
      name: Joi.string().min(2).max(50),
      email: Joi.string().email().allow('', null),
      phone: Joi.string(),
      address: Joi.string().allow('', null),
      skinType: Joi.string().allow('', null),
      birthday: Joi.date().allow(null, ''),
      dateOfBirth: Joi.date().allow(null, ''),
      anniversary: Joi.date().allow(null, ''),
      skinToneInfo: Joi.object({
        skinType: Joi.string().allow('', null),
        concerns: Joi.array().items(Joi.string()),
        notes: Joi.string().allow('', null)
      }),
      loyaltyPoints: Joi.number().min(0),
      isProfileComplete: Joi.boolean(),
      isOff: Joi.boolean(),
      specialization: Joi.array().items(Joi.string()),
      role: Joi.string().valid('ADMIN', 'STAFF', 'CUSTOMER'),
      availability: Joi.array().items(Joi.object({
        day: Joi.string(),
        slots: Joi.array().items(Joi.string())
      })),
      password: Joi.string().min(6).allow('', null),
      subscription: Joi.object({
        planName: Joi.string().allow('', null),
        status: Joi.string().valid('ACTIVE', 'INACTIVE', 'EXPIRED', 'CANCELLED').allow('', null),
        startDate: Joi.date().allow(null, ''),
        endDate: Joi.date().allow(null, '')
      }).allow(null)
    });
    return schema.validate(data);
  }
};

module.exports = customerValidator;
