import express from 'express';
import {
  getAcademicForecastController,
  getTaskTrackerController,
  getUserProgressController
} from '@/controllers/forcast';

const forcastRouter = express.Router();

forcastRouter.get('/academic-forecast', getAcademicForecastController);

forcastRouter.get('/task-tracker', getTaskTrackerController);

forcastRouter.get('/progress', getUserProgressController);

export default forcastRouter;
