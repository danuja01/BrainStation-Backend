import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import multer from 'multer';
import { createLecture, deleteLecture, getLectureById, getLecturesByOrg, updateLecture } from '@/controllers/lecture';
import { authorizer } from '@/middleware';

const letureRouter = express.Router();
const upload = multer();
letureRouter.get('/', authorizer(['STUDENT', 'LECTURER', 'ADMIN']), tracedAsyncHandler(getLecturesByOrg));
letureRouter.post(
  '/upload',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  upload.single('file'),
  tracedAsyncHandler(createLecture)
);
letureRouter.get('/:id', authorizer(['STUDENT', 'LECTURER', 'ADMIN']), tracedAsyncHandler(getLectureById));
letureRouter.delete('/:id', authorizer(['STUDENT', 'LECTURER', 'ADMIN']), tracedAsyncHandler(deleteLecture));
letureRouter.patch('/:id', authorizer(['STUDENT', 'LECTURER', 'ADMIN']), tracedAsyncHandler(updateLecture));

export default letureRouter;
