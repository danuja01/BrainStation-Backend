import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { Segments, celebrate } from 'celebrate';
import {
  changeAdminPassword,
  createAdmin,
  enrollModuleController,
  getAll,
  getById,
  getOtherUsersController,
  getUserEnrollModulesController,
  getUsersByModuleController,
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

userRouter.get('/user-modules', tracedAsyncHandler(getUserEnrollModulesController));

userRouter.get('/other-users/:id', tracedAsyncHandler(getOtherUsersController));

userRouter.get('/users-by-module/:id', tracedAsyncHandler(getUsersByModuleController));

userRouter.get('/', authorizer(['ADMIN']), tracedAsyncHandler(getAll));

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

userRouter.patch('/enroll', enrollModuleController);

userRouter.patch('/unenroll', unenrollModuleController);

userRouter.patch(
  '/:id',
  celebrate({ [Segments.PARAMS]: userIdSchema, [Segments.BODY]: updateSchema }),
  tracedAsyncHandler(update)
);

export default userRouter;
