// Calculate cumulative average quiz score dynamically
export const calculateCumulativeAverage = (studentData) => {
  let totalMarks = 0;
  let quizCount = 0;

  // Loop through the quizzes array
  studentData.quizzes.forEach((quiz) => {
    totalMarks += quiz.score;
    quizCount++;
  });

  if (quizCount === 0) return 0;

  return totalMarks / quizCount;
};

// Get the lowest two quiz scores
export const getLowestTwoChapters = (studentData) => {
  // Create an array of quizzes with titles and scores
  const quizScores = studentData.quizzes.map((quiz) => ({
    chapter: quiz.lectureTitles,
    score: quiz.score
  }));

  // Sort the quizzes based on score in ascending order
  quizScores.sort((a, b) => a.score - b.score);

  // Return the two lowest-scoring quizzes
  return quizScores.slice(0, 2);
};
