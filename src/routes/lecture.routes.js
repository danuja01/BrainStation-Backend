import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import multer from 'multer';
import { createLecture, deleteLecture, getLectureById, getLecturesByOrg, updateLecture } from '@/controllers/lecture';

const letureRouter = express.Router();
const upload = multer();
letureRouter.get('/', tracedAsyncHandler(getLecturesByOrg));
letureRouter.post('/upload', upload.single('file'), tracedAsyncHandler(createLecture));
letureRouter.get('/:id', tracedAsyncHandler(getLectureById));
letureRouter.delete('/:id', tracedAsyncHandler(deleteLecture));
letureRouter.patch('/:id', tracedAsyncHandler(updateLecture));

export default letureRouter;
