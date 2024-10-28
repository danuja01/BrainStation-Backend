import axios from 'axios';
import createError from 'http-errors';
import mongoose from 'mongoose';
import FocusRecord from '@/models/focus-record';
import {
  createSession,
  getAllSessionsByUserId,
  getAverageFocusTime,
  getAverageFocusTimeByUser,
  getErraticMovementsByUser,
  getMostFrequentFinalClassification,
  getSessionById,
  getSessionsOfUserByModule,
  getStartAndEndTimes,
  getStartAndEndTimesByUser,
  getTotalFocusTime,
  getTotalSessionDurationByUser
} from '@/repository/focus-record';
import { getAllStudentIds } from '@/repository/user';

export const addSession = async (data) => {
  try {
    await createSession(data);
  } catch (error) {
    throw new createError(500, `Error when saving session- ${error}`);
  }
};

export const findSessionById = async (id) => {
  const record = await getSessionById(id);
  if (!record) {
    throw new createError(404, 'Session not found');
  }
  return record;
};

export const findAllSessionsByUserId = async (userId, query) => {
  return await getAllSessionsByUserId(userId, query);
};

export const findSessionsOfUserByModule = async (userId, moduleId, query) => {
  return await getSessionsOfUserByModule(userId, moduleId, query);
};

export const findStartAndEndTimesOfUsersModule = async (userId, moduleId) => {
  return await getStartAndEndTimes(userId, moduleId);
};

export const findTotalFocusTimeOfUsersModule = async (userId, moduleId) => {
  return await getTotalFocusTime(userId, moduleId);
};

export const findAverageFocusTimeofUsersModule = async (userId, moduleId) => {
  return await getAverageFocusTime(userId, moduleId);
};

// Service to get average focus time by userId (without moduleId)
export const findAverageFocusTimeByUser = async (userId) => {
  return await getAverageFocusTimeByUser(userId);
};

export const findTotalSessionDurationByUser = async (userId) => {
  return await getTotalSessionDurationByUser(userId);
};

export const getSessionData = async (userId) => {
  const data = await getErraticMovementsByUser(userId);
  const studyTime = await getStartAndEndTimesByUser(userId);
  const classification = await getMostFrequentFinalClassification(userId);

  const sessionData = {
    studentId: userId,
    totalStudyTime: studyTime,
    totalFocusTime: data[0]?.totalFocusTime || 0, // Default to 0 if data[0] is undefined
    totalMovements: data[0]?.totalMovements || 0, // Default to 0 if data[0] is undefined
    totalErraticMovements: data[0]?.totalErraticMovements || 0, // Default to 0 if data[0] is undefined
    adhdClassification: classification?.mostFrequentClassification || 'Unknown' // Default to "Unknown" if classification is null
  };

  return sessionData;
};

export const getAdhdClassificationFeedbackService = async (classification) => {
  const config = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };

  // Todo: replace the url with hosted model url
  const response = await axios.post(
    `${process.env.CLASSIFICATION_URL}api/v1/adhd-feedback`,
    { designation: classification },
    config
  );

  return response.data;
};

export const getStudentsDataService = async () => {
  const studentIds = await getAllStudentIds();
  const sessionDataPromises = studentIds.map(async (userId) => await getSessionData(userId));
  const sessionDataArray = await Promise.all(sessionDataPromises);
  return sessionDataArray;
};

// New service function to count sessions by userId
export const countSessionsByUserId = async (userId) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId); // Convert userId to ObjectId
    const sessionCount = await FocusRecord.countDocuments({ userId: userObjectId });

    return sessionCount;
  } catch (error) {
    throw new Error(`Error counting sessions: ${error.message}`);
  }
};

export const countDistinctSessionDaysByUserId = async (userId) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Use aggregation to group by day and count distinct days
    const distinctDays = await FocusRecord.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
        }
      },
      { $count: 'distinctDaysCount' }
    ]);

    const daysCount = distinctDays.length > 0 ? distinctDays[0].distinctDaysCount : 0;

    return daysCount;
  } catch (error) {
    throw new Error(`Error counting distinct session days: ${error.message}`);
  }
};
