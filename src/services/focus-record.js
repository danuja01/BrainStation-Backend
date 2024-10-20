import createError from 'http-errors';
import {
  createSession,
  getAllSessionsByUserId,
  getAverageFocusTime,
  getAverageFocusTimeByUser,
  getTotalSessionDurationByUser,
  getErraticMovementsByUser,
  getMostFrequentFinalClassification,
  getSessionById,
  getSessionsOfUserByModule,
  getStartAndEndTimes,
  getStartAndEndTimesByUser,
  getTotalFocusTime
} from '@/repository/focus-record';

export const addSession = async (data) => {
  try {
    await createSession(data);
  } catch (error) {
    throw new createError(500, 'Error when saving session');
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
    totalStudyTime: studyTime,
    totalFocusTime: data[0].totalFocusTime,
    totalMovements: data[0].totalMovements,
    totalErraticMovements: data[0].totalErraticMovements,
    adhdClassification: classification.mostFrequentClassification
  };

  return sessionData;
};
