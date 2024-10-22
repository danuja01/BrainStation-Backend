import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import {
  deleteSubtaskFromTaskController,
  getCompletedTasksByTaskIdController,
  getCompletedTasksCount,
  getModulesAndScoresByUserController,
  getStudentDetailsController,
  getTaskRecommendationController,
  postPredictionController,
  postPredictionForAllModulesController,
  predictScoresForModules
} from '@/controllers/progressController';
import { authorizer } from '@/middleware/auth';

const progressRouter = express.Router();

// Route to fetch student details by ID
progressRouter.get(
  '/student/:Student_id',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(getStudentDetailsController)
);

// Route to get predictions by Student ID
progressRouter.post(
  '/predict',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(postPredictionController)
);

// Route to get task recommendations by Student ID
progressRouter.post(
  '/task-recommendation',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(getTaskRecommendationController)
);

// progressRouter.post('/delete-subtasks', tracedAsyncHandler(deleteSubtaskFromTaskController));

progressRouter.post(
  '/delete-subtask',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  (req, res, next) => {
    next(); // Pass the request to the actual controller
  },
  deleteSubtaskFromTaskController
);

progressRouter.get(
  '/completed-tasks/:taskId',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  getCompletedTasksByTaskIdController
);
// Add this in your progress.routes.js
progressRouter.get('/completed-tasks-count/:studentId', tracedAsyncHandler(getCompletedTasksCount));
// progressRouter.get('/user-data/:userId', tracedAsyncHandler(getUserData));
progressRouter.post(
  '/predict-all-modules',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(postPredictionForAllModulesController)
);
// Route to get completed modules by user ID
progressRouter.get(
  '/user/:userId/modules',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(getModulesAndScoresByUserController)
);

progressRouter.get(
  '/predict-all-modules/:userId',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(predictScoresForModules)
);

export default progressRouter;
