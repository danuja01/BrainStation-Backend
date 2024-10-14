import mongoose from 'mongoose';
import FocusRecord from '@/models/focus-record';

export const createSession = async (data) => {
  const newRecord = new FocusRecord(data);
  return await newRecord.save();
};

export const getSessionById = async (id) => {
  const record = await FocusRecord.findById(id).lean();
  return record;
};

export const getAllSessionsByUserId = (userId, { sort = { createdAt: -1 }, page = 1, limit = 20 }) => {
  const objectId = new mongoose.Types.ObjectId(userId);

  const aggregate = FocusRecord.aggregate([{ $match: { userId: objectId } }, { $sort: sort }]);

  return FocusRecord.aggregatePaginate(aggregate, { page, limit });
};

export const getSessionsOfUserByModule = async (
  userId,
  moduleId,
  { sort = { createdAt: -1 }, page = 1, limit = 20 } = {}
) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const moduleObjectId = new mongoose.Types.ObjectId(moduleId);

    const aggregate = FocusRecord.aggregate([
      { $match: { userId: userObjectId, moduleId: moduleObjectId } },
      { $sort: sort }
    ]);
    const result = await FocusRecord.aggregatePaginate(aggregate, { page, limit });

    return result;
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
};
