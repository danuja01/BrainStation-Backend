import express from 'express';
import {
  addLectureController,
  createModuleController,
  getModuleController,
  getModulesController,
  updateModuleController
} from '@/controllers/module';
import { authorizer } from '@/middleware';

const moduleRouter = express.Router();

moduleRouter.post('/', authorizer(['STUDENT', 'LECTURER', 'ADMIN']), createModuleController);
moduleRouter.get('/', authorizer(['STUDENT', 'LECTURER', 'ADMIN']), getModulesController);
moduleRouter.get('/:id', authorizer(['STUDENT', 'LECTURER', 'ADMIN']), getModuleController);
moduleRouter.patch('/:id', authorizer(['STUDENT', 'LECTURER', 'ADMIN']), updateModuleController);
moduleRouter.post('/add-lecture', authorizer(['STUDENT', 'LECTURER', 'ADMIN']), addLectureController);

export default moduleRouter;
