import mongoose from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const lectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    organization: { type: String, required: true },
    slides: [
      {
        id: { type: Number, required: true },
        title: { type: String },
        content: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

lectureSchema.plugin(aggregatePaginate);
lectureSchema.index({ createdAt: 1 });

export const Lecture = mongoose.model('Lecture', lectureSchema);

Lecture.syncIndexes();

export default Lecture;
