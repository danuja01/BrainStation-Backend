import express from 'express';
import authRouter from './auth.routes';
import userRouter from './user.routes';
import { protect } from '@/middleware';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', protect, userRouter);

export default router;
