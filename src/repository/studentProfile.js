import mongoose from 'mongoose';

export const fetchStudentDataFromDB = async (Student_id) => {
  const studentProfilesCollection = mongoose.connection.collection('StudentProfile_Test');
  const studentData = await studentProfilesCollection.findOne({ Student_ID: parseInt(Student_id, 10) });
  return studentData;
};
