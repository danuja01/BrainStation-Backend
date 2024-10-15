import { Joi } from 'celebrate';

export const focusRecordIdSchema = {
  userId: Joi.string().hex().length(24).required()
};
