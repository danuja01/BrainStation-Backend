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

export const getStartAndEndTimesByUser = async (userId, { sort = { createdAt: -1 }, page = 1, limit = 20 } = {}) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Fetch the startTime and stopTime for each session of the given user and module
    const records = await FocusRecord.find({ userId: userObjectId })
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

    const totalTimeInSeconds = totalTimeInMilliseconds / 1000;

    return totalTimeInSeconds;
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

export const getErraticMovementsByUser = async (userId) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result = await FocusRecord.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          totalFocusTime: { $sum: '$focus_time' },
          totalMovements: { $sum: '$total_movements' },
          totalErraticMovements: { $sum: '$erratic_movements' }
        }
      }
    ]);

    return result;
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
};

export const getMostFrequentFinalClassification = async (userId) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result = await FocusRecord.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$final_classification',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 1
      }
    ]);

    if (result.length > 0) {
      return {
        mostFrequentClassification: result[0]._id
      };
    }
    return null;
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
};

export const getAverageFocusTimeByUser = async (userId) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result = await FocusRecord.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          averageFocusTime: { $avg: '$focus_time' }
        }
      }
    ]);

    if (result.length === 0) {
      return 0; // Return 0 if no records found
    }

    return result[0].averageFocusTime;
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
};

export const getTotalSessionDurationByUser = async (userId) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find all focus records for the user
    const records = await FocusRecord.find({ userId: userObjectId }).select('startTime stopTime').exec();

    // Calculate the total session duration by summing the difference between stopTime and startTime
    const totalDurationMilliseconds = records.reduce((total, record) => {
      const sessionDuration = new Date(record.stopTime) - new Date(record.startTime);
      return total + sessionDuration;
    }, 0);

    // Convert total duration to hours (or use another unit of time if needed)
    const totalDurationInHours = totalDurationMilliseconds / (1000 * 60 * 60);

    return totalDurationInHours;
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
};
