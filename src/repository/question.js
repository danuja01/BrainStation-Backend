import { Question } from '@/models/question';

export const insertQuestion = async (data) => {
  const newQuestion = new Question(data);
  await newQuestion.save();
};

export const insertBulkQuestions = async (dataArray) => {
  const questions = dataArray.map((data) => new Question(data));
  await Question.insertMany(questions);
};

export const getQuestions = async ({ filter = {}, sort = { createdAt: -1 }, page, limit = 20 }) => {
  const options = {
    sort,
    page,
    limit
  };
  const aggregate = await Question.aggregate([{ $match: filter }]);
  return Question.aggregatePaginate(aggregate, options);
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
