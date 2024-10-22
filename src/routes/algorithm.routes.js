import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
// Ensure this is a valid import
import { getEnrolledModules, getUserData } from '@/controllers/algorithm';

// Ensure the path to the controller is correct

// Initialize the router
const algorithmRouter = express.Router();

// Route to get combined user data
algorithmRouter.get('/user-data/:userId', tracedAsyncHandler(getUserData));

// Route to predict user data
// algorithmRouter.get('/predict/:userId', tracedAsyncHandler(getUserPrediction));

// Export the router

// New route to get enrolled modules by user ID
algorithmRouter.get(
  '/enrolled-modules/:userId',
  tracedAsyncHandler(async (req, res) => {
    const { userId } = req.params;

    try {
      const modules = await getEnrolledModules(userId);
      res.status(200).json(modules);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
);

export default algorithmRouter;
