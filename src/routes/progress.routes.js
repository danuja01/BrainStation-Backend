tracedAsyncHandler// src/routes/progress.routes.js

import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import {
  getStudentDetailsController,
  getPredictionController,
  getTaskRecommendationController
} from '@/controllers/progressController';

const progressRouter = express.Router();

// Route to fetch student details by ID
progressRouter.get('/student/:Student_id', tracedAsyncHandler(getStudentDetailsController));

// Route to get predictions by Student ID
progressRouter.post('/predict', tracedAsyncHandler(getPredictionController));

// Route to get task recommendations by Student ID
progressRouter.post('/task-recommendation', tracedAsyncHandler(getTaskRecommendationController));

export default progressRouter;
