import createError from 'http-errors';
import { getLectureByIdService } from './lecture';
import extractMarkdownContent from '@/helpers/extractMarkdown';
import { removeHTML } from '@/helpers/removeHTML';
import { findOntology, saveOntologyFilePath } from '@/repository/ontology';

const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { bucket } = require('@/database/firebase');

export const saveOntologyFilePathService = async (data) => {
  try {
    await saveOntologyFilePath(data);
  } catch (err) {
    throw new createError(500, 'Error when saving ontology file');
  }
};

export const generateOntologyService = async (slides) => {
  try {
    const config = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.post('http://34.30.64.175:9004/generate-mindmap/', slides, config);
    const markdown = extractMarkdownContent(response.data.mindmap);

    return markdown;
  } catch (err) {
    throw new createError(500, `Error when generating the ontology file - ${err.message}`);
  }
};

export const createOntologyService = async (userId, lectureId) => {
  try {
    const lecture = await getLectureByIdService(lectureId);
    const slides = lecture.slides;

    const sanitizedSlides = slides.map((slide) => ({
      id: slide.id,
      title: slide.title,
      content: removeHTML(slide.content)
    }));

    const markdownContent = await generateOntologyService(sanitizedSlides);

    const { filename, url } = await saveMarkdownToFirebaseService(userId, lectureId, markdownContent);

    const newFile = {
      userId,
      lectureId,
      filename,
      fileUrl: url
    };

    await saveOntologyFilePath(newFile); // Save the file details in MongoDB

    return { message: 'Ontology generated and saved successfully', url };
  } catch (err) {
    throw new createError(500, `Error when creating the ontology file - ${err.message}`);
  }
};

export const saveMarkdownToFirebaseService = async (userId, lectureId, markdownContent) => {
  try {
    const filename = `output_${lectureId}_${userId}_${Date.now()}.md`;

    // Convert markdown content into buffer
    const fileBuffer = Buffer.from(markdownContent, 'utf-8');

    const file = bucket.file(`markdown-files/${filename}`);
    const uuid = uuidv4(); // Generate a unique ID for use in signed URL

    const stream = file.createWriteStream({
      metadata: {
        contentType: 'text/markdown',
        metadata: {
          firebaseStorageDownloadTokens: uuid
        }
      }
    });

    stream.end(fileBuffer);

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // Generate a public download URL
    const url = `https://firebasestorage.googleapis.com/v0/b/${process.env.FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(file.name)}?alt=media&token=${uuid}`;

    return { filename, url };
  } catch (err) {
    throw new Error(`Error when saving ontology file to Firebase - ${err.message}`);
  }
};

export const getOntologyFileService = async (userId, lectureId) => {
  try {
    const result = await findOntology(userId, lectureId);
    const filename = result.docs[0].filename;

    const remoteFile = bucket.file(`markdown-files/${filename}`); // use only the file path, not the full URL
    const fileContent = (await remoteFile.download())[0].toString('utf-8');

    return { fileContent, filename };
  } catch (error) {
    throw new Error(`Error fetching file: ${error.message}`);
  }
};

export const checkOntologyExists = async (userId, lectureId) => {
  const result = await findOntology(userId, lectureId);
  return result;
};

export const updateOntologyFileService = async (userId, lectureId) => {
  try {
    const lecture = await getLectureByIdService(lectureId);
    const slides = lecture.slides;

    const sanitizedSlides = slides.map((slide) => ({
      id: slide.id,
      title: slide.title,
      content: removeHTML(slide.content)
    }));

    const markdownContent = await generateOntologyService(sanitizedSlides);

    const result = await findOntology(userId, lectureId);
    const filename = result.docs[0].filename;

    const file = bucket.file(`markdown-files/${filename}`);

    // Upload the updated content back to Firebase
    const fileBuffer = Buffer.from(markdownContent, 'utf-8');
    const stream = file.createWriteStream({
      metadata: {
        contentType: 'text/markdown'
      }
    });

    stream.end(fileBuffer);

    // Wait for the upload to finish
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // Get the updated file's URL
    const uuid = uuidv4();
    const updatedUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(file.name)}?alt=media&token=${uuid}`;

    return updatedUrl;
  } catch (error) {
    throw new Error(`Error updating ontology file: ${error.message}`);
  }
};
