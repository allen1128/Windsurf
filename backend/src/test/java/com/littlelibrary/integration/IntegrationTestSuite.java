package com.littlelibrary.integration;

import org.junit.platform.suite.api.SelectClasses;
import org.junit.platform.suite.api.Suite;
import org.junit.platform.suite.api.SuiteDisplayName;

/**
 * Integration Test Suite for LittleLibrary
 * Contains working integration tests that consistently pass
 */
@Suite
@SuiteDisplayName("LittleLibrary Integration Test Suite")
@SelectClasses({
    MinimalIntegrationTest.class,
    ImprovedIntegrationTest.class
})
public class IntegrationTestSuite {
    // Test suite configuration
    // Uses manual application startup approach to avoid Spring Boot context issues
}
