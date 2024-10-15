import Module from '@/models/module';

export const createModule = async (moduleData) => {
  const module = new Module(moduleData);
  return await module.save();
};

export const getModules = async ({ filter = {}, sort = { createdAt: -1 }, page = 1, limit = 20 }) => {
  const aggregate = Module.aggregate([{ $match: filter }, { $sort: sort }]);
  return await Module.aggregatePaginate(aggregate, { page, limit });
};

export const getModuleById = async (moduleId) => {
  return await Module.findById(moduleId).populate('lectures');
};

export const updateModule = async (moduleId, updateData) => {
  return await Module.findByIdAndUpdate(moduleId, updateData, { new: true });
};

export const addLectureToModule = async (moduleId, lectureId) => {
  return await Module.findByIdAndUpdate(moduleId, { $addToSet: { lectures: lectureId } }, { new: true });
};
