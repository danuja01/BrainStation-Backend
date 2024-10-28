import mongoose from 'mongoose';
import {
  buildLectureQuizSummaryAggregation,
  buildQuizAggregation,
  buildUserQuizzesDueDetailsAggregation
} from '@/helpers/buildAggregations';
import { convertToObjectId } from '@/helpers/convertToObjectId';
import Module from '@/models/module';
import Question from '@/models/question';
import Quiz from '@/models/quiz';
import { QuizFeedback } from '@/models/quiz-feedback';

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

export const getQuizzesScore = async ({ userId, filter = {}, sort = { createdAt: -1 }, page = 1, limit = 20 }) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  filter = convertToObjectId(filter);

  if (filter.moduleId) {
    const quizzes = await Quiz.find({ moduleId: filter.moduleId }, { lectureId: 1 });
    const lectureIds = quizzes.map((quiz) => quiz.lectureId);
    filter.lectureId = { $in: lectureIds };
  }

  filter.userId = userObjectId;

  const aggregate = [
    { $match: filter },
    {
      $lookup: {
        from: 'questions',
        localField: 'questionId',
        foreignField: '_id',
        as: 'questionDetails'
      }
    },
    { $unwind: '$questionDetails' }, // Unwind to simplify access to question details
    {
      $group: {
        _id: '$lectureId',
        totalQuizzes: { $sum: 1 },
        correctAnswers: { $sum: { $cond: [{ $gt: ['$current_step', 0] }, 1, 0] } },
        quizDetails: {
          $push: {
            context: '$questionDetails.context',
            question: '$questionDetails.question',
            answer: '$questionDetails.answer',
            status: '$status'
          }
        }
      }
    },
    {
      $addFields: {
        averageScore: {
          $cond: [{ $gt: ['$totalQuizzes', 0] }, { $divide: ['$correctAnswers', '$totalQuizzes'] }, 0]
        }
      }
    },
    {
      $lookup: {
        from: 'lectures',
        localField: '_id',
        foreignField: '_id',
        as: 'lectureDetails'
      }
    },
    {
      $project: {
        _id: 1,
        totalQuizzes: 1,
        correctAnswers: 1,
        averageScore: { $round: ['$averageScore', 2] },
        lectureTitle: { $arrayElemAt: ['$lectureDetails.title', 0] },
        quizDetails: 1
      }
    },
    { $sort: sort }
  ];

  const options = { page, limit };
  return await Quiz.aggregatePaginate(aggregate, options);
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

  // Calculate the end of today in UTC (including +1 to account for today and past dates)
  const endOfTodayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 23, 59, 59, 999)
  );

  filter = convertToObjectId(filter);
  filter.userId = new mongoose.Types.ObjectId(userId);

  // Apply date filtering only for quizzes that are not "lapsed"
  filter.$or = [
    { next_review_date: { $lte: endOfTodayUTC }, status: { $ne: 'lapsed' } },
    { status: 'lapsed' } // Always include "lapsed" quizzes regardless of the date
  ];

  const aggregate = buildQuizAggregation(filter, sort);
  return await Quiz.aggregatePaginate(aggregate, { page, limit });
};

export const getUserQuizzesDueDetails = async (userId) => {
  const aggregationPipeline = buildUserQuizzesDueDetailsAggregation(userId);
  const result = await Quiz.aggregate(aggregationPipeline);

  return {
    dueTodayCount: result[0]?.dueTodayCount || 0,
    learningPhaseCount: result[0]?.learningPhaseCount || 0
  };
};

export const getAttemptQuizIndex = async (userId, lectureId) => {
  const quizzes = await Quiz.find({ userId, lectureId }).sort({ attempt_question: -1 });

  // Map the result to the desired format
  const quizArray = quizzes.map((quiz) => ({
    questionId: quiz.questionId,
    attempt_question: quiz.attempt_question
  }));

  return quizArray;
};

export const saveQuizFeedback = async (userId, lectureId, feedbackData) => {
  const existingFeedback = await QuizFeedback.findOne({ userId, lectureId });

  if (existingFeedback) {
    return await QuizFeedback.findByIdAndUpdate(existingFeedback._id, feedbackData, { new: true });
  }

  const newFeedback = new QuizFeedback({ ...feedbackData, userId, lectureId });
  return await newFeedback.save();
};

export const getLectureQuizSummary = async (userId, moduleId) => {
  const convertedModuleId = new mongoose.Types.ObjectId(moduleId);
  const module = await Module.findById(convertedModuleId).populate('lectures', '_id title');
  if (!module) {
    return [];
  }

  const lectureIds = module.lectures.map((lecture) => lecture._id);
  const aggregationPipeline = buildLectureQuizSummaryAggregation(userId, lectureIds);
  const summaryData = await Question.aggregate(aggregationPipeline);

  return summaryData;
};
