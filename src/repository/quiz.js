import mongoose from 'mongoose';
import Quiz from '@/models/quiz';

export const saveQuiz = async (quizData) => {
  const questionId = quizData.questionId;
  const userId = quizData.userId;

  if (questionId) {
    const existingQuiz = await getQuizByQuestionIdAndUserId(userId, questionId);

    if (existingQuiz) {
      const updatedQuize = await updateQuiz(existingQuiz._id, quizData);
      return updatedQuize;
    }
  }

  const newQuiz = new Quiz(quizData);
  return await newQuiz.save();
};

export const getQuizzes = async ({ filter = {}, sort = { createdAt: -1 }, page = 1, limit = 20 }) => {
  const objectIdFields = ['userId', 'lectureId', 'moduleId'];

  filter = Object.keys(filter).reduce((acc, key) => {
    if (objectIdFields.includes(key) && mongoose.Types.ObjectId.isValid(filter[key])) {
      acc[key] = new mongoose.Types.ObjectId(filter[key]);
    } else {
      acc[key] = filter[key];
    }
    return acc;
  }, {});

  const aggregate = Quiz.aggregate([
    { $match: filter },
    { $lookup: { from: 'questions', localField: 'questionId', foreignField: '_id', as: 'questionDetails' } },
    { $lookup: { from: 'lectures', localField: 'lectureId', foreignField: '_id', as: 'lectureDetails' } },
    { $lookup: { from: 'modules', localField: 'moduleId', foreignField: '_id', as: 'moduleDetails' } },
    { $unwind: '$questionDetails' },
    { $unwind: { path: '$lectureDetails', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$moduleDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        'questionDetails.question': 1,
        'questionDetails.answer': 1,
        'questionDetails.distractors': 1,
        'lectureDetails.title': 1,
        'moduleDetails.name': 1,
        'userId': 1,
        'lectureId': 1,
        'moduleId': 1,
        'status': 1,
        'interval': 1,
        'ease_factor': 1,
        'next_review_date': 1,
        'attemptCount': 1
      }
    },
    { $sort: sort }
  ]);

  const result = await Quiz.aggregatePaginate(aggregate, { page, limit });
  return result;
};

export const updateQuiz = async (quizId, updateData) => {
  return await Quiz.findByIdAndUpdate(quizId, updateData, { new: true });
};

export const getQuizByQuestionIdAndUserId = async (userId, questionId) => {
  const quiz = await Quiz.findOne({
    questionId: questionId,
    userId: userId
  });

  return quiz;
};

export const getUserLectureQuizzes = async (userId, lectureId) => {
  const quizzes = await Quiz.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        lectureId: new mongoose.Types.ObjectId(lectureId)
      }
    },
    {
      $group: {
        _id: null,
        totalQuizzes: { $sum: 1 },
        correctAnswers: { $sum: { $cond: [{ $gt: ['$current_step', 0] }, 1, 0] } }
      }
    }
  ]);

  // If no quizzes found, return default values
  if (quizzes.length === 0) {
    return { totalQuizzes: 20, correctAnswers: 0, averageScore: 0 }; // Default to 20 total quizzes
  }

  const quizData = quizzes[0];
  const total = Math.max(quizData.totalQuizzes, 20); // If less than 20, use 20 as total
  const averageScore = quizData.correctAnswers / total; // Calculate average

  return {
    totalQuizzes: total, // Always return 20 if actual is less
    correctAnswers: quizData.correctAnswers,
    averageScore: averageScore
  };
};

// Analyzing Quiz Performance
export const getQuizPerformanceData = async (userId) => {
  const quizzes = await Quiz.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalQuizzes: { $sum: 1 },
        successRate: {
          $avg: {
            $cond: [{ $eq: ['$status', 'review'] }, 1, 0]
          }
        },
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
