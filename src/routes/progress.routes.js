import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import {
  getLecturePerformance, // deleteSubtaskFromTaskController,
  // getCompletedTasksByTaskIdController,
  // getCompletedTasksCount,
  // getModulesAndScoresByUserController,
  getStudentAlerts
} from '@/controllers/dashboard';
import {
  getStudentCumulativeAverage, // deleteSubtaskFromTaskController,
  // getCompletedTasksByTaskIdController,
  // getCompletedTasksCount,
  // getModulesAndScoresByUserController,
  // getTaskRecommendationController,
  postPredictionController, // postPredictionForAllModulesController,
  predictScoresForModules
} from '@/controllers/progressController';
import { authorizer } from '@/middleware/auth';

const progressRouter = express.Router();

// Route to get predictions by Student ID and moduleid
progressRouter.post(
  '/predict',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(postPredictionController)
);

// get predictions by Student ID
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
