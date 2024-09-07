import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { Segments, celebrate } from 'celebrate';
import { getQuizzesController, respondToQuiz } from '@/controllers/quiz';
import { quizResponseSchema } from '@/validations/quiz';

const quizRouter = express.Router();

quizRouter.get('/', tracedAsyncHandler(getQuizzesController));
quizRouter.post('/respond', celebrate({ [Segments.BODY]: quizResponseSchema }), tracedAsyncHandler(respondToQuiz));

export default quizRouter;
