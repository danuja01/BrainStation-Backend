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
  if (filter.userId) {
    filter.userId = new mongoose.Types.ObjectId(filter.userId);
  }

  const aggregate = Quiz.aggregate([
    { $match: filter },
    { $lookup: { from: 'questions', localField: 'questionId', foreignField: '_id', as: 'questionDetails' } },
    { $unwind: '$questionDetails' },
    {
      $project: {
        'questionDetails.question': 1,
        'questionDetails.answer': 1,
        'questionDetails.distractors': 1,
        // Include any other fields from the Quiz model that you need
        'userId': 1,
        'lectureId': 1,
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
