import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { getLecturePerformance, getStudentAlerts } from '@/controllers/dashboard';
import {
  getStudentCumulativeAverage,
  postPredictionController,
  predictScoresForModules
} from '@/controllers/progressController';

const progressRouter = express.Router();

progressRouter.post('/predict', tracedAsyncHandler(postPredictionController));

progressRouter.get('/predict-all-modules/', tracedAsyncHandler(predictScoresForModules));

progressRouter.get('/cumulative-average', tracedAsyncHandler(getStudentCumulativeAverage));

progressRouter.get('/lecture-performance/', tracedAsyncHandler(getLecturePerformance));

progressRouter.get('/alerts', tracedAsyncHandler(getStudentAlerts));

export default progressRouter;
