const Joi = require('joi');

const expenseValidator = {
  create: (data) => {
    const schema = Joi.object({
      description: Joi.string().required(),
      category: Joi.string().required(), // Rent, Salaries, Supplies, etc.
      amount: Joi.number().min(0).required(),
      date: Joi.date().default(Date.now),
      notes: Joi.string().allow('', null)
    });
    return schema.validate(data);
  }
};

module.exports = expenseValidator;
