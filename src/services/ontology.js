import createError from 'http-errors';
import { getOntologyFile, saveOntologyFilePath } from '@/repository/ontology';

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const firebaseAdmin = require('@/notifications/firebase');

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

    const response = await axios.post('http://localhost:8000/generate-mindmap', slides, config);

    const markdownContent = response.data.mindmap;

    const { filename, url } = await saveMarkdownToFirebaseService(markdownContent);

    const newFile = {
      filename: filename,
      fileUrl: url
    };

    await saveOntologyFilePath(newFile);
  } catch (err) {
    throw new createError(500, `Error when generating the ontology file - ${err}`);
  }
};

export const saveMarkdownToFirebaseService = async (markdownContent) => {
  try {
    const filename = `output_${Date.now()}.md`;
    const filepath = path.join(__dirname, filename);

    fs.writeFileSync(filepath, markdownContent);

    await firebaseAdmin.upload(filepath, {
      destination: `markdown-files/${filename}`
    });

    const file = firebaseAdmin.file(`markdown-files/${filename}`);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2500'
    });

    fs.unlinkSync(filepath);

    return { filename, url };
  } catch (err) {
    throw new createError(500, 'Error when saving ontology file to firebase');
  }
};

export const getOntologyFileService = async (filename) => {
  try {
    const file = await getOntologyFile({ filename });

    if (!file) {
      // eslint-disable-next-line no-undef
      return res.status(404).json({ message: 'File not found' });
    }
    // eslint-disable-next-line no-undef
    const remoteFile = bucket.file(filename);
    const fileContent = (await remoteFile.download())[0].toString('utf-8');

    return { fileContent, filename };
  } catch (error) {
    throw new Error(`Error fetching file: ${error.message}`);
  }
};
