/**
 * @author Danuja Jayasuriya
 * @description This module provides functions to interact with users in a database.
 * @methods createUser, getAllUsers, getOneUser, findOneAndUpdateUser, findOneAndRemoveUser
 */
import bcrypt from 'bcryptjs';
import createError from 'http-errors';
import {
  createUser,
  enrollModule,
  findOneAndRemoveUser,
  findOneAndUpdateUser,
  getAllUsers,
  getOneUser,
  getOtherUsers,
  getUserModules,
  getUsersByModule,
  isUserEnrolledInModule,
  unenrollModule,
  updateUserFcmToken
} from '@/repository/user';
// eslint-disable-next-line import/order
import { sendMail } from './email';

export const getUsers = (query) => {
  return getAllUsers(query);
};

export const getUserByID = async (id) => {
  const user = await getOneUser({ _id: id });
  if (!user) throw new createError(404, 'Invalid user ID');
  return user;
};

export const changeAdminPasswordService = async (user, oldPassword, newPassword) => {
  user = await getOneUser({ _id: user._id }, true); // because req.user doesn't have the password

  const isPasswordMatch = await new Promise((resolve, reject) => {
    bcrypt.compare(oldPassword, user.password, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });
  if (!isPasswordMatch) throw new createError(400, 'Invalid current password');

  const encryptedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS), (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });
  return findOneAndUpdateUser({ email: user.email }, { password: encryptedPassword });
};

export const updateUserdetails = async (userId, user, userDetails) => {
  if (user.role !== 'ADMIN' && userId.toString() !== user._id.toString()) {
    throw new createError(403, 'You are not authorized to update this user');
  }

  if (userDetails.username || userDetails.email) {
    const userData = await getOneUser(
      {
        $or: [{ username: userDetails.username }, { email: userDetails.email }]
      },
      false
    );

    if (userData) {
      if (userData._id.toString() !== userId.toString()) {
        if (userDetails.username && userData.username === userDetails.username) {
          throw new createError(422, 'Username is already taken');
        }

        if (userDetails.email && userData.email === userDetails.email) {
          throw new createError(422, 'Email is already taken');
        }
      }
    }
  }

  const updatedUser = await findOneAndUpdateUser({ _id: userId }, userDetails);
  if (!updatedUser) {
    throw new createError(422, 'Invalid user ID');
  }

  return updatedUser;
};

export const addNewAdminUser = async (userDetails) => {
  const genaratedPassword = Math.random().toString(36).slice(-8);

  const encryptedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(genaratedPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS), (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });

  const newUser = await createUser({
    ...userDetails,
    password: encryptedPassword,
    is_verified: true,
    role: 'ADMIN'
  });

  let sendEmail;

  if (newUser) sendEmail = await sendAdminPassword(userDetails.email, genaratedPassword);

  if (!sendEmail) {
    await findOneAndRemoveUser({ email: userDetails.email });
    return;
  }

  return newUser;
};

const sendAdminPassword = (email, password) => {
  const replacements = {
    genaratedPassword: password,
    adminFrontendDomain: process.env.ADMIN_FRONTEND_DOMAIN
  };
  const subject = 'Welcome to the Code Coach';
  return sendMail(email, 'sendAdminPassword', replacements, subject);
};

export const saveFcmTokenService = async (userId, fcmToken) => {
  if (!userId || !fcmToken) {
    throw new createError(400, 'User ID and FCM token are required');
  }

  const user = await updateUserFcmToken(userId, fcmToken);
  if (!user) {
    throw new createError(404, 'User not found');
  }

  return user;
};

export const enrollModuleService = async (userId, moduleId) => {
  return await enrollModule(userId, moduleId);
};

export const unenrollModuleService = async (userId, moduleId) => {
  return await unenrollModule(userId, moduleId);
};

export const getUserModulesService = async (userId) => {
  return await getUserModules(userId);
};

export const checkUserEnrolledService = async (userId, moduleId) => {
  return await isUserEnrolledInModule(userId, moduleId);
};

export const getOtherUsersService = async (moduleId) => {
  return await getOtherUsers(moduleId);
};

export const getUsersByModuleService = async (moduleId) => {
  return await getUsersByModule(moduleId);
};
