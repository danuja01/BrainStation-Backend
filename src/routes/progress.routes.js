import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { getLecturePerformance, getStudentAlerts } from '@/controllers/dashboard';
import {
  getStudentCumulativeAverage,
  postPredictionController,
  predictScoresForModules
} from '@/controllers/progressController';
import { authorizer } from '@/middleware/auth';

const progressRouter = express.Router();

progressRouter.post(
  '/predict',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(postPredictionController)
);

progressRouter.get(
  '/predict-all-modules/',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(predictScoresForModules)
);

progressRouter.get(
  '/cumulative-average',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(getStudentCumulativeAverage)
);

progressRouter.get(
  '/lecture-performance/',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(getLecturePerformance)
);

progressRouter.get('/alerts', authorizer(['STUDENT', 'LECTURER', 'ADMIN']), tracedAsyncHandler(getStudentAlerts));

export default progressRouter;
