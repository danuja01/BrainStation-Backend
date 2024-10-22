import express from 'express';
import { getTaskRecommendationController,deleteSubtaskFromTaskController,getCompletedTasksCount } from '@/controllers/taskController';
import { tracedAsyncHandler } from '@sliit-foss/functions';
//import { authorizer } from '@/middleware/auth';
const taskRouter = express.Router();

// Task recommendation route
taskRouter.post('/recommend-task', getTaskRecommendationController);



  taskRouter.post(
    '/delete-subtask',
    deleteSubtaskFromTaskController
  );


  taskRouter.get('/completed-tasks-count/:userId', tracedAsyncHandler(getCompletedTasksCount));


export default taskRouter;
