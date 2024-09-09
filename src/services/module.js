import { addLectureToModule, createModule, getModuleById, getModules, updateModule } from '@/repository/module';

export const createNewModule = async (moduleData) => {
  return await createModule(moduleData);
};

export const fetchModules = async (query) => {
  return await getModules(query);
};

export const fetchModuleById = async (moduleId) => {
  return await getModuleById(moduleId);
};

export const modifyModule = async (moduleId, updateData) => {
  return await updateModule(moduleId, updateData);
};

export const appendLectureToModule = async (moduleId, lectureId) => {
  return await addLectureToModule(moduleId, lectureId);
};
