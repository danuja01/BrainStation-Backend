import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
// import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Question } from '@/models/question';
import * as QuestionRepository from '@/repository/question';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Question Repository', function () {
  beforeEach(async function () {
    await Question.deleteMany({});
  });

  describe('insertQuestion', function () {
    it('should insert a new question', async function () {
      const questionData = {
        context: 'Math',
        question: 'What is 2 + 2?',
        alternative_questions: ['What’s the result of 2 plus 2?', 'Calculate 2 + 2'],
        answer: '4',
        distractors: ['3', '5', '6'],
        lectureId: new mongoose.Types.ObjectId()
      };

      const createdQuestion = await QuestionRepository.insertQuestion(questionData);
      expect(createdQuestion).to.have.property('_id');
      expect(createdQuestion.question).to.equal(questionData.question);
    });
  });

  describe('getQuestions', function () {
    it('should return paginated questions based on filter and sort', async function () {
      const lectureId = new mongoose.Types.ObjectId();
      const questionsData = [
        {
          context: 'Science',
          question: 'What is H2O?',
          answer: 'Water',
          lectureId,
          alternative_questions: ['What’s H2O?'],
          distractors: ['Hydrogen', 'Oxygen', 'Carbon Dioxide']
        },
        {
          context: 'Math',
          question: 'What is 5 * 5?',
          answer: '25',
          lectureId,
          alternative_questions: ['Calculate 5 times 5'],
          distractors: ['20', '30', '10']
        }
      ];

      await Question.insertMany(questionsData);

      const result = await QuestionRepository.getQuestions({ filter: { lectureId }, page: 1, limit: 2 });
      expect(result.docs).to.have.lengthOf(2);
      expect(result.docs[0].context).to.equal('Science');
    });
  });

  describe('updateQuestion', function () {
    it('should update a question by ID', async function () {
      const questionData = {
        context: 'History',
        question: 'Who was the first president?',
        answer: 'George Washington',
        lectureId: new mongoose.Types.ObjectId(),
        alternative_questions: ['First president of the US'],
        distractors: ['Lincoln', 'Jefferson', 'Roosevelt']
      };
      const createdQuestion = await QuestionRepository.insertQuestion(questionData);

      const updateData = { answer: 'Washington' };
      const updatedQuestion = await QuestionRepository.updateQuestion(createdQuestion._id, updateData);

      expect(updatedQuestion.answer).to.equal(updateData.answer);
    });
  });

  describe('getQuestionById', function () {
    it('should return a question by ID', async function () {
      const questionData = {
        context: 'Physics',
        question: 'What is the speed of light?',
        answer: '299792458 m/s',
        lectureId: new mongoose.Types.ObjectId(),
        alternative_questions: ['Speed of light'],
        distractors: ['150000 m/s', '1000000 m/s', 'None']
      };
      const createdQuestion = await QuestionRepository.insertQuestion(questionData);

      const foundQuestion = await QuestionRepository.getQuestionById(createdQuestion._id);
      expect(foundQuestion._id.toString()).to.equal(createdQuestion._id.toString());
    });
  });

  describe('deleteQuestion', function () {
    it('should delete a question by ID', async function () {
      const questionData = {
        context: 'Geography',
        question: 'What is the capital of France?',
        answer: 'Paris',
        lectureId: new mongoose.Types.ObjectId(),
        alternative_questions: ['Capital city of France'],
        distractors: ['London', 'Berlin', 'Rome']
      };
      const createdQuestion = await QuestionRepository.insertQuestion(questionData);

      const deletedQuestion = await QuestionRepository.deleteQuestion(createdQuestion._id);
      expect(deletedQuestion._id.toString()).to.equal(createdQuestion._id.toString());

      const foundQuestion = await Question.findById(createdQuestion._id);
      expect(foundQuestion).to.be.null;
    });
  });

  describe('flagQuestion', function () {
    it('should flag a question by ID', async function () {
      const questionData = {
        context: 'English',
        question: 'Define irony.',
        answer: 'Opposite of what is expected',
        lectureId: new mongoose.Types.ObjectId(),
        alternative_questions: ['What is irony?'],
        distractors: ['Sarcasm', 'Satire', 'Pun']
      };
      const createdQuestion = await QuestionRepository.insertQuestion(questionData);

      const flaggedQuestion = await QuestionRepository.flagQuestion(createdQuestion._id);
      expect(flaggedQuestion.isFlagged).to.be.true;
    });
  });
});
