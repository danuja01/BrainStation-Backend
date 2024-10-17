import {
  addSession,
  findAllSessionsByUserId,
  findAverageFocusTimeofUsersModule,
  findSessionById,
  findSessionsOfUserByModule,
  findStartAndEndTimesOfUsersModule,
  findTotalFocusTimeOfUsersModule
} from '@/services/focus-record';
import { makeResponse } from '@/utils/response';

export const addSessionController = async (req, res) => {
  const newSession = await addSession(req.body);
  return makeResponse({ res, status: 201, data: newSession, message: 'Session added successfully' });
};

export const getSessionByIdController = async (req, res) => {
  const record = await findSessionById(req.params.id);

  if (!record) {
    return makeResponse({ res, status: 404, message: 'Session not found' });
  }

  return makeResponse({ res, status: 200, data: record, message: 'Session retrieved successfully' });
};

export const getSessionByUserController = async (req, res) => {
  const userId = req.params.userId;

  const data = await findAllSessionsByUserId(userId, req.query);

  return makeResponse({ res, data, message: 'Sessions retrieved successfully' });
};

export const getSessionsOfUserByModuleController = async (req, res) => {
  try {
    const userId = req.params.userId;
    const moduleId = req.query.filter.moduleId;

    const data = await findSessionsOfUserByModule(userId, moduleId, req.query);

    return makeResponse({ res, data, message: 'Sessions retrieved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getStartAndEndTimesOfUsersModuleController = async (req, res) => {
  try {
    const userId = req.params.userId;
    const moduleId = req.query.filter.moduleId;

    const data = await findStartAndEndTimesOfUsersModule(userId, moduleId);

    return makeResponse({ res, data, message: 'Sessions retrieved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getTotalFocusTimeOfUsersModuleController = async (req, res) => {
  try {
    const userId = req.params.userId;
    const moduleId = req.query.filter.moduleId;

    const data = await findTotalFocusTimeOfUsersModule(userId, moduleId);

    return makeResponse({ res, data, message: 'Sessions retrieved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getAverageFocusTimeofUsersModuleController = async (req, res) => {
  try {
    const userId = req.params.userId;
    const moduleId = req.query.filter.moduleId;

    const data = await findAverageFocusTimeofUsersModule(userId, moduleId);

    return makeResponse({ res, data, message: 'Sessions retrieved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};