import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { Segments, celebrate } from 'celebrate';
import { generateQuestionsController } from '@/controllers/openai';
import {
  bulkInsertQuestions,
  createQuestion,
  deleteQuestion,
  flagQuestion,
  getFlaggedQuestions,
  getOneQuestion,
  getQuestionById,
  getQuestionCountByModule,
  updateQuestion,
  viewQuestions
} from '@/controllers/question';
import { authorizer } from '@/middleware/auth';
import {
  bulkInsertQuestionsSchema,
  moduleIdSchema,
  questionCreateSchema,
  questionIdSchema
} from '@/validations/question';

const questionRouter = express.Router();

// Generate questions
questionRouter.post('/generate-questions', authorizer(['ADMIN']), tracedAsyncHandler(generateQuestionsController));

// CRUD routes for questions
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

// Flagged questions
// REVOKED!
questionRouter.get('/flagged', authorizer(['ADMIN']), tracedAsyncHandler(getFlaggedQuestions));

questionRouter.get(
  '/count/:moduleId',
  celebrate({ [Segments.PARAMS]: moduleIdSchema }),
  tracedAsyncHandler(getQuestionCountByModule)
);

// Individual question routes
questionRouter.get('/:id', celebrate({ [Segments.PARAMS]: questionIdSchema }), tracedAsyncHandler(getQuestionById));
questionRouter.get('/one', tracedAsyncHandler(getOneQuestion));

questionRouter.post('/:id/flag', celebrate({ [Segments.PARAMS]: questionIdSchema }), tracedAsyncHandler(flagQuestion));

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
