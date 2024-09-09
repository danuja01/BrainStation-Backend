import { OntologyFile } from '@/models/ontologyFile';

export const saveOntologyFilePath = async (data) => {
  const newOntologyFile = new OntologyFile(data);
  await newOntologyFile.save();
};

export const getOntologyFile = async (filename) => {
  const file = await OntologyFile.findOne({ filename });
  return file;
};
