import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { Segments, celebrate } from 'celebrate';
import { feedbackController } from '@/controllers/openai';
import {
  getQuizzesController,
  getUserLectureScore,
  getUserQuizzesDueController,
  respondToQuiz
} from '@/controllers/quiz';
import { quizResponseSchema } from '@/validations/quiz';

const quizRouter = express.Router();

quizRouter.get('/', tracedAsyncHandler(getQuizzesController));
quizRouter.get('/score/:userId/:lectureId', tracedAsyncHandler(getUserLectureScore));
quizRouter.post('/respond', celebrate({ [Segments.BODY]: quizResponseSchema }), tracedAsyncHandler(respondToQuiz));
quizRouter.post('/feedback', tracedAsyncHandler(feedbackController));
quizRouter.get('/due', tracedAsyncHandler(getUserQuizzesDueController));

export default quizRouter;
