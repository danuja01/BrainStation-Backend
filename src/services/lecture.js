import createError from 'http-errors';
import { deleteLecture, getLectureById, getLecturesByOrg, insertLecture, updateLecture } from '@/repository/lecture';

export const insertLectureService = async (data) => {
  try {
    const lecture = await insertLecture(data);
    return lecture;
  } catch (err) {
    throw new createError(500, 'Error when processing lecture');
  }
};

export const getLectureByIdService = async (id) => {
  const lecture = await getLectureById(id);
  if (!lecture) throw new createError(422, 'Invalid lecture Id');
  return lecture;
};

export const getLecturesByOrgService = (query) => {
  return getLecturesByOrg(query);
};

export const deleteLectureService = async (id) => {
  const lecture = await deleteLecture(id);
  if (!lecture) throw new createError(422, 'Invalid Lecture ID');
  return lecture;
};

export const updateLectureService = async (id, data) => {
  const lecture = await updateLecture(id, data);
  if (!lecture) throw new createError(422, 'Invalid Lecture ID');
  return lecture;
};
