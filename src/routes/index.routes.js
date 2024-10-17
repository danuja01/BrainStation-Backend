import express from 'express';
import analyticsRouter from './analytics.routes';
import assrsResultRouter from './assrsResult.routes';
import authRouter from './auth.routes';
import forcastRouter from './forcast.routes';
import lectureRouter from './lecture.routes';
import moduleRouter from './module.routes';
import ontologyRouter from './ontology.routes';
import questionRouter from './question.routes';
import quizRouter from './quiz.routes';
import sessionRouter from './record.routes';
import userRouter from './user.routes';
import { protect } from '@/middleware';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', protect, userRouter);
router.use('/questions', protect, questionRouter);
router.use('/quizzes', protect, quizRouter);
router.use('/analytics', protect, analyticsRouter);
router.use('/forecast', protect, forcastRouter);
router.use('/ontology', ontologyRouter);
router.use('/lectures', lectureRouter);
router.use('/modules', moduleRouter);
router.use('/assrs', assrsResultRouter);
router.use('/sessions', sessionRouter);

export default router;
