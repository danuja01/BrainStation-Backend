import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { getEnrolledModules, getUserData } from '@/controllers/algorithm';

const algorithmRouter = express.Router();

algorithmRouter.get(
  '/enrolled-modules/:userId',
  tracedAsyncHandler(async (req, res) => res.status(200).json(await getEnrolledModules(req.params.userId)))
);

algorithmRouter.get(
  '/user-data/:userId/:moduleId',
  tracedAsyncHandler(async (req, res) => {
    const { userId, moduleId } = req.params;
    const trimmedModuleId = moduleId.trim(); // Trim the moduleId to remove newline characters or spaces
    const userData = await getUserData(userId, trimmedModuleId);
    res.status(200).json(userData);
  })
);

export default algorithmRouter;
