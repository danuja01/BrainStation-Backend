// // src/models/predictionModel.js
// import mongoose from 'mongoose';

// const predictionSchema = new mongoose.Schema({
//   student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
//   predicted_exam_score: { type: Number, required: true },
//   performer_type: { type: String, required: true },
//   lowest_two_chapters: [
//     {
//       chapter: { type: String, required: true },
//       score: { type: Number, required: true }
//     }
//   ],
//   createdAt: { type: Date, default: Date.now }
// });

// const Prediction = mongoose.model('Prediction', predictionSchema);
// export default Prediction;
