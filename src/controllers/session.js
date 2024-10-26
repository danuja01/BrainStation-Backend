import {
  addSession,
  findAllSessionsByUserId,
  findAverageFocusTimeByUser,
  findAverageFocusTimeofUsersModule,
  findSessionById,
  findSessionsOfUserByModule,
  findStartAndEndTimesOfUsersModule,
  findTotalFocusTimeOfUsersModule,
  findTotalSessionDurationByUser,
  getAdhdClassificationFeedbackService,
  getSessionData
} from '@/services/focus-record';
import { makeResponse } from '@/utils/response';

export const addSessionController = async (req, res) => {
  const session = {
    userId: req.user._id,
    moduleId: req.body.moduleId,
    startTime: req.body.startTime,
    stopTime: req.body.stopTime,
    date: req.body.date,
    final_classification: req.body.final_classification || null,
    focus_time: req.body.focus_time || null,
    total_movements: req.body.total_movements || null,
    erratic_movements: req.body.erratic_movements || null,
    erratic_percentage: req.body.erratic_percentage || null,
    emotion_distribution: req.body.emotion_distribution || null
  };

  const newSession = await addSession(session);
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
  const userId = req.user._id;

  const data = await findAllSessionsByUserId(userId, req.query);

  return makeResponse({ res, data, message: 'Sessions retrieved successfully' });
};

export const getSessionsOfUserByModuleController = async (req, res) => {
  try {
    const userId = req.user._id;
    const moduleId = req.query.filter.moduleId;

    const data = await findSessionsOfUserByModule(userId, moduleId, req.query);

    return makeResponse({ res, data, message: 'Sessions retrieved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getStartAndEndTimesOfUsersModuleController = async (req, res) => {
  try {
    const userId = req.user._id;
    const moduleId = req.query.filter.moduleId;

    const data = await findStartAndEndTimesOfUsersModule(userId, moduleId);

    return makeResponse({ res, data, message: 'Sessions retrieved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getTotalFocusTimeOfUsersModuleController = async (req, res) => {
  try {
    const userId = req.user._id;
    const moduleId = req.query.filter.moduleId;

    const data = await findTotalFocusTimeOfUsersModule(userId, moduleId);

    return makeResponse({ res, data, message: 'Sessions retrieved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getAverageFocusTimeofUsersModuleController = async (req, res) => {
  try {
    const userId = req.user._id;
    const moduleId = req.query.filter.moduleId;

    const data = await findAverageFocusTimeofUsersModule(userId, moduleId);

    return makeResponse({ res, data, message: 'Sessions retrieved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getAverageFocusTimeByUserController = async (req, res) => {
  try {
    const userId = req.user._id;

    const data = await findAverageFocusTimeByUser(userId);

    return makeResponse({ res, data, message: 'Average focus time retrieved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getTotalSessionDurationByUserController = async (req, res) => {
  const userId = req.user._id;

  // Call the service function to get the total session duration
  const totalDuration = await findTotalSessionDurationByUser(userId);

  return makeResponse({ res, data: { totalDuration }, message: 'Total session duration retrieved successfully' });
};

export const getSessionDataController = async (req, res) => {
  try {
    const userId = req.user._id;

    const data = await getSessionData(userId);

    return makeResponse({ res, data, message: 'Sessions retrieved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getAdhdClassificationFeedbackController = async (req, res) => {
  const userId = req.user._id;

  const data = await getAdhdClassificationFeedbackService(userId);

  return makeResponse({ res, data: data, message: 'feedback generated successfully' });
};
