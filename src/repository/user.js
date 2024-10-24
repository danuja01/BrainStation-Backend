import { moduleLogger } from '@sliit-foss/module-logger';
import { User } from '@/models';

const logger = moduleLogger('User-Repository');

export const createUser = async (user) => {
  const newUser = (await new User(user).save()).toObject();
  delete newUser.password;
  return newUser;
};

export const getAllUsers = async ({ sort = {}, filter = {}, page = 1, limit = 10 }) => {
  const options = {
    page,
    limit
  };

  if (Object.keys(sort).length > 0) options.sort = sort;

  const aggregateQuery = () =>
    User.aggregate([
      {
        $match: filter
      },
      {
        $project: {
          password: 0
        }
      }
    ]);

  try {
    return await (page ? User.aggregatePaginate(aggregateQuery(), options) : aggregateQuery());
  } catch (err) {
    logger.error(`An error occurred when retrieving users - err: ${err.message}`);
    throw err;
  }
};

export const getOneUser = async (filters, returnPassword = false) => {
  const user = await User.findOne(filters).lean();
  if (!user) return null;

  if (!returnPassword) delete user.password;
  return user;
};

export const findOneAndUpdateUser = async (filters, data) => {
  const user = await User.findOneAndUpdate(filters, data, { new: true }).lean();
  if (!user) return null;

  delete user.password;
  return user;
};

export const findOneAndRemoveUser = (filters) => {
  return User.findOneAndRemove(filters);
};

export const updateUserFcmToken = (userId, fcmToken) => {
  return User.findByIdAndUpdate(userId, { fcmToken }, { new: true });
};

export const enrollModule = async (userId, moduleId) => {
  try {
    const user = await User.findById(userId);
    if (!user.enrolledModules.includes(moduleId)) {
      user.enrolledModules.push(moduleId);
      await user.save();
      return user;
    }
    throw new Error('Module already enrolled.');
  } catch (error) {
    throw new Error(`Error enrolling module: ${error.message}`);
  }
};

export const unenrollModule = async (userId, moduleId) => {
  try {
    const user = await User.findById(userId);
    user.enrolledModules = user.enrolledModules.filter((id) => id.toString() !== moduleId.toString());
    await user.save();
    return user;
  } catch (error) {
    throw new Error(`Error unenrolling module: ${error.message}`);
  }
};

export const getUserModules = async (userId) => {
  try {
    const user = await User.findById(userId).populate('enrolledModules');
    return user.enrolledModules;
  } catch (error) {
    throw new Error(`Error retrieving user modules: ${error.message}`);
  }
};

export const isUserEnrolledInModule = async (userId, moduleId) => {
  try {
    const user = await User.findById(userId).populate('enrolledModules');
    return user.enrolledModules.some((module) => module._id.toString() === moduleId.toString());
  } catch (error) {
    throw new Error(`Error checking module enrollment: ${error.message}`);
  }
};
