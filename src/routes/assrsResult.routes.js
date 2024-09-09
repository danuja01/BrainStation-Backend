import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import {
  checkAssrResultAgeController,
  checkAssrResultExistsController,
  createAssrResultController,
  getOneAssr,
  updateAssrResultController
} from '@/controllers/assrsResult';

const assrsResultRouter = express.Router();

// Route to create a new ASRS result
assrsResultRouter.post('/', tracedAsyncHandler(createAssrResultController));

// Route to check if an ASRS result exists for a specific user
assrsResultRouter.get('/:userId/check', tracedAsyncHandler(checkAssrResultExistsController));

// Route to check if the existing ASRS result is older than 6 months
assrsResultRouter.get('/:userId/check-age', tracedAsyncHandler(checkAssrResultAgeController));

assrsResultRouter.get('/getByUser/:userId', tracedAsyncHandler(getOneAssr));

// Route to update an ASRS result
assrsResultRouter.patch('/:userId', tracedAsyncHandler(updateAssrResultController));

export default assrsResultRouter;
