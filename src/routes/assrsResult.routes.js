import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import {
  checkAssrResultAgeController,
  checkAssrResultExistsController,
  createAssrResultController,
  getAlternativeAssrController,
  getOneAssr,
  updateAssrResultController
} from '@/controllers/assrsResult';

const assrsResultRouter = express.Router();

// Route to create a new ASRS result
assrsResultRouter.post('/', tracedAsyncHandler(createAssrResultController));

// Route to check if an ASRS result exists for a specific user
assrsResultRouter.get('/check', tracedAsyncHandler(checkAssrResultExistsController));

// Route to check if the existing ASRS result is older than 6 months
assrsResultRouter.get('/check-age', tracedAsyncHandler(checkAssrResultAgeController));

assrsResultRouter.get('/getByUser', tracedAsyncHandler(getOneAssr));

assrsResultRouter.get('/alternate-questions', tracedAsyncHandler(getAlternativeAssrController));

// Route to update an ASRS result
assrsResultRouter.patch('/', tracedAsyncHandler(updateAssrResultController));

export default assrsResultRouter;
