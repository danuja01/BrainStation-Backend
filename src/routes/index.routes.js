import express from 'express';
import algorithmRouter from './algorithm.routes';
import analyticsRouter from './analytics.routes';
import assrsResultRouter from './assrsResult.routes';
import authRouter from './auth.routes';
import forcastRouter from './forcast.routes';
import lectureRouter from './lecture.routes';
import moduleRouter from './module.routes';
import ontologyRouter from './ontology.routes';
import progressRouter from './progress.routes';
import questionRouter from './question.routes';
import quizRouter from './quiz.routes';
import sessionRouter from './record.routes';
import taskRouter from './task.routes';
import userRouter from './user.routes';
import { protect } from '@/middleware';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', protect, userRouter);
router.use('/questions', protect, questionRouter);
router.use('/quizzes', protect, quizRouter);
router.use('/analytics', protect, analyticsRouter);
router.use('/forecast', protect, forcastRouter);
router.use('/ontology', protect, ontologyRouter);
router.use('/lectures', protect, lectureRouter);
router.use('/modules', moduleRouter);
router.use('/assrs', protect, assrsResultRouter);
router.use('/sessions', sessionRouter);
router.use('/progress', protect, progressRouter);
router.use('/algorithm', algorithmRouter);
router.use('/task', protect, taskRouter);

export default router;
