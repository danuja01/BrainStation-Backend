import { generateOntologyService, getOntologyFileService } from '@/services/ontology';
import { makeResponse } from '@/utils/response';

export const generateOntologyController = async (req, res) => {
  await generateOntologyService(req.body);
  return makeResponse({ res, status: 201, message: 'Ontology generated succesfully' });
};

export const getOntologyFileController = async (req, res) => {
  try {
    const { fileContent, filename } = await getOntologyFileService(req.params.filename);

    // Set the headers for downloading the file
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send the file content in the response
    return res.send(fileContent);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve the file', error: error.message });
  }
};
