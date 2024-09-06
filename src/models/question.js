import mongoose from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const questionSchema = new mongoose.Schema(
  {
    context: {
      type: String,
      required: true
    },
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    distractors: {
      type: [String],
      validate: [arrayLimit, '{PATH} exceeds the limit of 3'],
      required: true
    },
    isFlagged: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length === 3;
}

questionSchema.plugin(aggregatePaginate);

questionSchema.index({ createdAt: 1 });

export const Question = mongoose.model('Question', questionSchema);

Question.syncIndexes();

export default Question;
