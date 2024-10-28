import createError from 'http-errors';
import {
  addNewAdminUser,
  changeAdminPasswordService,
  enrollModuleService,
  getOtherUsersService,
  getUserByID,
  getUserModulesService,
  getUsers,
  getUsersByModuleService,
  saveFcmTokenService,
  unenrollModuleService,
  updateUserdetails
} from '@/services/user';
import { makeResponse } from '@/utils';

export const createAdmin = async (req, res) => {
  const user = await addNewAdminUser(req.body);
  return makeResponse({ res, data: user, message: 'User added successfully' });
};

export const getAll = async (req, res) => {
  const users = await getUsers(req.query);
  return makeResponse({ res, data: users, message: 'Users retrieved succesfully' });
};

export const getById = async (req, res) => {
  const user = await getUserByID(req.params.id);
  return makeResponse({ res, data: user, message: 'User retrieved succesfully' });
};

export const update = async (req, res) => {
  const user = await updateUserdetails(req.params.id, req.user, req.body);
  return makeResponse({ res, data: user, message: 'User updated successfully' });
};

export const changeAdminPassword = async (req, res) => {
  await changeAdminPasswordService(req.user, req.body.old_password, req.body.new_password);
  return makeResponse({ res, message: 'Password changed successfully' });
};

export const saveFcmToken = async (req, res) => {
  const { userId, fcmToken } = req.body;

  if (!userId || !fcmToken) {
    throw createError(400, 'User ID and FCM token are required');
  }

  try {
    await saveFcmTokenService(userId, fcmToken);
    return res.status(200).json({ message: 'FCM token updated successfully' });
  } catch (error) {
    throw createError(500, `Error saving FCM token: ${error.message}`);
  }
};

export const enrollModuleController = async (req, res) => {
  const { userId, moduleId } = req.body;

  const user = await enrollModuleService(userId, moduleId);
  return makeResponse({ res, data: user, message: 'User enrolled in module succesfully' });
};

export const unenrollModuleController = async (req, res) => {
  const { userId, moduleId } = req.body;
  const user = await unenrollModuleService(userId, moduleId);
  return makeResponse({ res, data: user, message: 'User unenrolled from module succesfully' });
};

export const getUserEnrollModulesController = async (req, res) => {
  const userId = req.user._id;

  const modules = await getUserModulesService(userId);
  return makeResponse({ res, data: modules, message: 'User enrolled modules retrieved succesfully' });
};

export const getOtherUsersController = async (req, res) => {
  const students = await getOtherUsersService(req.params.id);
  return makeResponse({ res, data: students, message: 'Users retrieved succesfully' });
};

export const getUsersByModuleController = async (req, res) => {
  const students = await getUsersByModuleService(req.params.id);
  return makeResponse({ res, data: students, message: 'Users retrieved succesfully' });
};
