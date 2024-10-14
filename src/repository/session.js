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

export const getSessionsOfUserByModule = async (
  userId,
  moduleId,
  { sort = { createdAt: -1 }, page = 1, limit = 20 } = {}
) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const moduleObjectId = new mongoose.Types.ObjectId(moduleId);

    const aggregate = Session.aggregate([
      { $match: { userId: userObjectId, moduleId: moduleObjectId } },
      { $sort: sort }
    ]);
    const result = await Session.aggregatePaginate(aggregate, { page, limit });

    return result;
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
};
