import express from 'express';
import {
  addLectureController,
  createModuleController,
  getModuleController,
  getModulesController,
  updateModuleController
} from '@/controllers/module';

const moduleRouter = express.Router();

moduleRouter.post('/', createModuleController);
moduleRouter.get('/', getModulesController);
moduleRouter.get('/:id', getModuleController);
moduleRouter.patch('/:id', updateModuleController);
moduleRouter.post('/add-lecture', addLectureController);

export default moduleRouter;
