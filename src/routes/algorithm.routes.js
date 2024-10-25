import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { getEnrolledModules, getUserData } from '@/controllers/algorithm';

const algorithmRouter = express.Router();

algorithmRouter.get(
  '/enrolled-modules/:userId',
  tracedAsyncHandler(async (req, res) => res.status(200).json(await getEnrolledModules(req.params.userId)))
);

algorithmRouter.get(
  '/user-data/:userId/:moduleId', // URL with userId and moduleId as parameters
  //  authorizer(['STUDENT', 'LECTURER', 'ADMIN']), // Role-based authorization
  tracedAsyncHandler(async (req, res) => res.status(200).json(await getUserData(req.params.userId))) // Controller to handle the request
);

export default algorithmRouter;
