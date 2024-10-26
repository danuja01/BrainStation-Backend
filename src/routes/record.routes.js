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
import { authorizer } from '@/middleware';
import { focusRecordIdSchema } from '@/validations/focusRecords';

const sessionRouter = express.Router();

// Route to create a new session
sessionRouter.post('/', authorizer(['STUDENT', 'LECTURER', 'ADMIN']), tracedAsyncHandler(addSessionController));

// Route to get a session by ID
sessionRouter.get('/:id', authorizer(['STUDENT', 'LECTURER', 'ADMIN']), tracedAsyncHandler(getSessionByIdController));

// Route to get all sessions by user ID
sessionRouter.get(
  '/user',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(getSessionByUserController)
);

// Route to get all sessions by users
sessionRouter.get(
  '/userByModule',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  celebrate({ [Segments.PARAMS]: focusRecordIdSchema }),
  tracedAsyncHandler(getSessionsOfUserByModuleController)
);

// Route to get user start end times per module
sessionRouter.get(
  '/start-end-times',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  celebrate({ [Segments.PARAMS]: focusRecordIdSchema }),
  tracedAsyncHandler(getStartAndEndTimesOfUsersModuleController)
);

// Route to get user total focus time per module
sessionRouter.get(
  '/total-focus-time',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  celebrate({ [Segments.PARAMS]: focusRecordIdSchema }),
  tracedAsyncHandler(getTotalFocusTimeOfUsersModuleController)
);

// Route to get user avarage focus time per module
sessionRouter.get(
  '/average-focus-time',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  celebrate({ [Segments.PARAMS]: focusRecordIdSchema }),
  tracedAsyncHandler(getAverageFocusTimeofUsersModuleController)
);
// Route to get all sessions by users
sessionRouter.get(
  '/userByModule',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  celebrate({ [Segments.PARAMS]: focusRecordIdSchema }),
  tracedAsyncHandler(getSessionsOfUserByModuleController)
);

sessionRouter.get(
  '/sessionData',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  celebrate({ [Segments.PARAMS]: focusRecordIdSchema }),
  tracedAsyncHandler(getSessionDataController)
);

// Route to get user average focus time (without moduleId)
sessionRouter.get(
  '/average-focus-time-by-user',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  celebrate({ [Segments.PARAMS]: focusRecordIdSchema }),
  tracedAsyncHandler(getAverageFocusTimeByUserController)
);

// Route to get user total session duration by userId (sum of all session durations)
sessionRouter.get(
  '/total-session-duration-by-user',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  celebrate({ [Segments.PARAMS]: focusRecordIdSchema }),
  tracedAsyncHandler(getTotalSessionDurationByUserController)
);

export default sessionRouter;
