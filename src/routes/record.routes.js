import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import {
  addSessionController,
  getAdhdClassificationFeedbackController,
  getAverageFocusTimeByUserController,
  getAverageFocusTimeofUsersModuleController,
  getDistinctSessionDaysByUserIdController,
  getSessionByIdController,
  getSessionByUserController,
  getSessionCountByUserIdController,
  getSessionDataController,
  getSessionDataOfStudentsController,
  getSessionsOfUserByModuleController,
  getStartAndEndTimesOfUsersModuleController,
  getTotalFocusTimeOfUsersModuleController,
  getTotalSessionDurationByUserController
} from '@/controllers/session';

const sessionRouter = express.Router();

// Route to get user feedback for adhd classification
sessionRouter.post('/classification-feedback', tracedAsyncHandler(getAdhdClassificationFeedbackController));

// Route to create a new session
sessionRouter.post('/', tracedAsyncHandler(addSessionController));

// Route to get all sessions by user ID
sessionRouter.get('/user/:id', tracedAsyncHandler(getSessionByUserController));

// Route to get all sessions by users
sessionRouter.get('/userByModule', tracedAsyncHandler(getSessionsOfUserByModuleController));

// Route to get user start end times per module
sessionRouter.get('/start-end-times', tracedAsyncHandler(getStartAndEndTimesOfUsersModuleController));

// Route to get user total focus time per module
sessionRouter.get('/total-focus-time', tracedAsyncHandler(getTotalFocusTimeOfUsersModuleController));

// Route to get user avarage focus time per module
sessionRouter.get('/average-focus-time', tracedAsyncHandler(getAverageFocusTimeofUsersModuleController));

// Route to get all sessions by users
sessionRouter.get('/userByModule', tracedAsyncHandler(getSessionsOfUserByModuleController));

sessionRouter.get('/sessionData/:id', tracedAsyncHandler(getSessionDataController));

sessionRouter.get('/userSessionData', tracedAsyncHandler(getSessionDataOfStudentsController));

// Route to get user average focus time (without moduleId)
sessionRouter.get('/average-focus-time-by-user', tracedAsyncHandler(getAverageFocusTimeByUserController));

// Route to get user total session duration by userId (sum of all session durations)
sessionRouter.get('/total-session-duration-by-user', tracedAsyncHandler(getTotalSessionDurationByUserController));

sessionRouter.get('/count', tracedAsyncHandler(getSessionCountByUserIdController));

sessionRouter.get('/distinct-days', tracedAsyncHandler(getDistinctSessionDaysByUserIdController));

// Route to get a session by ID
sessionRouter.get('/:id', tracedAsyncHandler(getSessionByIdController));

export default sessionRouter;
