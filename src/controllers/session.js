import { addSession, findAllSessionsByUserId, findSessionById } from '@/services/session';
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
  const userId = req.params.userId; // Assuming you pass userId in the route params

  const data = await findAllSessionsByUserId(userId, req.query);

  return makeResponse({ res, data, message: 'Sessions retrieved successfully' });
};
