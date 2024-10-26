import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import {
  deleteSubtaskFromTaskController,
  getCompletedTasksByUserIdController,
  getCompletedTasksCount,
  getTaskRecommendationController
} from '@/controllers/taskController';

const taskRouter = express.Router();

taskRouter.post('/recommend-task', tracedAsyncHandler(getTaskRecommendationController));

taskRouter.post('/delete-subtask', tracedAsyncHandler(deleteSubtaskFromTaskController));

taskRouter.get('/completed-tasks-count', tracedAsyncHandler(getCompletedTasksCount));

taskRouter.get('/completed-tasks/', tracedAsyncHandler(getCompletedTasksByUserIdController));

export default taskRouter;
