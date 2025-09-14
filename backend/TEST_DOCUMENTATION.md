# LittleLibrary Integration Test Documentation

## Overview
This document describes the comprehensive integration test suite for the LittleLibrary backend API. The test suite covers all API endpoints, error handling, performance testing, and end-to-end workflows.

## Test Structure

### Test Classes
1. **AuthControllerIntegrationTest** - Authentication endpoints testing
2. **BookControllerIntegrationTest** - Book management endpoints testing
3. **FullWorkflowIntegrationTest** - Complete user workflow testing
4. **ErrorHandlingIntegrationTest** - Error scenarios and edge cases
5. **PerformanceIntegrationTest** - Performance and load testing
6. **IntegrationTestSuite** - Test suite runner

### Test Coverage

#### Authentication Endpoints
- ✅ `POST /api/auth/login` - User login
- ✅ `POST /api/auth/register` - User registration
- ✅ Invalid credentials handling
- ✅ Missing field validation

#### Book Management Endpoints
- ✅ `GET /api/books` - Get user library
- ✅ `GET /api/books?filter=favorites` - Filtered library access
- ✅ `GET /api/books?search=query` - Library search
- ✅ `POST /api/books/scan` - Book scanning (ISBN & cover)
- ✅ `POST /api/books/{id}/add-to-library` - Add book to library
- ✅ `POST /api/books/check-duplicate` - Duplicate checking
- ✅ `GET /api/books/{id}/recommendations` - AI recommendations
- ✅ `GET /api/books/search` - External book search

#### End-to-End Workflows
- ✅ Complete user registration and login flow
- ✅ Book scanning and identification workflow
- ✅ Library management workflow
- ✅ AI recommendation workflow
- ✅ Duplicate detection workflow

#### Error Handling
- ✅ Invalid JSON payload handling
- ✅ Empty request body handling
- ✅ Missing content type handling
- ✅ Invalid HTTP method handling
- ✅ Non-existent endpoint handling
- ✅ Large payload handling
- ✅ Special characters in input
- ✅ Null value handling
- ✅ Concurrent request handling

#### Performance Testing
- ✅ Authentication performance (< 5s for 10 requests)
- ✅ Book scanning performance (< 10s for 10 requests)
- ✅ Library access performance (< 3s for 20 requests)
- ✅ AI recommendations performance (< 15s for 5 requests)
- ✅ Concurrent user simulation

## Test Configuration

### Test Profile
- **Profile**: `test`
- **Database**: H2 in-memory database
- **External APIs**: Mocked for testing
- **Port**: Random available port

### Maven Configuration
- **Surefire Plugin**: Unit tests execution
- **Failsafe Plugin**: Integration tests execution
- **JaCoCo Plugin**: Code coverage reporting

## Running Tests

### Command Line Options

#### Run All Tests
```bash
./run-tests.sh
```

#### Run Unit Tests Only
```bash
./mvnw test -Dspring.profiles.active=test
```

#### Run Integration Tests Only
```bash
./mvnw verify -Dspring.profiles.active=test
```

#### Run Specific Test Class
```bash
./mvnw test -Dtest=AuthControllerIntegrationTest -Dspring.profiles.active=test
```

#### Run with Coverage Report
```bash
./mvnw clean test jacoco:report -Dspring.profiles.active=test
```

### Test Reports
- **Unit Test Reports**: `target/surefire-reports/`
- **Integration Test Reports**: `target/failsafe-reports/`
- **Coverage Reports**: `target/site/jacoco/index.html`

## Test Data

### Mock Data Used
- **Test User**: `test@example.com` / `password123`
- **Test Book**: Harry Potter and the Sorcerer's Stone (ISBN: 9780439708180)
- **Test Genres**: Fantasy, Adventure, Children's Literature
- **Test Age Ranges**: 8-12, 6-10, 10-14

### Test Scenarios Covered
1. **Happy Path**: All endpoints return 200 with valid data
2. **Error Scenarios**: Invalid inputs, missing data, malformed requests
3. **Edge Cases**: Large payloads, special characters, concurrent access
4. **Performance**: Response time validation under load
5. **Security**: Authentication and authorization testing

## Continuous Integration

### Automated Execution
Tests are configured to run automatically on:
- Code changes (via Maven lifecycle)
- Pull requests (via CI/CD pipeline)
- Scheduled builds (nightly)

### Quality Gates
- All tests must pass
- Code coverage > 80%
- Performance benchmarks met
- No critical security vulnerabilities

## Future Enhancements

### Planned Test Additions
- Database integration tests with real PostgreSQL
- External API integration tests with actual services
- Mobile app integration tests
- Load testing with JMeter
- Security penetration testing

### Test Automation Improvements
- Parallel test execution
- Test data management
- Dynamic test environment provisioning
- Advanced reporting and analytics

## Troubleshooting

### Common Issues
1. **Port conflicts**: Tests use random ports to avoid conflicts
2. **Database issues**: H2 in-memory database is reset for each test
3. **External API failures**: All external APIs are mocked in tests
4. **Timing issues**: Performance tests have reasonable thresholds

### Debug Options
```bash
# Run tests with debug logging
./mvnw test -Dspring.profiles.active=test -Dlogging.level.com.littlelibrary=DEBUG

# Run single test with verbose output
./mvnw test -Dtest=BookControllerIntegrationTest#testScanBook_ISBN_Success -Dspring.profiles.active=test
```

## Contact
For questions about the test suite, contact the development team or refer to the project documentation.
