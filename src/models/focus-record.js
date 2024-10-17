import mongoose from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const focusRecordsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
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
      type: String
    },
    focus_time: {
      type: Number
    },
    total_movements: {
      type: Number
    },
    erratic_movements: {
      type: Number
    },
    erratic_percentage: {
      type: Number
    },
    emotion_distribution: {
      type: Map,
      of: Number
    }
  },
  {
    timestamps: true
  }
);

focusRecordsSchema.plugin(aggregatePaginate);
focusRecordsSchema.index({ createdAt: 1 });

const FocusRecord = mongoose.model('FocusRecord', focusRecordsSchema);

FocusRecord.syncIndexes();

export default FocusRecord;
