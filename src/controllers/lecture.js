import axios from 'axios';
import FormData from 'form-data';
import {
  deleteLectureService,
  getLectureByIdService,
  getLecturesByOrgService,
  insertLectureService,
  updateLectureService
} from '@/services/lecture';
import { appendLectureToModule } from '@/services/module';
import { makeResponse } from '@/utils/response';

export const createLecture = async (req, res) => {
  try {
    const { title, organization, moduleId } = req.body;
    const fileBuffer = req.file.buffer;

    const filename = req.file.originalname;
    const mimetype = req.file.mimetype;

    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: filename,
      contentType: mimetype
    });

    const response = await axios.post('http://34.30.64.175:9000/upload/', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    const slides = response.data.slides;

    const lecture = { title, organization, slides };
    const data = await insertLectureService(lecture);
    await appendLectureToModule(moduleId, data._id);

    return makeResponse({ res, status: 201, data, message: 'Lecture added successfully' });
  } catch (error) {
    return makeResponse({ res, status: 500, message: `Error when processing lecture - ${error}` });
  }
};

export const getLectureById = async (req, res) => {
  const lecture = await getLectureByIdService(req.params.id);
  return makeResponse({ res, data: lecture, message: 'Lecture retrieved successfully' });
};

export const getLecturesByOrg = async (req, res) => {
  try {
    const lectures = await getLecturesByOrgService(req.query);
    return makeResponse({ res, data: lectures, message: 'lectures retrieved successfully' });
  } catch (error) {
    return makeResponse({ res, status: 500, message: `Error when retrieving lectures - ${error}` });
  }
};

export const deleteLecture = async (req, res) => {
  await deleteLectureService(req.params.id);
  return makeResponse({ res, message: 'Lecture deleted successfully' });
};

export const updateLecture = async (req, res) => {
  await updateLectureService(req.params.id, req.body);
  return makeResponse({ res, message: 'Lecture updated successfully' });
};
