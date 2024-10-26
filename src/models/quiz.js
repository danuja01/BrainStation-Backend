import mongoose from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lectureId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    status: {
      type: String,
      enum: ['new', 'lapsed', 'review'],
      required: true
    },
    interval: {
      type: Number,
      default: 1
    },
    ease_factor: {
      type: Number,
      default: 2
    },
    next_review_date: {
      type: Date,
      required: true
    },
    attemptCount: {
      type: Number,
      default: 0
    },
    learningSteps: {
      type: [Number],
      default: [5, 10, 25]
    },
    current_step: {
      type: Number,
      default: 0
    },
    attempt_question: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

quizSchema.plugin(aggregatePaginate);
quizSchema.index({ createdAt: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

Quiz.syncIndexes();

export default Quiz;
