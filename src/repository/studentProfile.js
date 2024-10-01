import mongoose from 'mongoose';

export const fetchStudentDataFromDB = async (Student_id) => {
  const studentProfilesCollection = mongoose.connection.collection('StudentProfile_Test');
  console.log('Querying MongoDB with Student_ID:', parseInt(Student_id, 10));
  const studentData = await studentProfilesCollection.findOne({ Student_ID: parseInt(Student_id, 10) });
  console.log('MongoDB result:', studentData);
  return studentData;
};
