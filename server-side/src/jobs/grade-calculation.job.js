/**
 * Grade Calculation Job
 * Calculates and updates grades for students
 * Handles auto-grading (MCQ, short answer) and manual grading
 */

const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * Calculate grades for a course
 * @param {number} courseId - Course ID
 * @returns {Promise<object>} - Grade calculation results
 */
const calculateCourseGrades = async (courseId) => {
    try {
        // Get all enrollments for the course
        const enrollments = await prisma.enrollment.findMany({
            where: { courseId },
            include: {
                student: true
            }
        });

        const results = [];

        for (const enrollment of enrollments) {
            const gradeData = await calculateStudentGrade(enrollment.id, courseId);
            results.push(gradeData);
        }

        logger.info(`Grades calculated for course ${courseId}: ${results.length} students`);
        return {
            courseId,
            studentsProcessed: results.length,
            results
        };

    } catch (error) {
        logger.error('Grade calculation failed:', error.message);
        throw error;
    }
};

/**
 * Calculate grade for a single student
 * @param {number} enrollmentId - Enrollment ID
 * @param {number} courseId - Course ID
 * @returns {Promise<object>} - Student grade details
 */
const calculateStudentGrade = async (enrollmentId, courseId) => {
    try {
        // Fetch all assessments for the course
        const assessments = await prisma.assessment.findMany({
            where: { courseId },
            include: {
                examAttempts: {
                    where: {
                        enrollment: { id: enrollmentId }
                    }
                }
            }
        });

        let totalScore = 0;
        let totalWeight = 0;
        const assessmentScores = [];

        // Calculate weighted score
        for (const assessment of assessments) {
            if (assessment.examAttempts.length === 0) continue;

            // Get best attempt
            const bestAttempt = assessment.examAttempts.reduce((best, current) =>
                current.score > best.score ? current : best
            );

            const weightedScore = (bestAttempt.score / 100) * assessment.weight;
            totalScore += weightedScore;
            totalWeight += assessment.weight;

            assessmentScores.push({
                assessmentId: assessment.id,
                assessmentName: assessment.title,
                score: bestAttempt.score,
                weight: assessment.weight,
                weightedScore
            });
        }

        // Calculate final grade
        const finalScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
        const letterGrade = getLetterGrade(finalScore);

        // Update or create grade record
        const grade = await prisma.grade.upsert({
            where: {
                enrollmentId_courseId: {
                    enrollmentId,
                    courseId
                }
            },
            create: {
                enrollmentId,
                courseId,
                score: finalScore,
                letterGrade,
                passedStatus: finalScore >= 60
            },
            update: {
                score: finalScore,
                letterGrade,
                passedStatus: finalScore >= 60,
                updatedAt: new Date()
            }
        });

        return {
            enrollmentId,
            courseId,
            finalScore,
            letterGrade,
            assessmentScores,
            gradeId: grade.id,
            passed: finalScore >= 60
        };

    } catch (error) {
        logger.error(`Grade calculation failed for enrollment ${enrollmentId}:`, error.message);
        throw error;
    }
};

/**
 * Auto-grade exam attempt (MCQ answers)
 * @param {number} attemptId - Exam attempt ID
 * @returns {Promise<object>} - Auto-grading result
 */
const autoGradeExamAttempt = async (attemptId) => {
    try {
        const attempt = await prisma.examAttempt.findUnique({
            where: { id: attemptId },
            include: {
                exam: {
                    include: { questions: true }
                },
                examAnswers: true
            }
        });

        if (!attempt) {
            throw new Error(`Exam attempt ${attemptId} not found`);
        }

        let score = 0;
        const totalQuestions = attempt.exam.questions.length;
        const gradingDetails = [];

        // Grade each answer
        for (const answer of attempt.examAnswers) {
            const question = attempt.exam.questions.find(q => q.id === answer.questionId);

            if (!question) continue;

            // For MCQ: check if answer matches correct option
            const isCorrect = question.questionType === 'MCQ'
                ? answer.selectedOption === question.correctAnswer
                : false; // Manual questions need human grading

            if (isCorrect) {
                score += (question.points || 1);
            }

            gradingDetails.push({
                questionId: question.id,
                questionType: question.questionType,
                isCorrect,
                pointsAwarded: isCorrect ? (question.points || 1) : 0
            });
        }

        // Calculate percentage
        const totalPoints = attempt.exam.questions.reduce((sum, q) => sum + (q.points || 1), 0);
        const percentage = (score / totalPoints) * 100;

        // Update attempt
        const updated = await prisma.examAttempt.update({
            where: { id: attemptId },
            data: {
                score: percentage,
                gradedAt: new Date(),
                gradingDetails
            }
        });

        logger.info(`Auto-graded exam attempt ${attemptId}: ${percentage.toFixed(2)}%`);

        return {
            attemptId,
            score: percentage,
            totalPoints,
            pointsAwarded: score,
            gradingDetails,
            success: true
        };

    } catch (error) {
        logger.error('Auto-grading failed:', error.message);
        throw error;
    }
};

/**
 * Convert numeric score to letter grade
 * @param {number} score - Numeric score (0-100)
 * @returns {string} - Letter grade (A, B, C, D, F)
 */
const getLetterGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
};

module.exports = {
    calculateCourseGrades,
    calculateStudentGrade,
    autoGradeExamAttempt,
    getLetterGrade
};
