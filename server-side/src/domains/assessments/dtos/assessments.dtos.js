/**
 * Assessments DTOs
 * Validation schemas for exam, questions, attempts, answers, and grading endpoints
 */

const { z } = require('zod');

// ============================================
// Exam DTOs
// ============================================

const ExamCreateDTO = z.object({
    activityId: z.union([z.string().cuid(), z.string().uuid()]),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    totalQuestions: z.number().int().min(1),
    passingScore: z.number().int().min(0).max(100).optional(),
    timeLimit: z.number().int().min(1).optional(),
    shuffleQuestions: z.boolean().optional()
});

const ExamUpdateDTO = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    totalQuestions: z.number().int().min(1).optional(),
    passingScore: z.number().int().min(0).max(100).optional(),
    timeLimit: z.number().int().min(1).optional(),
    shuffleQuestions: z.boolean().optional()
});

const ExamResponseDTO = z.object({
    id: z.string().cuid(),
    activityId: z.string().cuid(),
    totalQuestions: z.number().int(),
    passingScore: z.number().int(),
    timeLimit: z.number().int().nullable(),
    shuffleQuestions: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

// ============================================
// Exam Question DTOs
// ============================================

const ExamQuestionCreateDTO = z.object({
    examId: z.union([z.string().cuid(), z.string().uuid()]),
    questionText: z.string().min(5),
    displayOrder: z.number().int().min(0).optional(),
    questionType: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY']),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    options: z.string().optional(), // JSON stringified
    correctAnswer: z.string().optional(),
    explanation: z.string().optional(),
    points: z.number().int().min(1).optional()
});

const ExamQuestionUpdateDTO = z.object({
    questionText: z.string().min(5).optional(),
    displayOrder: z.number().int().min(0).optional(),
    questionType: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY']).optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    options: z.string().optional(),
    correctAnswer: z.string().optional(),
    explanation: z.string().optional(),
    points: z.number().int().min(1).optional()
});

const ExamQuestionResponseDTO = z.object({
    id: z.string().cuid(),
    examId: z.string().cuid(),
    questionText: z.string(),
    displayOrder: z.number().int(),
    questionType: z.string(),
    difficulty: z.string().nullable(),
    options: z.string().nullable(),
    correctAnswer: z.string().nullable(),
    explanation: z.string().nullable(),
    points: z.number().int(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

// ============================================
// Exam Attempt DTOs
// ============================================

const ExamAttemptStartDTO = z.object({
    examId: z.union([z.string().cuid(), z.string().uuid()])
});

const ExamAttemptSubmitDTO = z.object({
    attemptId: z.union([z.string().cuid(), z.string().uuid()]),
    answers: z.array(z.object({
        questionId: z.union([z.string().cuid(), z.string().uuid()]),
        userAnswer: z.string()
    }))
});

const ExamAttemptResponseDTO = z.object({
    id: z.string().cuid(),
    examId: z.string().cuid(),
    userId: z.string().cuid(),
    startedAt: z.string().datetime(),
    submittedAt: z.string().datetime().nullable(),
    totalTimeSpent: z.number().int().nullable(),
    score: z.number().int().nullable(),
    percentage: z.number().int().nullable(),
    isPassed: z.boolean().nullable(),
    feedback: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

// ============================================
// Exam Answer DTOs
// ============================================

const ExamAnswerResponseDTO = z.object({
    id: z.string().cuid(),
    attemptId: z.string().cuid(),
    questionId: z.string().cuid(),
    userAnswer: z.string().nullable(),
    isCorrect: z.boolean().nullable(),
    pointsEarned: z.number().int(),
    createdAt: z.string().datetime()
});

// ============================================
// Attempt Option Snapshot DTOs
// ============================================

const AttemptOptionSnapshotResponseDTO = z.object({
    id: z.string().cuid(),
    attemptId: z.string().cuid(),
    questionId: z.string().cuid(),
    options: z.string(), // JSON snapshot
    createdAt: z.string().datetime()
});

// ============================================
// Grading Scheme DTOs (Global Entity)
// ============================================

const GradingSchemeCreateDTO = z.object({
    name: z.string().min(3),
    description: z.string().optional(),
    totalPoints: z.number().int().min(1).optional(),
    passingScore: z.number().int().min(0).optional(),
    gradeA: z.number().int().min(0).optional(),
    gradeB: z.number().int().min(0).optional(),
    gradeC: z.number().int().min(0).optional(),
    gradeD: z.number().int().min(0).optional(),
    gradeF: z.number().int().min(0).optional()
});

const GradingSchemeUpdateDTO = z.object({
    name: z.string().min(3).optional(),
    description: z.string().optional(),
    totalPoints: z.number().int().min(1).optional(),
    passingScore: z.number().int().min(0).optional(),
    gradeA: z.number().int().min(0).optional(),
    gradeB: z.number().int().min(0).optional(),
    gradeC: z.number().int().min(0).optional(),
    gradeD: z.number().int().min(0).optional(),
    gradeF: z.number().int().min(0).optional()
});

const GradingSchemeResponseDTO = z.object({
    id: z.string().cuid(),
    name: z.string(),
    description: z.string().nullable(),
    totalPoints: z.number().int(),
    passingScore: z.number().int(),
    gradeA: z.number().int(),
    gradeB: z.number().int(),
    gradeC: z.number().int(),
    gradeD: z.number().int(),
    gradeF: z.number().int(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

module.exports = {
    ExamCreateDTO,
    ExamUpdateDTO,
    ExamResponseDTO,
    ExamQuestionCreateDTO,
    ExamQuestionUpdateDTO,
    ExamQuestionResponseDTO,
    ExamAttemptStartDTO,
    ExamAttemptSubmitDTO,
    ExamAttemptResponseDTO,
    ExamAnswerResponseDTO,
    AttemptOptionSnapshotResponseDTO,
    GradingSchemeCreateDTO,
    GradingSchemeUpdateDTO,
    GradingSchemeResponseDTO
};
