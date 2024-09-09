import AssrResult from '@/models/assrs';

export const createAssrResult = async (data) => {
  await AssrResult.create(data);
};

export const findAssrResultByUserId = async (userId) => {
  return await AssrResult.findOne({ userId });
};

export const updateAssrResult = async (userId, updatedData) => {
  return await AssrResult.findOneAndUpdate({ userId }, updatedData, { new: true });
};

export const getOneAssrs = async (filters, options = {}) => {
  const report = await AssrResult.findOne(filters, options).lean();
  return report;
};
