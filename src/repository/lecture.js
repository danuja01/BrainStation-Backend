import { Lecture } from '@/models/lecture';

export const insertLecture = async (data) => {
  const newLecture = new Lecture(data);
  const lecture = await newLecture.save();
  return lecture;
};

export const getLectureById = async (id) => {
  const lecture = await Lecture.findById(id).lean();
  return lecture;
};

export const getOneLecture = async (filters, options = {}) => {
  const lecture = await Lecture.findOne(filters, options).lean();
  return lecture;
};

export const getLecturesByOrg = async ({ filter = {}, sort = { createdAt: -1 }, page = 1, limit = 20 }) => {
  const aggregate = Lecture.aggregate([{ $match: filter }, { $sort: sort }]);
  const result = await Lecture.aggregatePaginate(aggregate, { page, limit });
  return result;
};

export const deleteLecture = (id) => {
  return Lecture.findByIdAndDelete(id);
};

export const updateLecture = async (id, data) => {
  const query = { _id: id };
  const lecture = await Lecture.findOneAndUpdate(query, data, { new: true });
  return lecture;
};
