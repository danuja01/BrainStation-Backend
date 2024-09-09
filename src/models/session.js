import mongoose from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    stopTime: {
      type: Date,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    final_classification: {
      type: String,
      required: true
    },
    focus_time: {
      type: Number,
      required: true
    },
    total_movements: {
      type: Number,
      required: true
    },
    erratic_movements: {
      type: Number,
      required: true
    },
    erratic_percentage: {
      type: Number,
      required: true
    },
    emotion_distribution: {
      type: Map,
      of: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

sessionSchema.plugin(aggregatePaginate);
sessionSchema.index({ createdAt: 1 });

const Session = mongoose.model('FocusRecord', sessionSchema);

Session.syncIndexes();

export default Session;
