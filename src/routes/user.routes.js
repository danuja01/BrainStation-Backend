import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { Segments, celebrate } from 'celebrate';
import {
  changeAdminPassword,
  createAdmin,
  enrollModuleController,
  getAll,
  getById,
  getUserEnrollModulesController,
  saveFcmToken,
  unenrollModuleController,
  update
} from '@/controllers/user';
import { authorizer } from '@/middleware/auth';
import { addUserSchema, changePasswordSchema, updateSchema, userIdSchema } from '@/validations/user';

const userRouter = express.Router();

userRouter.post(
  '/',
  celebrate({ [Segments.BODY]: addUserSchema }),
  authorizer(['ADMIN']),
  tracedAsyncHandler(createAdmin)
);
userRouter.get('/', authorizer(['ADMIN']), tracedAsyncHandler(getAll));

userRouter.get(
  '/user-modules',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(getUserEnrollModulesController)
);

userRouter.get(
  '/:id',
  authorizer(['ADMIN']),
  celebrate({ [Segments.PARAMS]: userIdSchema }),
  tracedAsyncHandler(getById)
);

userRouter.post('/fcm-token', authorizer(['STUDENT', 'LECTURER', 'ADMIN']), saveFcmToken);

userRouter.patch(
  '/change_password',
  celebrate({ [Segments.BODY]: changePasswordSchema }),
  tracedAsyncHandler(changeAdminPassword)
);

userRouter.post('/enroll', authorizer(['STUDENT', 'LECTURER', 'ADMIN']), enrollModuleController);

userRouter.delete('/unenroll', authorizer(['STUDENT', 'LECTURER', 'ADMIN']), unenrollModuleController);

userRouter.patch(
  '/:id',
  celebrate({ [Segments.PARAMS]: userIdSchema, [Segments.BODY]: updateSchema }),
  tracedAsyncHandler(update)
);

export default userRouter;
