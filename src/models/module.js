import mongoose from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const moduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    moduleCode: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    lectures: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Lecture'
    }
  },
  { timestamps: true }
);

moduleSchema.plugin(aggregatePaginate);
moduleSchema.index({ createdAt: 1 });

export const Module = mongoose.model('Module', moduleSchema);

Module.syncIndexes();

export default Module;
