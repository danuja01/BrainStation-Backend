import mongoose from 'mongoose';
import Session from '@/models/session';

export const createSession = async (data) => {
  const newRecord = new Session(data);
  return await newRecord.save();
};

export const getSessionById = async (id) => {
  return await Session.findById(id);
};

export const getAllSessionsByUserId = async (userId, { sort = { createdAt: -1 }, page = 1, limit = 20 }) => {
  const objectId = new mongoose.Types.ObjectId(userId);

  const aggregate = Session.aggregate([{ $match: { userId: objectId } }, { $sort: sort }]);

  const result = await Session.aggregatePaginate(aggregate, { page, limit });
  return result;
};
