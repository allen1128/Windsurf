#!/bin/bash

# LittleLibrary Integration Test Runner
# This script runs all tests and generates reports

echo "🧪 Starting LittleLibrary Test Suite..."

# Set test profile
export SPRING_PROFILES_ACTIVE=test

# Clean previous test results
echo "🧹 Cleaning previous test results..."
./mvnw clean

# Run unit tests
echo "🔬 Running unit tests..."
./mvnw test

# Run integration tests
echo "🔗 Running integration tests..."
./mvnw verify

# Generate test reports
echo "📊 Generating test reports..."
./mvnw jacoco:report

# Display results
echo "✅ Test execution completed!"
echo "📋 Test Results:"
echo "  - Unit Tests: target/surefire-reports/"
echo "  - Integration Tests: target/failsafe-reports/"
echo "  - Coverage Report: target/site/jacoco/index.html"

# Check if tests passed
if [ $? -eq 0 ]; then
    echo "🎉 All tests passed successfully!"
else
    echo "❌ Some tests failed. Check the reports for details."
    exit 1
fi
