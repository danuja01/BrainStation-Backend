import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { generateQuestionsController } from '@/controllers/QuestionGeneratorController';
import { authorizer } from '@/middleware/auth';

const questionRouter = express.Router();

questionRouter.post('/generate-questions', authorizer(['ADMIN']), tracedAsyncHandler(generateQuestionsController));

export default questionRouter;
