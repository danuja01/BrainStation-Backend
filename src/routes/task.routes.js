import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import {
  deleteSubtaskFromTaskController,
  getCompletedTasksCount,
  getTaskRecommendationController
} from '@/controllers/taskController';
import { authorizer } from '@/middleware';

const taskRouter = express.Router();

// Task recommendation route
taskRouter.post('/recommend-task', authorizer(['STUDENT', 'LECTURER', 'ADMIN']), getTaskRecommendationController);

taskRouter.post('/delete-subtask', authorizer(['STUDENT', 'LECTURER', 'ADMIN']), deleteSubtaskFromTaskController);

taskRouter.get(
  '/completed-tasks-count',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(getCompletedTasksCount)
);

export default taskRouter;
