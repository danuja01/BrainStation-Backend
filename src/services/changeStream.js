import { moduleLogger } from '@sliit-foss/module-logger';
import mongoose from 'mongoose';
import Quiz from '@/models/quiz';
import User from '@/models/user';
import { sendNotification } from '@/notifications/firebase';

const logger = moduleLogger('Change-Stream-Service');

const watchQuizzes = () => {
  const quizCollection = mongoose.connection.collection('quizzes');
  const changeStream = quizCollection.watch();

  changeStream.on('change', async (change) => {
    if (change.operationType === 'update') {
      const updatedQuizId = change.documentKey._id;
      const quizData = await Quiz.findById(updatedQuizId).lean();

      const userId = quizData.userId;
      const user = await User.findById(userId);

      if (user && user.fcmToken) {
        const message = {
          title: 'Review Reminder',
          body: `It's time to review the quiz: ${quizData.question}`
        };

        if (user.fcmToken) {
          await sendNotification(user.fcmToken, message);
        } else {
          logger.warn(`User ${userId} does not have an FCM token`);
        }
      }
    }
  });

  logger.info('Quizzes change stream initialized');
};

export const initializeChangeStreams = () => {
  watchQuizzes();
};
