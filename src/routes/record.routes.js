import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { Segments, celebrate } from 'celebrate';
import {
  addSessionController,
  getAverageFocusTimeByUserController,
  getAverageFocusTimeofUsersModuleController,
  getSessionByIdController,
  getSessionByUserController,
  getSessionDataController,
  getSessionsOfUserByModuleController,
  getStartAndEndTimesOfUsersModuleController,
  getTotalFocusTimeOfUsersModuleController,
  getTotalSessionDurationByUserController
} from '@/controllers/session';
import { focusRecordIdSchema } from '@/validations/focusRecords';

const sessionRouter = express.Router();

// Route to create a new session
sessionRouter.post('/', tracedAsyncHandler(addSessionController));

// Route to get a session by ID
sessionRouter.get('/:id', tracedAsyncHandler(getSessionByIdController));

// Route to get all sessions by user ID
sessionRouter.get('/user/:userId', tracedAsyncHandler(getSessionByUserController));

// Route to get all sessions by users
sessionRouter.get(
  '/userByModule/:userId',
  celebrate({ [Segments.PARAMS]: focusRecordIdSchema }),
  tracedAsyncHandler(getSessionsOfUserByModuleController)
);

// Route to get user start end times per module
sessionRouter.get(
  '/start-end-times/:userId',
  celebrate({ [Segments.PARAMS]: focusRecordIdSchema }),
  tracedAsyncHandler(getStartAndEndTimesOfUsersModuleController)
);

// Route to get user total focus time per module
sessionRouter.get(
  '/total-focus-time/:userId',
  celebrate({ [Segments.PARAMS]: focusRecordIdSchema }),
  tracedAsyncHandler(getTotalFocusTimeOfUsersModuleController)
);

// Route to get user avarage focus time per module
sessionRouter.get(
  '/average-focus-time/:userId',
  celebrate({ [Segments.PARAMS]: focusRecordIdSchema }),
  tracedAsyncHandler(getAverageFocusTimeofUsersModuleController)
);
// Route to get all sessions by users
sessionRouter.get(
  '/userByModule/:userId',
  celebrate({ [Segments.PARAMS]: focusRecordIdSchema }),
  tracedAsyncHandler(getSessionsOfUserByModuleController)
);

sessionRouter.get(
  '/sessionData/:userId',
  celebrate({ [Segments.PARAMS]: focusRecordIdSchema }),
  tracedAsyncHandler(getSessionDataController)
);

// Route to get user average focus time (without moduleId)
sessionRouter.get(
  '/average-focus-time-by-user/:userId',
  celebrate({ [Segments.PARAMS]: focusRecordIdSchema }),
  tracedAsyncHandler(getAverageFocusTimeByUserController)
);

// Route to get user total session duration by userId (sum of all session durations)
sessionRouter.get(
  '/total-session-duration-by-user/:userId',
  celebrate({ [Segments.PARAMS]: focusRecordIdSchema }),
  tracedAsyncHandler(getTotalSessionDurationByUserController)
);

export default sessionRouter;
