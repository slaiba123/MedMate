import Joi from "joi";

export const bookAppointmentSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
  doctorId: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.string().required(),
  symptoms: Joi.string().allow("", null) // optional
});
