import Joi from "joi";

export const addDoctorSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  specialization: Joi.string().required(),
  consultationFee: Joi.number().min(0).required(),
  password: Joi.string().min(6).required()
});
