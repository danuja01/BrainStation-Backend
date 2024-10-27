import mongoose from 'mongoose';
import Quiz from '@/models/quiz';

export const buildQuizAggregation = (filter, sort) => {
  return Quiz.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: 'questions',
        localField: 'questionId',
        foreignField: '_id',
        as: 'questionDetails'
      }
    },
    {
      $lookup: {
        from: 'lectures',
        localField: 'lectureId',
        foreignField: '_id',
        as: 'lectureDetails'
      }
    },
    {
      $lookup: {
        from: 'modules',
        localField: 'moduleId',
        foreignField: '_id',
        as: 'moduleDetails'
      }
    },
    { $unwind: '$questionDetails' },
    { $unwind: { path: '$lectureDetails', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$moduleDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        'questionDetails.question': 1,
        'questionDetails.answer': 1,
        'questionDetails.distractors': 1,
        'lectureDetails.title': 1,
        'moduleDetails.name': 1,
        'userId': 1,
        'lectureId': 1,
        'questionId': 1,
        'moduleId': 1,
        'status': 1,
        'interval': 1,
        'ease_factor': 1,
        'next_review_date': 1,
        'current_step': 1,
        'learningSteps': 1,
        'attemptCount': 1,
        'updatedAt': 1,
        'attempt_question': 1
      }
    },
    { $sort: sort }
  ]);
};

export const buildUserQuizzesDueDetailsAggregation = (userId) => {
  const now = new Date();
  const endOfTodayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 23, 59, 59, 999)
  );

  const userObjectId = new mongoose.Types.ObjectId(userId);

  return [
    { $match: { userId: userObjectId } },
    {
      $facet: {
        dueToday: [
          {
            $match: {
              next_review_date: { $lte: endOfTodayUTC },
              status: { $nin: ['lapsed', 'new'] } // Exclude learning phase statuses
            }
          },
          { $count: 'count' }
        ],
        learningPhase: [
          {
            $match: {
              status: { $in: ['new', 'lapsed'] }
            }
          },
          { $count: 'count' }
        ]
      }
    },
    {
      $project: {
        dueTodayCount: { $arrayElemAt: ['$dueToday.count', 0] },
        learningPhaseCount: { $arrayElemAt: ['$learningPhase.count', 0] }
      }
    }
  ];
};

export const buildQuestionCountByLectureAggregation = (lectureIds) => [
  { $match: { lectureId: { $in: lectureIds } } },
  {
    $group: {
      _id: '$lectureId',
      questionCount: { $sum: 1 }
    }
  }
];

export const buildLectureQuizSummaryAggregation = (userId, lectureIds) => [
  {
    $match: { lectureId: { $in: lectureIds } }
  },
  {
    $lookup: {
      from: 'lectures',
      localField: 'lectureId',
      foreignField: '_id',
      as: 'lectureDetails'
    }
  },
  { $unwind: { path: '$lectureDetails', preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: 'quizzes',
      let: { questionId: '$_id', lectureId: '$lectureId' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$questionId', '$$questionId'] },
                { $eq: ['$lectureId', '$$lectureId'] },
                { $eq: ['$userId', new mongoose.Types.ObjectId(userId)] }
              ]
            }
          }
        }
      ],
      as: 'userQuizDetails'
    }
  },
  {
    $lookup: {
      from: 'quizfeedbacks',
      let: { lectureId: '$lectureId' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ['$lectureId', '$$lectureId'] }, { $eq: ['$userId', new mongoose.Types.ObjectId(userId)] }]
            }
          }
        }
      ],
      as: 'feedback'
    }
  },
  {
    $group: {
      _id: '$lectureId',
      lectureTitle: { $first: '$lectureDetails.title' },
      totalQuizzes: { $sum: 1 },
      lapsedCount: {
        $sum: {
          $size: {
            $filter: {
              input: '$userQuizDetails',
              as: 'quiz',
              cond: { $eq: ['$$quiz.status', 'lapsed'] }
            }
          }
        }
      },
      reviewCount: {
        $sum: {
          $size: {
            $filter: {
              input: '$userQuizDetails',
              as: 'quiz',
              cond: { $eq: ['$$quiz.status', 'review'] }
            }
          }
        }
      },
      questions: {
        $push: {
          questionText: '$question',
          answer: '$answer',
          alternatives: '$alternative_questions'
        }
      },
      feedback: { $first: { $arrayElemAt: ['$feedback', 0] } }
    }
  },
  {
    $project: {
      _id: 0,
      lectureId: '$_id',
      lectureTitle: 1,
      totalQuizzes: 1,
      lapsedCount: 1,
      reviewCount: 1,
      questions: { $ifNull: ['$questions', []] },
      feedback: {
        strength: { $ifNull: ['$feedback.strength', []] },
        weakness: { $ifNull: ['$feedback.weakness', []] }
      }
    }
  },
  {
    $sort: { lectureTitle: 1 } // Optional sorting
  }
];
