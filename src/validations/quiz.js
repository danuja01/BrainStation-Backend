import { Joi } from 'celebrate';

export const quizResponseSchema = {
  lectureId: Joi.string().hex().length(24).required(),
  questionId: Joi.string().hex().length(24).required(),
  moduleId: Joi.string().hex().length(24).required(),
  response: Joi.string().valid('easy', 'hard', 'normal', 'wrong').required(),
  attempt_question: Joi.number().required()
};
