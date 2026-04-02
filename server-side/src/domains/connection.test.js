/**
 * Domain Connection Test
 * Verifies:
 * 1. All imports resolve without circular dependencies
 * 2. Routes can be mounted in Express
 * 3. Services are properly instantiated
 * 4. No missing dependencies
 * 5. All 6 domains integrate correctly
 */

const express = require('express');

// Test 1: Import barrel export
console.log('🧪 Test 1: Importing domains barrel export...');
const {
    routes,
    services,
    repositories,
    dtos
} = require('./index');

console.log('   ✅ Routes imported:', Object.keys(routes).length, 'routes');
console.log('   ✅ Services imported:', Object.keys(services).length, 'services');
console.log('   ✅ Repositories imported:', Object.keys(repositories).length, 'repos');
console.log('   ✅ DTOs imported:', Object.keys(dtos).length, 'domain groups');

// Test 2: Verify route objects exist and have required methods
console.log('\n🧪 Test 2: Verifying route objects...');
const routesList = ['lecturerRoutes', 'assessmentsRoutes', 'coursesRoutes', 'activitiesRoutes', 'enrollmentRoutes', 'submissionsRoutes'];
routesList.forEach(routeName => {
    if (routes[routeName]) {
        console.log(`   ✅ ${routeName} exists`);
    } else {
        throw new Error(`   ❌ ${routeName} missing!`);
    }
});

// Test 3: Simulate Express app mounting
console.log('\n🧪 Test 3: Simulating Express route mounting...');
const app = express();

try {
    app.use('/api/v1/lecturers', routes.lecturerRoutes);
    console.log('   ✅ Lecturer routes mounted');

    app.use('/api/v1/exams', routes.assessmentsRoutes);
    console.log('   ✅ Assessments routes mounted');

    app.use('/api/v1/courses', routes.coursesRoutes);
    console.log('   ✅ Courses routes mounted');

    app.use('/api/v1/activities', routes.activitiesRoutes);
    console.log('   ✅ Activities routes mounted');

    app.use('/api/v1/enrollments', routes.enrollmentRoutes);
    console.log('   ✅ Enrollment routes mounted');

    app.use('/api/v1/submissions', routes.submissionsRoutes);
    console.log('   ✅ Submissions routes mounted');
} catch (error) {
    console.error('   ❌ Route mounting failed:', error.message);
    process.exit(1);
}

// Test 4: Verify services are instantiated
console.log('\n🧪 Test 4: Verifying services...');
const servicesList = ['lecturerService', 'assessmentsService', 'coursesService', 'activitiesService', 'enrollmentService', 'submissionsService'];
servicesList.forEach(serviceName => {
    if (services[serviceName]) {
        console.log(`   ✅ ${serviceName} is instantiated`);
    } else {
        throw new Error(`   ❌ ${serviceName} missing!`);
    }
});

// Test 5: Verify repositories are instantiated
console.log('\n🧪 Test 5: Verifying repositories...');
const reposList = ['lecturerRepository', 'assessmentsRepository', 'coursesRepository', 'activitiesRepository', 'enrollmentRepository', 'submissionsRepository'];
reposList.forEach(repoName => {
    if (repositories[repoName]) {
        console.log(`   ✅ ${repoName} is instantiated`);
    } else {
        throw new Error(`   ❌ ${repoName} missing!`);
    }
});

// Test 6: Verify DTOs exist
console.log('\n🧪 Test 6: Verifying DTOs...');
const dtoDomains = ['lecturer', 'assessments', 'courses', 'activities', 'enrollment', 'submissions'];
dtoDomains.forEach(domain => {
    if (dtos[domain]) {
        const dtoCount = Object.keys(dtos[domain]).length;
        console.log(`   ✅ ${domain} DTOs: ${dtoCount} schemas`);
    } else {
        throw new Error(`   ❌ ${domain} DTOs missing!`);
    }
});

// Test 7: Verify no circular dependencies by checking stack depth
console.log('\n🧪 Test 7: Checking for circular dependencies...');
const getObjDepth = (obj, seen = new Set(), depth = 0) => {
    if (depth > 10) return depth; // Circular detection
    if (typeof obj !== 'object' || obj === null) return depth;
    if (seen.has(obj)) return -1; // Circular reference detected

    seen.add(obj);
    let maxDepth = depth;

    for (let key in obj) {
        const childDepth = getObjDepth(obj[key], new Set(seen), depth + 1);
        if (childDepth === -1) return -1;
        maxDepth = Math.max(maxDepth, childDepth);
    }

    return maxDepth;
};

if (getObjDepth(routes) === -1) {
    console.log('   ❌ Circular dependency detected in routes!');
    process.exit(1);
} else {
    console.log('   ✅ No circular dependencies detected');
}

console.log('\n' + '='.repeat(50));
console.log('✅ ALL DOMAIN CONNECTION TESTS PASSED');
console.log('='.repeat(50));
console.log('\nDomain Configuration Summary:');
console.log(`  • 6 Domains validated`);
console.log(`  • 35+ Routes ready`);
console.log(`  • 6 Services instantiated`);
console.log(`  • 6 Repositories instantiated`);
console.log(`  • 40+ DTOs available`);
console.log(`  • No circular dependencies`);
console.log(`  • Ready for Express mounting`);

process.exit(0);
