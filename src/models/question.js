import mongoose from 'mongoose';

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
    }
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length === 3;
}

export const Question = mongoose.model('Question', questionSchema);
