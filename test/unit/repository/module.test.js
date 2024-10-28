import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mongoose from 'mongoose';
import { Module } from '@/models/module';
import * as ModuleRepository from '@/repository/module';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Module Repository', function () {
  beforeEach(async function () {
    await Module.deleteMany({});
  });

  describe('createModule', function () {
    it('should create a new module', async function () {
      const moduleData = {
        name: 'Biology 101',
        moduleCode: 'BIO101',
        description: 'Introduction to Biology',
        lectures: []
      };

      const createdModule = await ModuleRepository.createModule(moduleData);
      expect(createdModule).to.have.property('_id');
      expect(createdModule.name).to.equal(moduleData.name);
      expect(createdModule.moduleCode).to.equal(moduleData.moduleCode);
    });
  });

  describe('getModules', function () {
    it('should return paginated modules with filtering and sorting', async function () {
      const modulesData = [
        { name: 'Chemistry 101', moduleCode: 'CHEM101', description: 'Intro to Chemistry' },
        { name: 'Physics 101', moduleCode: 'PHYS101', description: 'Intro to Physics' },
        { name: 'Mathematics 101', moduleCode: 'MATH101', description: 'Intro to Math' }
      ];

      await Module.insertMany(modulesData);

      const result = await ModuleRepository.getModules({ filter: {}, sort: { name: 1 }, page: 1, limit: 2 });
      expect(result.docs).to.have.lengthOf(2);
      expect(result.docs[0].name).to.equal('Chemistry 101');
    });
  });

  describe('getModuleById', function () {
    it('should retrieve a module by ID', async function () {
      const moduleData = {
        name: 'Physics 101',
        moduleCode: 'PHYS101',
        description: 'Introduction to Physics',
        lectures: []
      };

      const createdModule = await ModuleRepository.createModule(moduleData);
      const foundModule = await ModuleRepository.getModuleById(createdModule._id);

      expect(foundModule._id.toString()).to.equal(createdModule._id.toString());
      expect(foundModule.name).to.equal(moduleData.name);
    });

    it('should return null if module not found', async function () {
      const foundModule = await ModuleRepository.getModuleById(new mongoose.Types.ObjectId());
      expect(foundModule).to.be.null;
    });
  });

  describe('updateModule', function () {
    it('should update a module by ID', async function () {
      const moduleData = {
        name: 'Mathematics 101',
        moduleCode: 'MATH101',
        description: 'Introduction to Mathematics',
        lectures: []
      };

      const createdModule = await ModuleRepository.createModule(moduleData);
      const updateData = { description: 'Advanced Mathematics' };
      const updatedModule = await ModuleRepository.updateModule(createdModule._id, updateData);

      expect(updatedModule.description).to.equal(updateData.description);
    });

    it('should return null if module not found', async function () {
      const updatedModule = await ModuleRepository.updateModule(new mongoose.Types.ObjectId(), { description: 'Test' });
      expect(updatedModule).to.be.null;
    });
  });

  describe('addLectureToModule', function () {
    it('should add a lecture to a module', async function () {
      const moduleData = {
        name: 'Geology 101',
        moduleCode: 'GEOL101',
        description: 'Introduction to Geology',
        lectures: []
      };

      const createdModule = await ModuleRepository.createModule(moduleData);
      const lectureId = new mongoose.Types.ObjectId();

      const updatedModule = await ModuleRepository.addLectureToModule(createdModule._id, lectureId);
      expect(updatedModule.lectures).to.include(lectureId);
    });

    it('should not add duplicate lectures', async function () {
      const moduleData = {
        name: 'Anthropology 101',
        moduleCode: 'ANTH101',
        description: 'Introduction to Anthropology',
        lectures: []
      };

      const createdModule = await ModuleRepository.createModule(moduleData);
      const lectureId = new mongoose.Types.ObjectId();

      // Add the same lecture twice
      await ModuleRepository.addLectureToModule(createdModule._id, lectureId);
      const updatedModule = await ModuleRepository.addLectureToModule(createdModule._id, lectureId);

      expect(updatedModule.lectures).to.have.lengthOf(1);
      expect(updatedModule.lectures).to.include(lectureId);
    });
  });
});
