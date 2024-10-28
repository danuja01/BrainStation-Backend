import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mongoose from 'mongoose';
import FocusRecord from '@/models/focus-record';
import * as FocusRecordRepository from '@/repository/focus-record';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('FocusRecord Repository', function () {
  beforeEach(async function () {
    await FocusRecord.deleteMany({});
  });

  describe('createSession', function () {
    it('should create a new focus record session', async function () {
      const sessionData = {
        userId: new mongoose.Types.ObjectId(),
        moduleId: new mongoose.Types.ObjectId(),
        startTime: new Date(),
        stopTime: new Date(),
        date: new Date(),
        focus_time: 3600
      };

      const createdSession = await FocusRecordRepository.createSession(sessionData);
      expect(createdSession).to.have.property('_id');
      expect(createdSession.focus_time).to.equal(sessionData.focus_time);
    });
  });

  describe('getSessionById', function () {
    it('should retrieve a session by its ID', async function () {
      const sessionData = {
        userId: new mongoose.Types.ObjectId(),
        moduleId: new mongoose.Types.ObjectId(),
        startTime: new Date(),
        stopTime: new Date(),
        date: new Date()
      };

      const createdSession = await FocusRecordRepository.createSession(sessionData);
      const foundSession = await FocusRecordRepository.getSessionById(createdSession._id);

      expect(foundSession).to.have.property('_id');
      expect(foundSession._id.toString()).to.equal(createdSession._id.toString());
    });
  });

  describe('getAllSessionsByUserId', function () {
    it('should retrieve all sessions for a user with pagination', async function () {
      const userId = new mongoose.Types.ObjectId();
      const sessionsData = [
        {
          userId,
          moduleId: new mongoose.Types.ObjectId(),
          startTime: new Date(),
          stopTime: new Date(),
          date: new Date()
        },
        {
          userId,
          moduleId: new mongoose.Types.ObjectId(),
          startTime: new Date(),
          stopTime: new Date(),
          date: new Date()
        }
      ];

      await FocusRecord.insertMany(sessionsData);
      const result = await FocusRecordRepository.getAllSessionsByUserId(userId, { page: 1, limit: 2 });
      expect(result.docs).to.have.lengthOf(2);
    });
  });

  describe('getSessionsOfUserByModule', function () {
    it('should retrieve sessions for a user in a specific module', async function () {
      const userId = new mongoose.Types.ObjectId();
      const moduleId = new mongoose.Types.ObjectId();
      const sessionsData = [
        { userId, moduleId, startTime: new Date(), stopTime: new Date(), date: new Date() },
        { userId, moduleId, startTime: new Date(), stopTime: new Date(), date: new Date() }
      ];

      await FocusRecord.insertMany(sessionsData);
      const result = await FocusRecordRepository.getSessionsOfUserByModule(userId, moduleId, { page: 1, limit: 2 });
      expect(result.docs).to.have.lengthOf(2);
    });
  });

  describe('getStartAndEndTimesByUser', function () {
    it('should calculate total session duration in seconds for a user', async function () {
      const userId = new mongoose.Types.ObjectId();
      const sessionData = [
        {
          userId,
          moduleId: new mongoose.Types.ObjectId(),
          startTime: new Date(),
          stopTime: new Date(Date.now() + 3600000),
          date: new Date()
        },
        {
          userId,
          moduleId: new mongoose.Types.ObjectId(),
          startTime: new Date(),
          stopTime: new Date(Date.now() + 1800000),
          date: new Date()
        }
      ];

      await FocusRecord.insertMany(sessionData);
      const totalTimeInSeconds = await FocusRecordRepository.getStartAndEndTimesByUser(userId, { page: 1, limit: 2 });

      expect(totalTimeInSeconds).to.be.closeTo(5400, 1); // 1.5 hours in seconds
    });
  });

  describe('getTotalFocusTime', function () {
    it('should calculate total focus time for a user in a module', async function () {
      const userId = new mongoose.Types.ObjectId();
      const moduleId = new mongoose.Types.ObjectId();
      const sessionData = [
        { userId, moduleId, focus_time: 3600, date: new Date(), startTime: new Date(), stopTime: new Date() },
        { userId, moduleId, focus_time: 1800, date: new Date(), startTime: new Date(), stopTime: new Date() }
      ];

      await FocusRecord.insertMany(sessionData);
      const totalFocusTime = await FocusRecordRepository.getTotalFocusTime(userId, moduleId);
      expect(totalFocusTime).to.equal(5400); // Total focus time
    });
  });

  describe('getAverageFocusTime', function () {
    it('should calculate the average focus time for a user in a module', async function () {
      const userId = new mongoose.Types.ObjectId();
      const moduleId = new mongoose.Types.ObjectId();
      const sessionData = [
        {
          userId,
          moduleId,
          focus_time: 3600,
          date: new Date(),
          startTime: new Date(),
          stopTime: new Date(Date.now() + 3600000)
        },
        {
          userId,
          moduleId,
          focus_time: 1800,
          date: new Date(),
          startTime: new Date(),
          stopTime: new Date(Date.now() + 1800000)
        }
      ];

      await FocusRecord.insertMany(sessionData);
      const averageFocusTime = await FocusRecordRepository.getAverageFocusTime(userId, moduleId);
      expect(averageFocusTime).to.equal(2700); // Average focus time
    });
  });

  describe('getMostFrequentFinalClassification', function () {
    it('should return the most frequent final classification for a user', async function () {
      const userId = new mongoose.Types.ObjectId();
      const sessionData = [
        {
          userId,
          moduleId: new mongoose.Types.ObjectId(),
          final_classification: 'focused',
          date: new Date(),
          startTime: new Date(),
          stopTime: new Date(Date.now() + 3600000)
        },
        {
          userId,
          moduleId: new mongoose.Types.ObjectId(),
          final_classification: 'distracted',
          date: new Date(),
          startTime: new Date(),
          stopTime: new Date(Date.now() + 1800000)
        },
        {
          userId,
          moduleId: new mongoose.Types.ObjectId(),
          final_classification: 'focused',
          date: new Date(),
          startTime: new Date(),
          stopTime: new Date(Date.now() + 5400000)
        }
      ];

      await FocusRecord.insertMany(sessionData);
      const result = await FocusRecordRepository.getMostFrequentFinalClassification(userId);
      expect(result.mostFrequentClassification).to.equal('focused');
    });
  });
});
