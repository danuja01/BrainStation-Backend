import mongoose from 'mongoose';

const objectIdFields = ['userId', 'lectureId', 'moduleId'];

export const convertToObjectId = (filter) => {
  return Object.keys(filter).reduce((acc, key) => {
    if (objectIdFields.includes(key) && mongoose.Types.ObjectId.isValid(filter[key])) {
      acc[key] = new mongoose.Types.ObjectId(filter[key]);
    } else {
      acc[key] = filter[key];
    }
    return acc;
  }, {});
};
