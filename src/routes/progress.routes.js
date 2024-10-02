import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import {
  deleteSubtaskFromTaskController,
  getCompletedTasksByTaskIdController,
  postPredictionController,
  getStudentDetailsController,
  getTaskRecommendationController
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
    console.log('Request received at /delete-subtask'); // Ensure the route is hit
    console.log('Request body:', req.body); // Log the body to ensure it's not empty
    next(); // Pass the request to the actual controller
  },
  deleteSubtaskFromTaskController
);

progressRouter.get('/completed-tasks/:taskId', getCompletedTasksByTaskIdController);


export default progressRouter;
