import mongoose from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const quizFeedbackSchema = new mongoose.Schema(
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
    strength: [
      {
        type: String,
        required: true
      }
    ],
    weakness: [
      {
        type: String,
        required: true
      }
    ]
  },
  { timestamps: true }
);

quizFeedbackSchema.plugin(aggregatePaginate);

export const QuizFeedback = mongoose.model('QuizFeedback', quizFeedbackSchema);
