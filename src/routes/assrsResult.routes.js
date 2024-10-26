import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import {
  checkAssrResultAgeController,
  checkAssrResultExistsController,
  createAssrResultController,
  getOneAssr,
  updateAssrResultController
} from '@/controllers/assrsResult';
import { authorizer } from '@/middleware';

const assrsResultRouter = express.Router();

// Route to create a new ASRS result
assrsResultRouter.post(
  '/',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(createAssrResultController)
);

// Route to check if an ASRS result exists for a specific user
assrsResultRouter.get(
  '/check',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(checkAssrResultExistsController)
);

// Route to check if the existing ASRS result is older than 6 months
assrsResultRouter.get(
  '/check-age',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(checkAssrResultAgeController)
);

assrsResultRouter.get('/getByUser', authorizer(['STUDENT', 'LECTURER', 'ADMIN']), tracedAsyncHandler(getOneAssr));

// Route to update an ASRS result
assrsResultRouter.patch(
  '/',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(updateAssrResultController)
);

export default assrsResultRouter;
