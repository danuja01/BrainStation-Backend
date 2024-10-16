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

export const getStartAndEndTimes = async (
  userId,
  moduleId,
  { sort = { createdAt: -1 }, page = 1, limit = 20 } = {}
) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const moduleObjectId = new mongoose.Types.ObjectId(moduleId);

    // Fetch the startTime and stopTime for each session of the given user and module
    const records = await FocusRecord.find({ userId: userObjectId, moduleId: moduleObjectId })
      .select('startTime stopTime')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    // Calculate the total time worked by subtracting stopTime from startTime and adding them together
    const totalTimeInMilliseconds = records.reduce((total, record) => {
      const sessionTime = new Date(record.stopTime) - new Date(record.startTime);
      return total + sessionTime;
    }, 0);

    // Convert total time from milliseconds to hours
    const totalTimeInHours = totalTimeInMilliseconds / (1000 * 60 * 60);

    return totalTimeInHours;
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
};

export const getTotalFocusTime = async (userId, moduleId) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const moduleObjectId = new mongoose.Types.ObjectId(moduleId);

    const result = await FocusRecord.aggregate([
      { $match: { userId: userObjectId, moduleId: moduleObjectId } },
      {
        $group: {
          _id: null,
          totalFocusTime: { $sum: '$focus_time' }
        }
      }
    ]);

    return result.length > 0 ? result[0].totalFocusTime : 0;
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
};

export const getAverageFocusTime = async (userId, moduleId) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const moduleObjectId = new mongoose.Types.ObjectId(moduleId);

    const result = await FocusRecord.aggregate([
      { $match: { userId: userObjectId, moduleId: moduleObjectId } },
      {
        $group: {
          _id: null,
          averageFocusTime: { $avg: '$focus_time' }
        }
      }
    ]);

    return result.length > 0 ? result[0].averageFocusTime : 0;
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
};
