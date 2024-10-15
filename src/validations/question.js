import { Joi } from 'celebrate';

export const questionIdSchema = {
  id: Joi.string().hex().length(24).required()
};

export const questionCreateSchema = {
  context: Joi.string().required(),
  question: Joi.string().required(),
  alternative_questions: Joi.array().items(Joi.string().required()).required(),
  answer: Joi.string().required(),
  distractors: Joi.array().items(Joi.string().required()).length(3).required(),
  lectureId: Joi.string().hex().length(24).required()
};

export const bulkInsertQuestionsSchema = Joi.array()
  .items(
    Joi.object({
      context: Joi.string().required(),
      question: Joi.string().required(),
      alternative_questions: Joi.array().items(Joi.string().required()).required(),
      answer: Joi.string().required(),
      distractors: Joi.array().items(Joi.string().required()).length(3).required(),
      lectureId: Joi.string().hex().length(24).required()
    })
  )
  .required();
