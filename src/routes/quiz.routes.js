import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { Segments, celebrate } from 'celebrate';
import { getQuizzesController, getUserLectureScore, respondToQuiz } from '@/controllers/quiz';
import { quizResponseSchema } from '@/validations/quiz';

const quizRouter = express.Router();

quizRouter.get('/', tracedAsyncHandler(getQuizzesController));
quizRouter.post('/respond', celebrate({ [Segments.BODY]: quizResponseSchema }), tracedAsyncHandler(respondToQuiz));
quizRouter.get('/score/:userId/:lectureId', tracedAsyncHandler(getUserLectureScore));

export default quizRouter;
