import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { Segments, celebrate } from 'celebrate';
import { generateQuestionsController } from '@/controllers/QuestionGenerator';
import {
  bulkInsertQuestions,
  createQuestion,
  deleteQuestion,
  getOneQuestion,
  getQuestionById,
  updateQuestion,
  viewQuestions
} from '@/controllers/question';
import { authorizer } from '@/middleware/auth';
import { bulkInsertQuestionsSchema, questionCreateSchema, questionIdSchema } from '@/validations/question';

const questionRouter = express.Router();

questionRouter.post('/generate-questions', authorizer(['ADMIN']), tracedAsyncHandler(generateQuestionsController));

questionRouter.post(
  '/',
  authorizer(['ADMIN']),
  celebrate({ [Segments.BODY]: questionCreateSchema }),
  tracedAsyncHandler(createQuestion)
);

questionRouter.post(
  '/bulk-insert',
  authorizer(['ADMIN']),
  celebrate({ [Segments.BODY]: bulkInsertQuestionsSchema }),
  tracedAsyncHandler(bulkInsertQuestions)
);

questionRouter.get('/', tracedAsyncHandler(viewQuestions));

questionRouter.get('/:id', celebrate({ [Segments.PARAMS]: questionIdSchema }), tracedAsyncHandler(getQuestionById));

questionRouter.get('/one', tracedAsyncHandler(getOneQuestion));

questionRouter.patch(
  '/:id',
  authorizer(['ADMIN']),
  celebrate({ [Segments.PARAMS]: questionIdSchema, [Segments.BODY]: questionCreateSchema }),
  tracedAsyncHandler(updateQuestion)
);

questionRouter.delete(
  '/:id',
  authorizer(['ADMIN']),
  celebrate({ [Segments.PARAMS]: questionIdSchema }),
  tracedAsyncHandler(deleteQuestion)
);

export default questionRouter;
