import mongoose from 'mongoose';
import { OntologyFile } from '@/models/ontologyFile';

export const saveOntologyFilePath = async (data) => {
  const newOntologyFile = new OntologyFile(data);
  await newOntologyFile.save();
};

export const getOntologyFile = async (filename) => {
  const file = await OntologyFile.findOne({ filename });
  return file;
};

export const findOntology = async (userId, lectureId) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const lectureObjectId = new mongoose.Types.ObjectId(lectureId);

    const aggregate = OntologyFile.aggregate([{ $match: { userId: userObjectId, lectureId: lectureObjectId } }]);
    const result = await OntologyFile.aggregatePaginate(aggregate);

    return result;
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
};
