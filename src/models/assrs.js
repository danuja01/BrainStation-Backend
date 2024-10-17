import mongoose from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const AssrsResultSchema = new mongoose.Schema(
  {
    assrsResult: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },
  {
    versionKey: '__v',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

AssrsResultSchema.plugin(aggregatePaginate);

const AssrResult = mongoose.model('AssrResult', AssrsResultSchema);

export default AssrResult;
