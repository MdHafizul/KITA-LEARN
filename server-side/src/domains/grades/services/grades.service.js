/**
 * Grades Service
 * Business logic for grade and rubric operations
 */

const { ValidationException } = require('../../../exceptions');
const gradesRepository = require('../repositories/grades.repository');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class GradesService {
    // ============================================
    // GRADE OPERATIONS
    // ============================================

    /**
     * Get grade by ID
     */
    async getGradeById(id) {
        const grade = await gradesRepository.findGradeById(id);

        if (!grade) {
            throw new ValidationException('Grade not found', 'GRADE_NOT_FOUND');
        }

        return grade;
    }

    /**
     * Get grades by user (student view)
     */
    async getGradesByUser(userId, pagination, requestorId, requestorRole) {
        // Students can only view their own grades, lecturers/admins can view any
        if (requestorRole === 'STUDENT' && requestorId !== userId) {
            throw new ValidationException(
                'Students can only view their own grades',
                'UNAUTHORIZED_GRADE_ACCESS'
            );
        }

        return gradesRepository.findGradesByUser(userId, pagination);
    }

    /**
     * Get grades by course (curriculum/lecturer view)
     */
    async getGradesByCourse(courseId, pagination, requestorId, requestorRole) {
        // Verify user is lecturer of this course or admin
        if (requestorRole === 'LECTURER') {
            const course = await prisma.course.findUnique({
                where: { id: courseId },
                select: { lecturerId: true }
            });

            if (course?.lecturerId !== requestorId) {
                throw new ValidationException(
                    'Only the course instructor can view course grades',
                    'UNAUTHORIZED_COURSE_ACCESS'
                );
            }
        }

        return gradesRepository.findGradesByCourse(courseId, pagination);
    }

    /**
     * Get grades by activity (assignment/exam)
     */
    async getGradesByActivity(activityId, pagination, requestorId, requestorRole) {
        // Verify user is lecturer of course containing activity or admin
        if (requestorRole === 'LECTURER') {
            const activity = await prisma.learningActivity.findUnique({
                where: { id: activityId },
                include: { course: { select: { lecturerId: true } } }
            });

            if (activity?.course.lecturerId !== requestorId) {
                throw new ValidationException(
                    'Only the course instructor can view activity grades',
                    'UNAUTHORIZED_ACTIVITY_ACCESS'
                );
            }
        }

        return gradesRepository.findGradesByActivity(activityId, pagination);
    }

    /**
     * Get grades with filters
     */
    async getGradesFiltered(filters, pagination, requestorId, requestorRole) {
        // Admins only
        if (requestorRole !== 'ADMIN') {
            throw new ValidationException(
                'Only admins can filter all grades',
                'ADMIN_REQUIRED'
            );
        }

        return gradesRepository.findGradesWithFilters(filters, pagination);
    }

    /**
     * Create single grade
     */
    async createGrade(data, lecturerId, isAdmin = false) {
        // Verify course/activity exists and user is authorized
        if (data.courseId) {
            const course = await prisma.course.findUnique({
                where: { id: data.courseId }
            });

            if (!course) {
                throw new ValidationException('Course not found', 'COURSE_NOT_FOUND');
            }

            if (!isAdmin && course.lecturerId !== lecturerId) {
                const error = new Error('Only the course instructor can grade');
                error.statusCode = 403;
                throw error;
            }

            // Check for existing grade
            const existing = await gradesRepository.findGradeByUserAndCourse(
                data.userId,
                data.courseId
            );

            if (existing) {
                throw new ValidationException(
                    'Grade already exists for this user and course',
                    'GRADE_EXISTS'
                );
            }
        }

        if (data.activityId) {
            const activity = await prisma.learningActivity.findUnique({
                where: { id: data.activityId },
                include: { course: { select: { lecturerId: true } } }
            });

            if (!activity) {
                throw new ValidationException('Activity not found', 'ACTIVITY_NOT_FOUND');
            }

            if (!isAdmin && activity.course.lecturerId !== lecturerId) {
                const error = new Error('Only the course instructor can grade');
                error.statusCode = 403;
                throw error;
            }

            // Check for existing grade
            const existing = await gradesRepository.findGradeByUserAndActivity(
                data.userId,
                data.activityId
            );

            if (existing) {
                throw new ValidationException(
                    'Grade already exists for this user and activity',
                    'GRADE_EXISTS'
                );
            }
        }

        // Validate percentage calculation
        if (data.scorePoints > data.totalPoints) {
            throw new ValidationException(
                'Score cannot exceed total points',
                'INVALID_SCORE'
            );
        }

        // Ensure percentage matches score/total
        const calculatedPercentage = (data.scorePoints / data.totalPoints) * 100;
        if (Math.abs(data.percentage - calculatedPercentage) > 0.01) {
            throw new ValidationException(
                'Percentage does not match score calculation',
                'INVALID_PERCENTAGE'
            );
        }

        return gradesRepository.createGrade(data);
    }

    /**
     * Create grades in bulk
     */
    async createBulkGrades(courseId, activityId, grades, lecturerId, isAdmin = false) {
        // Verify authorization
        if (courseId) {
            const course = await prisma.course.findUnique({
                where: { id: courseId }
            });

            if (!course || (!isAdmin && course.lecturerId !== lecturerId)) {
                const error = new Error('Unauthorized to grade this course');
                error.statusCode = 403;
                throw error;
            }
        }

        if (activityId) {
            const activity = await prisma.learningActivity.findUnique({
                where: { id: activityId },
                include: { course: { select: { lecturerId: true } } }
            });

            if (!activity || (!isAdmin && activity.course.lecturerId !== lecturerId)) {
                const error = new Error('Unauthorized to grade this activity');
                error.statusCode = 403;
                throw error;
            }
        }

        // Prepare grades with course/activity ID
        const gradeData = grades.map(g => ({
            ...g,
            courseId,
            activityId
        }));

        // Validate all grades before creating
        gradeData.forEach(g => {
            if (g.scorePoints > g.totalPoints) {
                throw new ValidationException(
                    `Invalid score for user ${g.userId}`,
                    'INVALID_SCORE'
                );
            }

            const calculatedPercentage = (g.scorePoints / g.totalPoints) * 100;
            if (Math.abs(g.percentage - calculatedPercentage) > 0.01) {
                throw new ValidationException(
                    `Invalid percentage for user ${g.userId}`,
                    'INVALID_PERCENTAGE'
                );
            }
        });

        return gradesRepository.createBulkGrades(gradeData);
    }

    /**
     * Update grade
     */
    async updateGrade(id, data, lecturerId, isAdmin = false) {
        const grade = await this.getGradeById(id);

        // Verify authorization
        if (grade.courseId) {
            const course = await prisma.course.findUnique({
                where: { id: grade.courseId }
            });

            if (!isAdmin && course?.lecturerId !== lecturerId) {
                const error = new Error('Only the grader can update this grade');
                error.statusCode = 403;
                throw error;
            }
        }

        if (grade.activityId) {
            const activity = await prisma.learningActivity.findUnique({
                where: { id: grade.activityId },
                include: { course: { select: { lecturerId: true } } }
            });

            if (!isAdmin && activity?.course.lecturerId !== lecturerId) {
                const error = new Error('Only the grader can update this grade');
                error.statusCode = 403;
                throw error;
            }
        }

        // If already published, don't allow certain updates
        if (grade.isPublished && data.scorePoints !== undefined) {
            throw new ValidationException(
                'Cannot update published grades',
                'GRADE_PUBLISHED'
            );
        }

        // Validate score if updating
        if (data.scorePoints !== undefined || data.totalPoints !== undefined) {
            const scores = data.scorePoints ?? grade.scorePoints;
            const total = data.totalPoints ?? grade.totalPoints;

            if (scores > total) {
                throw new ValidationException(
                    'Score cannot exceed total points',
                    'INVALID_SCORE'
                );
            }

            if (data.percentage === undefined) {
                data.percentage = (scores / total) * 100;
            }
        }

        return gradesRepository.updateGrade(id, data);
    }

    /**
     * Publish grade(s) for student visibility
     */
    async publishGrades(ids, lecturerId, publicationDate = null) {
        // Verify all grades are authorized for this lecturer
        const grades = await prisma.grade.findMany({
            where: { id: { in: ids } }
        });

        for (const grade of grades) {
            if (grade.courseId) {
                const course = await prisma.course.findUnique({
                    where: { id: grade.courseId }
                });

                if (course?.lecturerId !== lecturerId) {
                    throw new ValidationException(
                        'Cannot publish unauthorized grades',
                        'UNAUTHORIZED_PUBLISH'
                    );
                }
            }

            if (grade.activityId) {
                const activity = await prisma.learningActivity.findUnique({
                    where: { id: grade.activityId },
                    include: { course: { select: { lecturerId: true } } }
                });

                if (activity?.course.lecturerId !== lecturerId) {
                    throw new ValidationException(
                        'Cannot publish unauthorized grades',
                        'UNAUTHORIZED_PUBLISH'
                    );
                }
            }
        }

        return gradesRepository.publishGrades(ids, publicationDate);
    }

    /**
     * Unpublish grade(s)
     */
    async unpublishGrades(ids, lecturerId) {
        // Verify authorization (same as publish)
        const grades = await prisma.grade.findMany({
            where: { id: { in: ids } }
        });

        for (const grade of grades) {
            if (grade.courseId) {
                const course = await prisma.course.findUnique({
                    where: { id: grade.courseId }
                });

                if (course?.lecturerId !== lecturerId) {
                    throw new ValidationException(
                        'Cannot unpublish unauthorized grades',
                        'UNAUTHORIZED_UNPUBLISH'
                    );
                }
            }

            if (grade.activityId) {
                const activity = await prisma.learningActivity.findUnique({
                    where: { id: grade.activityId },
                    include: { course: { select: { lecturerId: true } } }
                });

                if (activity?.course.lecturerId !== lecturerId) {
                    throw new ValidationException(
                        'Cannot unpublish unauthorized grades',
                        'UNAUTHORIZED_UNPUBLISH'
                    );
                }
            }
        }

        return gradesRepository.unpublishGrades(ids);
    }

    /**
     * Delete grade
     */
    async deleteGrade(id, lecturerId, isAdmin = false) {
        const grade = await this.getGradeById(id);

        // Verify authorization
        if (grade.courseId) {
            const course = await prisma.course.findUnique({
                where: { id: grade.courseId }
            });

            if (!isAdmin && course?.lecturerId !== lecturerId) {
                const error = new Error('Only the grader can delete this grade');
                error.statusCode = 403;
                throw error;
            }
        }

        if (grade.activityId) {
            const activity = await prisma.learningActivity.findUnique({
                where: { id: grade.activityId },
                include: { course: { select: { lecturerId: true } } }
            });

            if (activity?.course.lecturerId !== lecturerId) {
                throw new ValidationException(
                    'Only the grader can delete this grade',
                    'UNAUTHORIZED_DELETE'
                );
            }
        }

        return gradesRepository.deleteGrade(id);
    }

    /**
     * Get grade statistics for course
     */
    async getCourseGradeStatistics(courseId, lecturerId, isAdmin = false) {
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            throw new ValidationException('Course not found', 'COURSE_NOT_FOUND');
        }

        // Allow if lecturer owns course or user is admin
        if (course.lecturerId !== lecturerId && !isAdmin) {
            throw new ValidationException(
                'Unauthorized to view course statistics',
                'UNAUTHORIZED_ACCESS'
            );
        }

        return gradesRepository.getCourseGradeStats(courseId);
    }

    /**
     * Get grade statistics for activity
     */
    async getActivityGradeStatistics(activityId, lecturerId, isAdmin = false) {
        const activity = await prisma.learningActivity.findUnique({
            where: { id: activityId },
            include: { course: { select: { lecturerId: true } } }
        });

        if (!activity) {
            throw new ValidationException('Activity not found', 'ACTIVITY_NOT_FOUND');
        }

        // Allow if lecturer owns course or user is admin
        if (activity.course.lecturerId !== lecturerId && !isAdmin) {
            throw new ValidationException(
                'Unauthorized to view activity statistics',
                'UNAUTHORIZED_ACCESS'
            );
        }

        return gradesRepository.getActivityGradeStats(activityId);
    }

    /**
     * Get unpublished grades for review
     */
    async getUnpublishedGrades(courseId, pagination, lecturerId) {
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course || course.lecturerId !== lecturerId) {
            throw new ValidationException(
                'Unauthorized to view unpublished grades',
                'UNAUTHORIZED_ACCESS'
            );
        }

        return gradesRepository.getUnpublishedGrades(courseId, pagination);
    }

    // ============================================
    // GRADING RUBRIC OPERATIONS
    // ============================================

    /**
     * Get rubric by ID
     */
    async getRubricById(id) {
        const rubric = await gradesRepository.findRubricById(id);

        if (!rubric) {
            throw new ValidationException('Rubric not found', 'RUBRIC_NOT_FOUND');
        }

        return rubric;
    }

    /**
     * Get all rubrics
     */
    async getAllRubrics(pagination) {
        return gradesRepository.findAllRubrics(pagination);
    }

    /**
     * Create rubric (Admin/Lecturer)
     */
    async createRubric(data, requestorRole) {
        if (!['ADMIN', 'LECTURER'].includes(requestorRole)) {
            throw new ValidationException(
                'Only admins and lecturers can create rubrics',
                'UNAUTHORIZED'
            );
        }

        // Validate criteria JSON
        if (data.criteria && typeof data.criteria !== 'object') {
            throw new ValidationException(
                'Criteria must be a valid JSON object',
                'INVALID_CRITERIA'
            );
        }

        return gradesRepository.createRubric(data);
    }

    /**
     * Update rubric
     */
    async updateRubric(id, data, requestorRole) {
        if (!['ADMIN', 'LECTURER'].includes(requestorRole)) {
            throw new ValidationException(
                'Only admins and lecturers can update rubrics',
                'UNAUTHORIZED'
            );
        }

        const rubric = await this.getRubricById(id);

        // Validate criteria if updating
        if (data.criteria && typeof data.criteria !== 'object') {
            throw new ValidationException(
                'Criteria must be a valid JSON object',
                'INVALID_CRITERIA'
            );
        }

        return gradesRepository.updateRubric(id, data);
    }

    /**
     * Delete rubric
     */
    async deleteRubric(id, requestorRole) {
        if (!['ADMIN', 'LECTURER'].includes(requestorRole)) {
            throw new ValidationException(
                'Only admins and lecturers can delete rubrics',
                'UNAUTHORIZED'
            );
        }

        const rubric = await this.getRubricById(id);
        return gradesRepository.deleteRubric(id);
    }
}

module.exports = new GradesService();
