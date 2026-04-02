/**
 * Test Fixtures & Mock Factories
 * Used to generate test data
 */

const { hash } = require('../src/utils/hash');

/**
 * User Factory
 */
exports.userFactory = {
    async valid(overrides = {}) {
        return {
            email: `user-${Math.random().toString(36).substring(7)}@test.com`,
            password: 'testPassword123',
            full_name: 'Test User',
            phone_number: '+1-000-000-0000',
            role: 'student',
            is_active: true,
            ...overrides,
        };
    },

    async lecturer(overrides = {}) {
        return this.valid({
            email: `lecturer-${Math.random().toString(36).substring(7)}@test.com`,
            role: 'lecturer',
            ...overrides,
        });
    },

    async admin(overrides = {}) {
        return this.valid({
            email: `admin-${Math.random().toString(36).substring(7)}@test.com`,
            role: 'admin',
            ...overrides,
        });
    },

    invalid() {
        return {
            email: 'invalid-email',
            password: '123',
            full_name: '',
        };
    },
};

/**
 * Course Factory
 */
exports.courseFactory = {
    async valid(lecturerId, overrides = {}) {
        return {
            title: `Test Course ${Math.random().toString(36).substring(7)}`,
            description: 'This is a test course for learning',
            lecturer_id: lecturerId,
            status: 'draft',
            max_students: 50,
            is_published: false,
            ...overrides,
        };
    },

    async published(lecturerId, overrides = {}) {
        return this.valid(lecturerId, {
            is_published: true,
            status: 'active',
            ...overrides,
        });
    },

    invalid() {
        return {
            title: '',
            description: null,
            lecturer_id: null,
        };
    },
};

/**
 * Exam Factory
 */
exports.examFactory = {
    async valid(courseId, overrides = {}) {
        return {
            course_id: courseId,
            title: `Test Exam ${Math.random().toString(36).substring(7)}`,
            description: 'This is a test exam',
            passing_score: 60,
            max_attempts: 3,
            duration_minutes: 60,
            shuffle_questions: false,
            is_published: false,
            ...overrides,
        };
    },

    async published(courseId, overrides = {}) {
        return this.valid(courseId, {
            is_published: true,
            ...overrides,
        });
    },

    invalid() {
        return {
            course_id: null,
            title: '',
            passing_score: 150,
        };
    },
};

/**
 * Question Factory
 */
exports.questionFactory = {
    async multipleChoice(examId, overrides = {}) {
        return {
            exam_id: examId,
            question_text: 'What is 2 + 2?',
            question_type: 'multiple_choice',
            points: 1,
            shuffle_options: true,
            options: [
                { text: '3', is_correct: false },
                { text: '4', is_correct: true },
                { text: '5', is_correct: false },
                { text: '6', is_correct: false },
            ],
            ...overrides,
        };
    },

    async shortAnswer(examId, overrides = {}) {
        return {
            exam_id: examId,
            question_text: 'What is the capital of France?',
            question_type: 'short_answer',
            points: 2,
            correct_answer: 'Paris',
            ...overrides,
        };
    },

    invalid() {
        return {
            exam_id: null,
            question_text: '',
            question_type: 'invalid',
        };
    },
};

/**
 * Enrollment Factory
 */
exports.enrollmentFactory = {
    async valid(courseId, studentId, overrides = {}) {
        return {
            course_id: courseId,
            student_id: studentId,
            enrollment_date: new Date(),
            status: 'active',
            progress_percentage: 0,
            ...overrides,
        };
    },

    async completed(courseId, studentId, overrides = {}) {
        return this.valid(courseId, studentId, {
            status: 'completed',
            progress_percentage: 100,
            completion_date: new Date(),
            ...overrides,
        });
    },

    invalid() {
        return {
            course_id: null,
            student_id: null,
            status: 'invalid',
        };
    },
};

/**
 * Assignment Factory
 */
exports.assignmentFactory = {
    async valid(courseId, overrides = {}) {
        return {
            course_id: courseId,
            title: `Test Assignment ${Math.random().toString(36).substring(7)}`,
            description: 'Submit your assignment here',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            max_points: 10,
            is_published: false,
            ...overrides,
        };
    },

    async published(courseId, overrides = {}) {
        return this.valid(courseId, {
            is_published: true,
            ...overrides,
        });
    },

    invalid() {
        return {
            course_id: null,
            title: '',
            due_date: 'invalid-date',
        };
    },
};

/**
 * Submission Factory
 */
exports.submissionFactory = {
    async valid(assignmentId, studentId, overrides = {}) {
        return {
            assignment_id: assignmentId,
            student_id: studentId,
            submission_text: 'This is my assignment submission',
            submission_date: new Date(),
            file_path: '/storage/submissions/file.pdf',
            status: 'submitted',
            ...overrides,
        };
    },

    async graded(assignmentId, studentId, overrides = {}) {
        return this.valid(assignmentId, studentId, {
            status: 'graded',
            points_earned: 8,
            feedback: 'Great work!',
            graded_date: new Date(),
            ...overrides,
        });
    },

    invalid() {
        return {
            assignment_id: null,
            student_id: null,
            submission_text: '',
        };
    },
};

/**
 * Grade Factory
 */
exports.gradeFactory = {
    async valid(courseId, studentId, overrides = {}) {
        return {
            course_id: courseId,
            student_id: studentId,
            total_points_earned: 85,
            total_points_possible: 100,
            percentage: 85,
            letter_grade: 'A',
            gpa_points: 4.0,
            ...overrides,
        };
    },

    invalid() {
        return {
            course_id: null,
            student_id: null,
            percentage: 150,
        };
    },
};

/**
 * Certificate Factory
 */
exports.certificateFactory = {
    async valid(enrollmentId, overrides = {}) {
        return {
            enrollment_id: enrollmentId,
            certificate_number: `CERT-${Math.random().toString(36).substring(7).toUpperCase()}`,
            issued_date: new Date(),
            expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            file_path: '/storage/certificates/cert.pdf',
            is_active: true,
            ...overrides,
        };
    },

    async expired(enrollmentId, overrides = {}) {
        return this.valid(enrollmentId, {
            expiry_date: new Date(Date.now() - 1),
            is_active: false,
            ...overrides,
        });
    },

    invalid() {
        return {
            enrollment_id: null,
            certificate_number: '',
            issued_date: 'invalid',
        };
    },
};

/**
 * Auth Factory
 */
exports.authFactory = {
    loginRequest(overrides = {}) {
        return {
            email: 'test@example.com',
            password: 'testPassword123',
            ...overrides,
        };
    },

    registerRequest(overrides = {}) {
        return {
            email: `user-${Math.random().toString(36).substring(7)}@test.com`,
            password: 'testPassword123',
            confirmPassword: 'testPassword123',
            full_name: 'Test User',
            phone_number: '+1-000-000-0000',
            ...overrides,
        };
    },

    invalidLoginRequest() {
        return {
            email: 'invalid-email',
            password: '123',
        };
    },
};
