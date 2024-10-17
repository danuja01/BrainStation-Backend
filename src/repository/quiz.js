import mongoose from 'mongoose';
import { buildQuizAggregation } from '@/helpers/buildQuizAggregation';
import { convertToObjectId } from '@/helpers/convertToObjectId';
import Quiz from '@/models/quiz';

export const saveQuiz = async (quizData) => {
  const { questionId, userId } = quizData;

  if (questionId) {
    const existingQuiz = await getQuizByQuestionIdAndUserId(userId, questionId);
    if (existingQuiz) {
      return await updateQuiz(existingQuiz._id, quizData);
    }
  }

  const newQuiz = new Quiz(quizData);
  return await newQuiz.save();
};

export const getQuizzes = async ({ filter = {}, sort = { createdAt: -1 }, page = 1, limit = 20 }) => {
  filter = convertToObjectId(filter);
  const aggregate = buildQuizAggregation(filter, sort);
  return await Quiz.aggregatePaginate(aggregate, { page, limit });
};

export const updateQuiz = async (quizId, updateData) => {
  return await Quiz.findByIdAndUpdate(quizId, updateData, { new: true });
};

export const getQuizByQuestionIdAndUserId = async (userId, questionId) => {
  return await Quiz.findOne({ questionId, userId });
};

export const getUserLectureQuizzes = async (userId, lectureId) => {
  const quizzes = await Quiz.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), lectureId: new mongoose.Types.ObjectId(lectureId) } },
    {
      $group: {
        _id: null,
        totalQuizzes: { $sum: 1 },
        correctAnswers: { $sum: { $cond: [{ $gt: ['$current_step', 0] }, 1, 0] } }
      }
    }
  ]);

  const quizData = quizzes[0] || { totalQuizzes: 20, correctAnswers: 0 }; // Default values
  // const total = Math.max(quizData.totalQuizzes, 20);
  const total = quizData.totalQuizzes;
  const averageScore = quizData.correctAnswers / total;

  return { totalQuizzes: total, correctAnswers: quizData.correctAnswers, averageScore };
};

export const getQuizPerformanceData = async (userId) => {
  const quizzes = await Quiz.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalQuizzes: { $sum: 1 },
        successRate: { $avg: { $cond: [{ $eq: ['$status', 'review'] }, 1, 0] } },
        newQuizzes: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
        lapsedQuizzes: { $sum: { $cond: [{ $eq: ['$status', 'lapsed'] }, 1, 0] } },
        reviewQuizzes: { $sum: { $cond: [{ $eq: ['$status', 'review'] }, 1, 0] } }
      }
    }
  ]);

  return (
    quizzes[0] || {
      totalQuizzes: 0,
      averageScore: 0,
      successRate: 0,
      newQuizzes: 0,
      lapsedQuizzes: 0,
      reviewQuizzes: 0
    }
  );
};

export const getUserQuizzesDueByToday = async ({
  userId,
  filter = {},
  sort = { createdAt: -1 },
  page = 1,
  limit = 20
}) => {
  const now = new Date();

  // Use +1 to account for today and past dates
  const endOfTodayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 23, 59, 59, 999)
  );

  filter = convertToObjectId(filter);
  filter.userId = new mongoose.Types.ObjectId(userId);
  filter.next_review_date = { $lte: endOfTodayUTC };

  const aggregate = buildQuizAggregation(filter, sort);
  return await Quiz.aggregatePaginate(aggregate, { page, limit });
};
