import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { getQuizPerformanceController } from '@/controllers/quiz';

const analyticsRouter = express.Router();

analyticsRouter.get('/quiz-performance', tracedAsyncHandler(getQuizPerformanceController));

export default analyticsRouter;
