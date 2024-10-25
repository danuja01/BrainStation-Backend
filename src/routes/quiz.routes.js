import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { Segments, celebrate } from 'celebrate';
import { feedbackController } from '@/controllers/openai';
import {
  getAttemptQuizIndexController,
  getQuizzesController,
  getQuizzesScoreController,
  getUserQuizzesDueController,
  respondToQuiz
} from '@/controllers/quiz';
import { quizResponseSchema } from '@/validations/quiz';

const quizRouter = express.Router();

quizRouter.get('/', tracedAsyncHandler(getQuizzesController));
quizRouter.get('/score', tracedAsyncHandler(getQuizzesScoreController));
quizRouter.post('/respond', celebrate({ [Segments.BODY]: quizResponseSchema }), tracedAsyncHandler(respondToQuiz));
quizRouter.post('/feedback', tracedAsyncHandler(feedbackController));
quizRouter.get('/due', tracedAsyncHandler(getUserQuizzesDueController));
quizRouter.get('/attempt/:lectureId', tracedAsyncHandler(getAttemptQuizIndexController));

export default quizRouter;
