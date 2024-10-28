import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Lecture } from '@/models/lecture';
import * as LectureRepository from '@/repository/lecture';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Lecture Repository', function () {
  beforeEach(async function () {
    await Lecture.deleteMany({});
  });

  describe('insertLecture', function () {
    it('should insert a new lecture', async function () {
      const lectureData = {
        title: 'Introduction to Biology',
        organization: 'Science Department',
        slides: [
          { id: 1, title: 'Slide 1', content: 'Introduction' },
          { id: 2, title: 'Slide 2', content: 'Cell Structure' }
        ]
      };

      const createdLecture = await LectureRepository.insertLecture(lectureData);
      expect(createdLecture).to.have.property('_id');
      expect(createdLecture.title).to.equal(lectureData.title);
      expect(createdLecture.organization).to.equal(lectureData.organization);
      expect(createdLecture.slides).to.have.lengthOf(2);
    });
  });

  describe('getLectureById', function () {
    it('should retrieve a lecture by ID', async function () {
      const lectureData = {
        title: 'Physics Fundamentals',
        organization: 'Science Department',
        slides: [{ id: 1, title: 'Introduction', content: 'Physics Basics' }]
      };

      const createdLecture = await LectureRepository.insertLecture(lectureData);
      const foundLecture = await LectureRepository.getLectureById(createdLecture._id);

      expect(foundLecture._id.toString()).to.equal(createdLecture._id.toString());
      expect(foundLecture.title).to.equal(lectureData.title);
    });

    it('should return null if lecture not found', async function () {
      const foundLecture = await LectureRepository.getLectureById('nonexistentid').catch(() => null);
      expect(foundLecture).to.be.null;
    });
  });

  describe('getOneLecture', function () {
    it('should retrieve a lecture matching the filter', async function () {
      const lectureData = {
        title: 'Chemistry 101',
        organization: 'Chemistry Department',
        slides: [{ id: 1, title: 'Slide 1', content: 'Atoms and Molecules' }]
      };

      await LectureRepository.insertLecture(lectureData);
      const foundLecture = await LectureRepository.getOneLecture({ title: 'Chemistry 101' });

      expect(foundLecture).to.have.property('_id');
      expect(foundLecture.title).to.equal('Chemistry 101');
    });
  });

  describe('getLecturesByOrg', function () {
    it('should return paginated lectures by organization filter', async function () {
      const lecturesData = [
        { title: 'Intro to Physics', organization: 'Physics Dept', slides: [{ id: 1, content: 'Basics of Physics' }] },
        { title: 'Physics Advanced', organization: 'Physics Dept', slides: [{ id: 1, content: 'Advanced Topics' }] },
        {
          title: 'Intro to Chemistry',
          organization: 'Chemistry Dept',
          slides: [{ id: 1, content: 'Basics of Chemistry' }]
        }
      ];

      await Lecture.insertMany(lecturesData);

      const result = await LectureRepository.getLecturesByOrg({
        filter: { organization: 'Physics Dept' },
        page: 1,
        limit: 2
      });
      expect(result.docs).to.have.lengthOf(2);
      expect(result.docs[0].organization).to.equal('Physics Dept');
    });
  });

  describe('deleteLecture', function () {
    it('should delete a lecture by ID', async function () {
      const lectureData = {
        title: 'Mathematics Fundamentals',
        organization: 'Math Department',
        slides: [{ id: 1, content: 'Introduction to Algebra' }]
      };

      const createdLecture = await LectureRepository.insertLecture(lectureData);
      const deletedLecture = await LectureRepository.deleteLecture(createdLecture._id);

      expect(deletedLecture._id.toString()).to.equal(createdLecture._id.toString());

      const foundLecture = await Lecture.findById(createdLecture._id);
      expect(foundLecture).to.be.null;
    });

    it('should return null if lecture not found', async function () {
      const deletedLecture = await LectureRepository.deleteLecture('nonexistentid').catch(() => null);
      expect(deletedLecture).to.be.null;
    });
  });

  describe('updateLecture', function () {
    it('should update a lecture by ID', async function () {
      const lectureData = {
        title: 'Biology Basics',
        organization: 'Biology Department',
        slides: [{ id: 1, content: 'Introduction to Biology' }]
      };

      const createdLecture = await LectureRepository.insertLecture(lectureData);
      const updateData = { title: 'Advanced Biology' };
      const updatedLecture = await LectureRepository.updateLecture(createdLecture._id, updateData);

      expect(updatedLecture.title).to.equal(updateData.title);
    });

    it('should return null if lecture not found', async function () {
      const updatedLecture = await LectureRepository.updateLecture('nonexistentid', { title: 'Test' }).catch(
        () => null
      );
      expect(updatedLecture).to.be.null;
    });
  });
});
