// Calculate cumulative average quiz score dynamically
export const calculateCumulativeAverage = (studentData) => {
  let totalMarks = 0;
  let quizCount = 0;

  // Loop through the student's data
  for (const key in studentData) {
    // Check if the key corresponds to a quiz mark (e.g., "Quiz_IntroductionOS_Marks")
    if (key.startsWith('Quiz_') && key.endsWith('_Marks')) {
      totalMarks += studentData[key];
      quizCount++;
    }
  }

  if (quizCount === 0) return 0;

  return totalMarks / quizCount;
};

export const getLowestTwoChapters = (studentData) => {
  const quizScores = Object.keys(studentData)
    .filter((key) => key.startsWith('Quiz_') && key.endsWith('_Marks'))
    .map((key) => ({ chapter: key.replace('_Marks', ''), score: studentData[key] }));

  quizScores.sort((a, b) => a.score - b.score);

  return quizScores.slice(0, 2); // Return the two lowest scores
};
