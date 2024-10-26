import mongoose from 'mongoose';
import { buildQuestionCountByLectureAggregation } from '@/helpers/buildAggregations';
import Module from '@/models/module';
import { Question } from '@/models/question';

export const insertQuestion = async (data) => {
  const newQuestion = new Question(data);
  await newQuestion.save();
};

export const insertBulkQuestions = async (dataArray) => {
  const questions = dataArray.map((data) => new Question(data));
  await Question.insertMany(questions);
};

export const getQuestions = async ({ filter = {}, sort = { createdAt: -1 }, page = 1, limit = 100 }) => {
  if (filter.lectureId) {
    filter.lectureId = new mongoose.Types.ObjectId(filter.lectureId);
  }
  const aggregate = Question.aggregate([{ $match: filter }, { $sort: sort }]);
  const result = await Question.aggregatePaginate(aggregate, { page, limit });
  return result;
};

export const updateQuestion = async (id, data) => {
  const query = { _id: id };
  const question = await Question.findOneAndUpdate(query, data, { new: true });
  return question;
};

export const getQuestionById = async (id) => {
  const question = await Question.findById(id).lean();
  return question;
};

export const getOneQuestion = async (filters, options = {}) => {
  const question = await Question.findOne(filters, options).lean();
  return question;
};

export const deleteQuestion = (id) => {
  return Question.findByIdAndDelete(id);
};

export const getQuestionCountByModule = async (moduleId) => {
  const convertedModuleId = new mongoose.Types.ObjectId(moduleId);

  const module = await Module.findById(convertedModuleId).populate('lectures', '_id title');
  if (!module) {
    return [];
  }

  const lectureIds = module.lectures.map((lecture) => lecture._id);

  const questionCounts = await Question.aggregate(buildQuestionCountByLectureAggregation(lectureIds));

  return module.lectures.map((lecture) => {
    const questionData = questionCounts.find((q) => q._id.equals(lecture._id));
    return {
      lectureId: lecture._id,
      lectureTitle: lecture.title,
      questionCount: questionData ? questionData.questionCount : 0
    };
  });
};

// flagged questions
export const fetchFlaggedQuestions = async ({ page, limit = 20 }) => {
  const options = {
    page,
    limit
  };
  const filter = { isFlagged: true };
  const aggregate = await Question.aggregate([{ $match: filter }]);
  return Question.aggregatePaginate(aggregate, options);
};

export const flagQuestion = async (id) => {
  const query = { _id: id };
  const data = { isFlagged: true };
  const question = await Question.findOneAndUpdate(query, data, {
    new: true
  });
  return question;
};
