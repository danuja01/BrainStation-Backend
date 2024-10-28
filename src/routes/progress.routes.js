import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { getEnrolledModules, getUserData } from '@/controllers/algorithm';
import { getLecturePerformance, getOldPerformanceTypesController, getStudentAlerts } from '@/controllers/dashboard';
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

progressRouter.get('/enrolled-modules/', tracedAsyncHandler(getEnrolledModules));

progressRouter.get('/user-data/:moduleId', tracedAsyncHandler(getUserData));

// New route to get the ordered performer types from notcompleted tasks
progressRouter.get('/performance-types', tracedAsyncHandler(getOldPerformanceTypesController));

export default progressRouter;
