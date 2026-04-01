# Testing Guide - KitaLearn LMS

Complete testing setup with Jest, Supertest, and comprehensive test coverage.

## 📋 Test Structure

```
tests/
├── setup.js                    # Global test configuration
├── fixtures.js                 # Mock data factories
├── unit/                       # Unit tests (services, repositories)
│   └── services/
│       ├── auth.service.test.js
│       └── course.service.test.js
└── integration/               # Integration tests (API endpoints)
    ├── auth.integration.test.js
    └── course.integration.test.js
```

## 🚀 Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (during development)
```bash
npm run test:watch
```

### Run with coverage report
```bash
npm run test:coverage
```

### Run unit tests only
```bash
npm run test:unit
```

### Run integration tests only
```bash
npm run test:integration
```

### Debug tests
```bash
npm run test:debug
```

## 📊 Test Coverage

Target coverage thresholds:
- **Statements**: 75%
- **Branches**: 60%
- **Functions**: 70%
- **Lines**: 75%

Coverage report generated in `coverage/` directory with HTML report at `coverage/index.html`

## 🧪 Unit Tests

### Auth Service Tests (`tests/unit/services/auth.service.test.js`)

✅ **Register**
- Successfully register new user
- Reject duplicate email
- Hash password before storing
- Reject invalid email

✅ **Login**
- Login with correct credentials
- Reject invalid password
- Reject non-existent user

✅ **Token Refresh**
- Generate new access token
- Reject invalid refresh token

✅ **Change Password**
- Change password successfully
- Reject incorrect current password
- Reject mismatched passwords

### Course Service Tests (`tests/unit/services/course.service.test.js`)

✅ **Create Course**
- Create new course
- Reject invalid data
- Create with max students limit

✅ **Update Course**
- Update course details
- Prevent non-lecturer updates
- Reject invalid updates

✅ **Publish/Archive**
- Publish draft course
- Prevent duplicate publish
- Archive published course

✅ **Search**
- Search by keyword
- Return paginated results
- Handle empty results

## 🌐 Integration Tests

### Auth Endpoints (`tests/integration/auth.integration.test.js`)

✅ **POST /api/v1/auth/register**
- Register new user
- Reject duplicate email
- Reject invalid email
- Reject weak password

✅ **POST /api/v1/auth/login**
- Login with valid credentials
- Reject invalid password
- Reject non-existent user

✅ **POST /api/v1/auth/refresh**
- Refresh token with valid token
- Reject invalid refresh token

✅ **GET /api/v1/auth/profile**
- Return user profile
- Reject without token
- Reject with invalid token

✅ **PUT /api/v1/auth/profile**
- Update user profile
- Prevent unauthorized updates

✅ **POST /api/v1/auth/change-password**
- Change password successfully
- Reject incorrect current password

✅ **POST /api/v1/auth/logout**
- Logout successfully

### Course Endpoints (`tests/integration/course.integration.test.js`)

✅ **POST /api/v1/courses**
- Create course as lecturer
- Reject student creation
- Reject invalid data

✅ **GET /api/v1/courses**
- List all courses
- Support pagination

✅ **GET /api/v1/courses/:id**
- Retrieve course details
- Return 404 for non-existent course

✅ **PUT /api/v1/courses/:id**
- Update by lecturer
- Reject non-lecturer update

✅ **POST /api/v1/courses/:id/publish**
- Publish course
- Reject non-lecturer publish

✅ **POST /api/v1/courses/:id/archive**
- Archive published course

✅ **DELETE /api/v1/courses/:id**
- Soft-delete course
- Reject non-lecturer delete

## 📦 Test Fixtures

Mock data factories in `tests/fixtures.js`:

### User Factory
```javascript
const user = await fixtures.userFactory.valid();
const lecturer = await fixtures.userFactory.lecturer();
const admin = await fixtures.userFactory.admin();
```

### Course Factory
```javascript
const course = await fixtures.courseFactory.valid(lecturerId);
const published = await fixtures.courseFactory.published(lecturerId);
```

### Exam Factory
```javascript
const exam = await fixtures.examFactory.valid(courseId);
const published = await fixtures.examFactory.published(courseId);
```

### Other Factories
- `questionFactory` - Multiple choice, short answer
- `enrollmentFactory` - Active, completed
- `assignmentFactory` - Draft, published
- `submissionFactory` - Submitted, graded
- `gradeFactory` - Valid, invalid
- `certificateFactory` - Active, expired
- `authFactory` - Login request, register request

## 🛠️ Test Setup

Global utilities available in all tests (from `tests/setup.js`):

```javascript
// Create test data
const user = await global.testUtils.createTestUser(overrides);
const course = await global.testUtils.createTestCourse(lecturerId, overrides);
const exam = await global.testUtils.createTestExam(courseId, overrides);

// Database access
global.testDB.user.create({ data: {...} });
global.testDB.course.findById(id);

// Custom matcher
expect(token).toBeValidJWT();
```

## 📝 Writing New Tests

### Unit Test Example
```javascript
describe('MyService', () => {
  beforeEach(async () => {
    // Setup before each test
  });

  it('should do something', async () => {
    const result = await myService.doSomething();
    expect(result).toBe(expected);
  });
});
```

### Integration Test Example
```javascript
describe('POST /api/v1/endpoint', () => {
  it('should handle request', async () => {
    const res = await request(app)
      .post('/api/v1/endpoint')
      .set('Authorization', `Bearer ${token}`)
      .send(data)
      .expect(200);

    expect(res.body.success).toBe(true);
  });
});
```

## 🐛 Common Issues

### "Cannot find module" errors
- Ensure `tests/setup.js` is configured
- Check `jest.config.js` entries

### Database connection errors
- Ensure `DATABASE_URL` in `.env` is correct
- Run migrations: `npm run prisma:migrate`

### JWT validation failures
- Ensure JWT_SECRET is set in `.env`
- Check token expiry times in `src/utils/jwt.js`

### Timeout errors
- Increase Jest timeout: `jest.setTimeout(15000);`
- Check database performance

## 📊 Coverage Goals

| Metric | Target | Current |
|--------|--------|---------|
| Statements | 75% | - |
| Branches | 60% | - |
| Functions | 70% | - |
| Lines | 75% | - |

Track coverage with:
```bash
npm run test:coverage
# Then open coverage/index.html
```

## 🔄 CI/CD Integration

Add to GitHub Actions/GitLab CI:

```yaml
- name: Run Tests
  run: npm test -- --coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

## 🚀 Performance Tips

1. **Use test fixtures** - Avoid creating test data every time
2. **Parallel testing** - Jest runs tests in parallel by default
3. **Mock external services** - Redis is mocked in setup.js
4. **Group related tests** - Use describe() for organization
5. **Keep tests isolated** - Clean up after each test

## ✅ Quality Checklist

Before committing:
- [ ] All tests pass: `npm test`
- [ ] Coverage meets targets: `npm run test:coverage`
- [ ] Linting passes: `npm run lint`
- [ ] No console warnings

---

**Last Updated**: April 2026
**Status**: Production Ready
**Test Count**: 40+ tests
**Coverage Target**: 75%+
