import {
  checkOntologyExists,
  createOntologyService,
  getOntologyFileService,
  updateOntologyFileService
} from '@/services/ontology';
import { makeResponse } from '@/utils/response';

export const generateOntologyController = async (req, res) => {
  const userId = req.user._id;
  const lectureId = req.body.lectureId;

  const result = await checkOntologyExists(userId, lectureId);
  if (result.totalDocs > 0) {
    return makeResponse({ res, status: 500, message: 'ontology already exists for this lecture' });
  }

  await createOntologyService(userId, lectureId);
  return makeResponse({ res, status: 201, message: 'Ontology generated succesfully' });
};

export const updateOntologyFileController = async (req, res) => {
  const userId = req.user._id;
  const lectureId = req.body.lectureId;

  // Call the service to update the file with new content
  const updatedFileUrl = await updateOntologyFileService(userId, lectureId);

  // Send success response
  res.status(200).json({
    message: 'Ontology file updated successfully',
    fileUrl: updatedFileUrl
  });
};

export const getOntologyFileController = async (req, res) => {
  const { fileContent, filename } = await getOntologyFileService(req.user._id, req.query.lectureId);

  // Ensure fileContent is plain text (not a buffer or object)
  const markdownContent = Buffer.isBuffer(fileContent) ? fileContent.toString('utf-8') : fileContent;

  res.setHeader('Content-Type', 'text/plain'); // Ensure it's plain text
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  return res.send(markdownContent);
};

export const checkOntologyExistsController = async (req, res) => {
  const result = await checkOntologyExists(req.user._id, req.query.lectureId);

  if (result.totalDocs > 0) {
    return makeResponse({ res, status: 200, data: true, message: 'ontology exists' });
  }
  return makeResponse({ res, status: 200, message: 'ontology does not exists' });
};
