import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { Segments, celebrate } from 'celebrate';
import { feedbackController } from '@/controllers/openai';
import {
  getAttemptQuizIndexController,
  getLectureQuizSummaryController,
  getQuizzesController,
  getQuizzesScoreController,
  getUserQuizzesDueController,
  getUserQuizzesDueDetailsController,
  respondToQuiz
} from '@/controllers/quiz';
import { quizResponseSchema } from '@/validations/quiz';

const quizRouter = express.Router();

quizRouter.get('/', tracedAsyncHandler(getQuizzesController));
quizRouter.get('/score', tracedAsyncHandler(getQuizzesScoreController));
quizRouter.post('/respond', celebrate({ [Segments.BODY]: quizResponseSchema }), tracedAsyncHandler(respondToQuiz));
quizRouter.post('/feedback/:lectureId', tracedAsyncHandler(feedbackController));
quizRouter.get('/due', tracedAsyncHandler(getUserQuizzesDueController));
quizRouter.get('/due/details', tracedAsyncHandler(getUserQuizzesDueDetailsController));
quizRouter.get('/attempt/:lectureId', tracedAsyncHandler(getAttemptQuizIndexController));
quizRouter.get('/summary/:moduleId', tracedAsyncHandler(getLectureQuizSummaryController));

export default quizRouter;
