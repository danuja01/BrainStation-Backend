import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
// Ensure this is a valid import
import { getUserData } from '@/controllers/algorithm';

// Ensure the path to the controller is correct

// Initialize the router
const algorithmRouter = express.Router();

// Route to get combined user data
algorithmRouter.get('/user-data/:userId', tracedAsyncHandler(getUserData));

// Route to predict user data
// algorithmRouter.get('/predict/:userId', tracedAsyncHandler(getUserPrediction));

// Export the router
export default algorithmRouter;
