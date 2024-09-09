import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { addSessionController, getSessionByIdController, getSessionByUserController } from '@/controllers/session';

const sessionRouter = express.Router();

// Route to create a new session
sessionRouter.post('/', tracedAsyncHandler(addSessionController));

// Route to get a session by ID
sessionRouter.get('/:id', tracedAsyncHandler(getSessionByIdController));

// Route to get all sessions by user ID
sessionRouter.get('/user/:userId', tracedAsyncHandler(getSessionByUserController));

export default sessionRouter;
