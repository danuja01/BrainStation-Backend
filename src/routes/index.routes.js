import express from 'express';
import authRouter from './auth.routes';
import questionRouter from './question.routes';
import quizRouter from './quiz.routes';
import userRouter from './user.routes';
import { protect } from '@/middleware';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', protect, userRouter);
router.use('/questions', protect, questionRouter);
router.use('/quizzes', protect, quizRouter);

export default router;
