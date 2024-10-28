import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mongoose from 'mongoose';
import { OntologyFile } from '@/models/ontologyFile';
import * as OntologyFileRepository from '@/repository/ontology';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('OntologyFile Repository', function () {
  beforeEach(async function () {
    await OntologyFile.deleteMany({});
  });

  describe('saveOntologyFilePath', function () {
    it('should save a new ontology file path', async function () {
      const fileData = {
        userId: new mongoose.Types.ObjectId(),
        lectureId: new mongoose.Types.ObjectId(),
        filename: 'sample_ontology.owl',
        fileUrl: 'https://example.com/sample_ontology.owl'
      };

      await OntologyFileRepository.saveOntologyFilePath(fileData);
      const savedFile = await OntologyFile.findOne({ filename: fileData.filename });

      expect(savedFile).to.have.property('_id');
      expect(savedFile.filename).to.equal(fileData.filename);
      expect(savedFile.fileUrl).to.equal(fileData.fileUrl);
    });
  });

  describe('getOntologyFile', function () {
    it('should retrieve an ontology file by filename', async function () {
      const fileData = {
        userId: new mongoose.Types.ObjectId(),
        lectureId: new mongoose.Types.ObjectId(),
        filename: 'ontology_file.owl',
        fileUrl: 'https://example.com/ontology_file.owl'
      };

      await OntologyFile.create(fileData);
      const retrievedFile = await OntologyFileRepository.getOntologyFile(fileData.filename);

      expect(retrievedFile).to.have.property('_id');
      expect(retrievedFile.filename).to.equal(fileData.filename);
      expect(retrievedFile.fileUrl).to.equal(fileData.fileUrl);
    });

    it('should return null if no file is found with the given filename', async function () {
      const retrievedFile = await OntologyFileRepository.getOntologyFile('nonexistent_file.owl');
      expect(retrievedFile).to.be.null;
    });
  });

  describe('findOntology', function () {
    it('should retrieve ontology files by userId and lectureId', async function () {
      const userId = new mongoose.Types.ObjectId();
      const lectureId = new mongoose.Types.ObjectId();
      const filesData = [
        { userId, lectureId, filename: 'ontology1.owl', fileUrl: 'https://example.com/ontology1.owl' },
        { userId, lectureId, filename: 'ontology2.owl', fileUrl: 'https://example.com/ontology2.owl' }
      ];

      await OntologyFile.insertMany(filesData);
      const result = await OntologyFileRepository.findOntology(userId.toString(), lectureId.toString());

      expect(result.docs).to.have.lengthOf(2);
      expect(result.docs[0].userId.toString()).to.equal(userId.toString());
      expect(result.docs[0].lectureId.toString()).to.equal(lectureId.toString());
    });

    it('should return an empty array if no ontology files match the criteria', async function () {
      const result = await OntologyFileRepository.findOntology(
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString()
      );
      expect(result.docs).to.be.empty;
    });
  });
});
