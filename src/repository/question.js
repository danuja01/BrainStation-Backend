import { Question } from '@/models/question';

export const insertQuestion = async (data) => {
  const newQuestion = new Question(data);
  await newQuestion.save();
};

export const insertBulkQuestions = async (dataArray) => {
  const questions = dataArray.map((data) => new Question(data));
  await Question.insertMany(questions);
};

export const getQuestions = async ({ filter = {}, sort = {}, page, limit = 20 }) => {
  const options = {
    sort,
    page,
    limit
  };
  return (await page) ? Question.paginate(filter, options) : Question.find(filter).sort(sort).lean();
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
