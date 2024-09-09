import { appendLectureToModule, createNewModule, fetchModuleById, fetchModules, modifyModule } from '@/services/module';

export const createModuleController = async (req, res) => {
  const moduleData = req.body;
  const newModule = await createNewModule(moduleData);
  return res.status(201).json({ message: 'Module created successfully', data: newModule });
};

export const getModulesController = async (req, res) => {
  const modules = await fetchModules(req.query);
  return res.status(200).json({ message: 'Modules retrieved successfully', data: modules });
};

export const getModuleController = async (req, res) => {
  const moduleId = req.params.id;
  const module = await fetchModuleById(moduleId);
  return res.status(200).json({ message: 'Module retrieved successfully', data: module });
};

export const updateModuleController = async (req, res) => {
  const moduleId = req.params.id;
  const updatedModule = await modifyModule(moduleId, req.body);
  return res.status(200).json({ message: 'Module updated successfully', data: updatedModule });
};

export const addLectureController = async (req, res) => {
  const { moduleId, lectureId } = req.body;
  const updatedModule = await appendLectureToModule(moduleId, lectureId);
  return res.status(200).json({ message: 'Lecture added to module successfully', data: updatedModule });
};
