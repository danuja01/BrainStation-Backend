import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { Segments, celebrate } from 'celebrate';
import {
  bulkInsertQuestions,
  createQuestion,
  deleteQuestion,
  flagQuestion,
  getFlaggedQuestions,
  getOneQuestion,
  getQuestionById,
  updateQuestion,
  viewQuestions
} from '@/controllers/question';
import { generateQuestionsController } from '@/controllers/questionGenerator';
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
questionRouter.get('/flagged', authorizer(['ADMIN']), tracedAsyncHandler(getFlaggedQuestions));

questionRouter.post('/:id/flag', celebrate({ [Segments.PARAMS]: questionIdSchema }), tracedAsyncHandler(flagQuestion));

questionRouter.get('/', tracedAsyncHandler(viewQuestions));

questionRouter.get('/one', tracedAsyncHandler(getOneQuestion));

questionRouter.get('/:id', celebrate({ [Segments.PARAMS]: questionIdSchema }), tracedAsyncHandler(getQuestionById));

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
