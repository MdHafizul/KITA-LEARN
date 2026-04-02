const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Mock data generators
const faker = {
    name: () => ['Ahmed', 'Fatima', 'Hassan', 'Leila', 'Ibrahim', 'Noor', 'Amina', 'Karim'][Math.floor(Math.random() * 8)],
    surname: () => ['Al-Rashid', 'Al-Noor', 'Hassan', 'Ahmed', 'Malik', 'Khan', 'Ali', 'Omar'][Math.floor(Math.random() * 8)],
    phone: () => `+60${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`,
    courseTitle: () => ['Introduction to JavaScript', 'Web Development Fundamentals', 'Advanced React Patterns', 'Database Design with PostgreSQL', 'RESTful API Development', 'Cloud Architecture AWS', 'DevOps & Docker Essentials', 'Microservices in Production'][Math.floor(Math.random() * 8)]
};

async function main() {
    console.log('🌱 Starting comprehensive database seeding...\n');

    try {
        // 1. CREATE ROLES
        console.log('📋 Creating roles...');
        const adminRole = await prisma.role.upsert({
            where: { name: 'admin' },
            update: {},
            create: { name: 'admin', description: 'System administrator' }
        });

        const lecturerRole = await prisma.role.upsert({
            where: { name: 'lecturer' },
            update: {},
            create: { name: 'lecturer', description: 'Course instructor' }
        });

        const studentRole = await prisma.role.upsert({
            where: { name: 'student' },
            update: {},
            create: { name: 'student', description: 'Student learner' }
        });
        console.log('✅ 3 roles created\n');

        // 2. CREATE USERS
        console.log('👥 Creating users...');

        const adminUser = await prisma.user.upsert({
            where: { email: 'admin@lms.test' },
            update: {},
            create: {
                email: 'admin@lms.test',
                password: await bcrypt.hash('admin123456', 10),
                fullName: 'Admin User',
                phoneNumber: '+60100000001',
                isActive: true,
                roles: {
                    create: { roleId: adminRole.id }
                }
            },
            include: { roles: true }
        });

        // Create 3 lecturers
        const lecturers = [];
        for (let i = 1; i <= 3; i++) {
            const lecturer = await prisma.user.upsert({
                where: { email: `lecturer${i}@lms.test` },
                update: {},
                create: {
                    email: `lecturer${i}@lms.test`,
                    password: await bcrypt.hash('lecturer123456', 10),
                    fullName: `${faker.name()} ${faker.surname()}`,
                    phoneNumber: faker.phone(),
                    isActive: true,
                    roles: {
                        create: { roleId: lecturerRole.id }
                    }
                },
                include: { roles: true }
            });
            lecturers.push(lecturer);
        }

        // Create 10 students
        const students = [];
        for (let i = 1; i <= 10; i++) {
            const student = await prisma.user.upsert({
                where: { email: `student${i}@lms.test` },
                update: {},
                create: {
                    email: `student${i}@lms.test`,
                    password: await bcrypt.hash('student123456', 10),
                    fullName: `${faker.name()} ${faker.surname()}`,
                    phoneNumber: faker.phone(),
                    isActive: true,
                    roles: {
                        create: { roleId: studentRole.id }
                    }
                },
                include: { roles: true }
            });
            students.push(student);
        }
        console.log(`✅ Created: 1 admin, ${lecturers.length} lecturers, ${students.length} students\n`);

        // 3. CREATE LECTURER PROFILES
        console.log('🏫 Creating lecturer profiles...');
        const lecturerProfiles = [];
        for (let idx = 0; idx < lecturers.length; idx++) {
            const lecturer = lecturers[idx];
            const profile = await prisma.lecturerProfile.upsert({
                where: { userId: lecturer.id },
                update: {},
                create: {
                    userId: lecturer.id,
                    departmentName: ['Computer Science', 'Engineering', 'Business'][idx % 3],
                    qualifications: 'Master\'s Degree in Computer Science',
                    yearsOfExperience: Math.floor(Math.random() * 15) + 1,
                    officeLocation: `Building A, Room ${Math.floor(Math.random() * 100) + 100}`,
                    officePhone: '+1-555-0147'
                }
            });
            lecturerProfiles.push(profile);
        }
        console.log(`✅ ${lecturers.length} lecturer profiles created\n`);

        // 4. CREATE COURSES
        console.log('📚 Creating courses...');
        const courses = [];
        for (let i = 0; i < 5; i++) {
            const startDate = new Date();
            const endDate = new Date(startDate.getTime() + 12 * 7 * 24 * 60 * 60 * 1000); // 12 weeks later

            const course = await prisma.course.create({
                data: {
                    title: faker.courseTitle(),
                    description: `In-depth exploration of ${faker.courseTitle().toLowerCase()}. This course covers fundamental concepts, best practices, and real-world applications.`,
                    lecturerId: lecturerProfiles[i % lecturerProfiles.length].id,
                    creditHours: (i % 4) + 2,
                    maxStudents: 30,
                    difficultyLevel: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'][i % 3],
                    status: 'PUBLISHED',
                    startDate: startDate,
                    endDate: endDate
                }
            });
            courses.push(course);
        }
        console.log(`✅ ${courses.length} courses created\n`);

        // 5. CREATE ENROLLMENTS
        console.log('📝 Creating enrollments...');
        const enrollments = [];
        for (const course of courses) {
            const numStudents = Math.floor(Math.random() * 8) + 3; // 3-10 students per course
            const selectedStudents = students.slice(0, numStudents);

            for (const student of selectedStudents) {
                const enrollment = await prisma.enrollment.create({
                    data: {
                        userId: student.id,
                        courseId: course.id,
                        enrollmentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                        status: ['ACTIVE', 'ACTIVE', 'ACTIVE', 'COMPLETED', 'DROPPED'][Math.floor(Math.random() * 5)],
                        progressPercent: Math.floor(Math.random() * 100),
                        completionDate: Math.random() > 0.5 ? new Date() : null
                    }
                });
                enrollments.push(enrollment);
            }
        }
        console.log(`✅ ${enrollments.length} enrollments created\n`);

        // 6. CREATE COURSE MATERIALS
        console.log('📖 Creating course materials...');
        let materialCount = 0;
        for (const course of courses) {
            const numMaterials = Math.floor(Math.random() * 5) + 2;
            for (let i = 0; i < numMaterials; i++) {
                await prisma.courseMaterial.create({
                    data: {
                        courseId: course.id,
                        title: `${faker.courseTitle()} - Module ${i + 1}`,
                        description: 'Important course material for learning',
                        materialType: ['PDF', 'VIDEO', 'LINK', 'DOCUMENT'][i % 4],
                        url: `/materials/course-${course.id}/module-${i + 1}.pdf`,
                        fileSize: Math.floor(Math.random() * 50000) + 1000,
                        displayOrder: i,
                        isDownloadable: true
                    }
                });
                materialCount++;
            }
        }
        console.log(`✅ ${materialCount} course materials created\n`);

        // 7. CREATE LEARNING ACTIVITIES & EXAMS
        console.log('🧪 Creating learning activities and exams...');
        const exams = [];
        for (const course of courses) {
            const numActivities = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < numActivities; i++) {
                // Create a learning activity for exam
                const activity = await prisma.learningActivity.create({
                    data: {
                        courseId: course.id,
                        title: `Assessment ${i + 1}`,
                        description: `Assessment for ${course.title}`,
                        activityType: 'EXAM',
                        displayOrder: i,
                        durationMinutes: 60,
                        maxAttempts: 3,
                        passingScore: 50,
                        isPublished: true,
                        points: 100
                    }
                });

                // Create exam linked to activity
                const exam = await prisma.exam.create({
                    data: {
                        activityId: activity.id,
                        examType: 'QUIZ',
                        totalQuestions: Math.floor(Math.random() * 20) + 5,
                        timeLimit: 60,
                        passingScore: 50,
                        showResults: true,
                        shuffleQuestions: true,
                        allowReview: true,
                        totalAttempts: 3
                    }
                });
                exams.push({ exam, activity, course });

                // Create questions for exam
                const numQuestions = exam.totalQuestions;
                for (let q = 0; q < numQuestions; q++) {
                    await prisma.examQuestion.create({
                        data: {
                            examId: exam.id,
                            questionText: `What is the answer to question ${q + 1}?`,
                            questionType: 'MULTIPLE_CHOICE',
                            difficulty: ['EASY', 'MEDIUM', 'HARD'][Math.floor(Math.random() * 3)],
                            points: Math.ceil(100 / numQuestions),
                            correctAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
                            explanation: 'Detailed explanation for this question.',
                            displayOrder: q
                        }
                    });
                }
            }
        }
        console.log(`✅ ${exams.length} exams with questions created\n`);

        // 8. CREATE EXAM ATTEMPTS (simplified)
        console.log('📊 Creating exam attempts...');
        let attemptCount = 0;
        for (const { exam, course } of exams) {
            // Each enrolled student in the course attempts the exam
            const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
            for (const enrollment of courseEnrollments.slice(0, Math.min(3, courseEnrollments.length))) {
                const score = Math.floor(Math.random() * 100);
                await prisma.examAttempt.create({
                    data: {
                        examId: exam.id,
                        userId: enrollment.userId,
                        startedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
                        submittedAt: new Date(),
                        totalTimeSpent: Math.floor(Math.random() * 3600) + 600,
                        score,
                        percentage: score,
                        isPassed: score >= exam.passingScore
                    }
                });
                attemptCount++;
            }
        }
        console.log(`✅ ${attemptCount} exam attempts created\n`);

        // 9. CREATE ANNOUNCEMENTS
        console.log('📢 Creating announcements...');
        let announcementCount = 0;
        for (const course of courses) {
            const numAnnouncements = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < numAnnouncements; i++) {
                const announcement = await prisma.announcement.create({
                    data: {
                        courseId: course.id,
                        title: `Important: Update for Week ${i + 1}`,
                        content: 'Please review the latest course materials and submit your assignments on time.',
                        priority: ['LOW', 'NORMAL', 'HIGH'][Math.floor(Math.random() * 3)],
                        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                        expiresAt: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000)
                    }
                });

                // Create announcement recipients
                for (const enrollment of enrollments.filter(e => e.courseId === course.id)) {
                    await prisma.announcementRecipient.create({
                        data: {
                            announcementId: announcement.id,
                            userId: enrollment.userId,
                            readAt: Math.random() > 0.5 ? new Date() : null
                        }
                    });
                }
                announcementCount++;
            }
        }
        console.log(`✅ ${announcementCount} announcements created\n`);

        // 10. CREATE STUDENT ACTIVITY TRACKING
        console.log('🎯 Creating student activity tracking...');
        let trackingCount = 0;
        for (const enrollment of enrollments) {
            const course = courses.find(c => c.id === enrollment.courseId);
            // Track activities for this enrollment
            const activities = await prisma.learningActivity.findMany({
                where: { courseId: course.id }
            });

            for (const activity of activities.slice(0, Math.min(2, activities.length))) {
                await prisma.studentActivityTracking.create({
                    data: {
                        userId: enrollment.userId,
                        activityId: activity.id,
                        viewCount: Math.floor(Math.random() * 10) + 1,
                        lastViewedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                        completionStatus: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'][Math.floor(Math.random() * 3)],
                        timeSpentMinutes: Math.floor(Math.random() * 300) + 30
                    }
                });
                trackingCount++;
            }
        }
        console.log(`✅ ${trackingCount} activity tracking records created\n`);

        // 11. CREATE CERTIFICATES
        console.log('🎓 Creating certificates...');
        let certCount = 0;
        const completedEnrollments = enrollments.filter(e => e.status === 'COMPLETED');
        for (const enrollment of completedEnrollments) {
            await prisma.certificate.create({
                data: {
                    userId: enrollment.userId,
                    courseId: enrollment.courseId,
                    certificateNumber: `CERT-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
                    issuedDate: new Date(),
                    verificationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
                    issuerName: 'KitaLearn LMS',
                    isVerified: true
                }
            });
            certCount++;
        }
        console.log(`✅ ${certCount} certificates created\n`);

        // 12. CREATE GRADES
        console.log('📊 Creating grades...');
        let gradeCount = 0;
        for (const enrollment of enrollments) {
            if (enrollment.status === 'COMPLETED' || enrollment.status === 'ACTIVE') {
                const score = Math.floor(Math.random() * 100) + 40;
                const gradeValue = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

                await prisma.grade.create({
                    data: {
                        userId: enrollment.userId,
                        courseId: enrollment.courseId,
                        scorePoints: score,
                        totalPoints: 100,
                        percentage: score,
                        gradeValue,
                        feedback: 'Good effort! Keep working hard.',
                        isPublished: true,
                        publishedAt: new Date()
                    }
                });
                gradeCount++;
            }
        }
        console.log(`✅ ${gradeCount} grades created\n`);

        // 13. CREATE AUDIT LOGS
        console.log('📝 Creating audit logs...');
        const auditActions = ['LOGIN', 'CREATE', 'UPDATE', 'DELETE'];
        let auditCount = 0;
        for (let i = 0; i < 30; i++) {
            const allUsers = [adminUser, ...lecturers, ...students];
            const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
            const randomCourse = courses[Math.floor(Math.random() * courses.length)];

            await prisma.auditLog.create({
                data: {
                    userId: randomUser.id,
                    action: auditActions[Math.floor(Math.random() * auditActions.length)],
                    entity: 'Course',
                    entityId: randomCourse.id,
                    changes: JSON.stringify({
                        field: 'status',
                        oldValue: 'DRAFT',
                        newValue: 'PUBLISHED'
                    }),
                    ipAddress: `192.168.1.${Math.floor(Math.random() * 256)}`,
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            });
            auditCount++;
        }
        console.log(`✅ ${auditCount} audit logs created\n`);

        console.log('✅✅✅ Database seeding completed successfully! ✅✅✅\n');
        console.log('📊 Summary:');
        console.log(`   - Roles: 3`);
        console.log(`   - Users: ${lecturers.length + students.length + 1}`);
        console.log(`   - Courses: ${courses.length}`);
        console.log(`   - Enrollments: ${enrollments.length}`);
        console.log(`   - Exams: ${exams.length}`);
        console.log(`   - Announcements: ${announcementCount}`);
        console.log(`   - Certificates: ${certCount}`);
        console.log(`   - Grades: ${gradeCount}`);
        console.log(`   - Audit Logs: ${auditCount}\n`);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
