import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import {
  deleteSubtaskFromTaskController,
  getCompletedTasksByTaskIdController,
  getCompletedTasksCount,
  getStudentDetailsController,
  getTaskRecommendationController,
  getUserData, // getStudentDetailsController
  postPredictionController
} from '@/controllers/progressController';

const progressRouter = express.Router();

// Route to fetch student details by ID
progressRouter.get('/student/:Student_id', tracedAsyncHandler(getStudentDetailsController));

// Route to get predictions by Student ID
progressRouter.post('/predict', tracedAsyncHandler(postPredictionController));

// Route to get task recommendations by Student ID
progressRouter.post('/task-recommendation', tracedAsyncHandler(getTaskRecommendationController));

// progressRouter.post('/delete-subtasks', tracedAsyncHandler(deleteSubtaskFromTaskController));

progressRouter.post(
  '/delete-subtask',
  (req, res, next) => {
    next(); // Pass the request to the actual controller
  },
  deleteSubtaskFromTaskController
);

progressRouter.get('/completed-tasks/:taskId', getCompletedTasksByTaskIdController);
// Add this in your progress.routes.js
progressRouter.get('/completed-tasks-count/:studentId', tracedAsyncHandler(getCompletedTasksCount));
progressRouter.get('/user-data/:userId', tracedAsyncHandler(getUserData));

export default progressRouter;
