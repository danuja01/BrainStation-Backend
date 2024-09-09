import createError from 'http-errors';
import { createSession, getAllSessionsByUserId, getSessionById } from '@/repository/session';

export const addSession = async (data) => {
  try {
    return await createSession(data);
  } catch (error) {
    throw new createError(500, 'Error when saving session');
  }
};

export const findSessionById = async (id) => {
  try {
    return await getSessionById(id);
  } catch (error) {
    throw new createError(500, 'Error when retrieving session');
  }
};

export const findAllSessionsByUserId = async (userId, query) => {
  try {
    return await getAllSessionsByUserId(userId, query);
  } catch (error) {
    throw new createError(500, `Error when retrieving sessions - ${error}`);
  }
};
