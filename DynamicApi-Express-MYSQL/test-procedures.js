#!/usr/bin/env node

/**
 * Procedure Endpoints Testing Script
 * Tests all new endpoints for the fixed stored procedures
 */

const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_TOKEN = process.env.TEST_TOKEN || 'YOUR_JWT_TOKEN_HERE';

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Test results tracker
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Make HTTP request
 */
function makeRequest(method, url, headers = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https');
        const client = isHttps ? https : http;

        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            timeout: 5000
        };

        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: data ? JSON.parse(data) : null
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data,
                        parseError: e.message
                    });
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

/**
 * Test result formatter
 */
function logTest(name, passed, message = '') {
    totalTests++;
    if (passed) {
        passedTests++;
        console.log(`${colors.green}✓${colors.reset} ${name}`);
    } else {
        failedTests++;
        console.log(`${colors.red}✗${colors.reset} ${name}`);
        if (message) {
            console.log(`  ${colors.yellow}└─${colors.reset} ${message}`);
        }
    }
}

/**
 * Test Suite
 */
async function runTests() {
    console.log(`${colors.cyan}==============================================`);
    console.log('🧪 Procedure Endpoints Testing Suite');
    console.log(`==============================================\n${colors.reset}`);

    console.log(`${colors.blue}Base URL: ${BASE_URL}\n${colors.reset}`);

    // Test 1: Get Categories (No Auth)
    console.log(`${colors.cyan}📋 Test Suite 1: Categories${colors.reset}`);
    try {
        const result = await makeRequest('GET', `${BASE_URL}/api/v1.0/categories`);
        const hasData = result.data && result.data.status !== undefined;
        logTest('GET /api/v1.0/categories', hasData && result.status === 200, 
            `Status: ${result.status}${hasData ? ', Response: ' + JSON.stringify(result.data).substring(0, 50) + '...' : ''}`);
    } catch (error) {
        logTest('GET /api/v1.0/categories', false, error.message);
    }
    console.log();

    // Test 2: Get Cart (With Auth)
    console.log(`${colors.cyan}🛒 Test Suite 2: Cart${colors.reset}`);
    
    if (TEST_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
        console.log(`${colors.yellow}⚠  Skipping authenticated tests (TEST_TOKEN not set)${colors.reset}`);
        console.log('   Set TEST_TOKEN environment variable to run authenticated tests\n');
    } else {
        try {
            const result = await makeRequest('GET', `${BASE_URL}/api/v1.0/cart`, {
                'Authorization': `Bearer ${TEST_TOKEN}`
            });
            const hasData = result.data && result.data.status !== undefined;
            logTest('GET /api/v1.0/cart (with token)', result.status === 200, 
                `Status: ${result.status}${hasData ? ', Response: ' + JSON.stringify(result.data).substring(0, 50) + '...' : ''}`);
        } catch (error) {
            logTest('GET /api/v1.0/cart (with token)', false, error.message);
        }

        try {
            const result = await makeRequest('GET', `${BASE_URL}/api/v1.0/cart`);
            logTest('GET /api/v1.0/cart (no token)', result.status === 401 || result.status === 400, 
                `Status: ${result.status} (should be 401 or 400)`);
        } catch (error) {
            logTest('GET /api/v1.0/cart (no token)', false, error.message);
        }
        console.log();
    }

    // Test 3: Get Wishlist (With Auth)
    console.log(`${colors.cyan}❤️  Test Suite 3: Wishlist${colors.reset}`);
    
    if (TEST_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
        console.log(`${colors.yellow}⚠  Skipping authenticated tests (TEST_TOKEN not set)\n${colors.reset}`);
    } else {
        try {
            const result = await makeRequest('GET', `${BASE_URL}/api/v1.0/wishlist`, {
                'Authorization': `Bearer ${TEST_TOKEN}`
            });
            const hasData = result.data && result.data.status !== undefined;
            logTest('GET /api/v1.0/wishlist (with token)', result.status === 200, 
                `Status: ${result.status}${hasData ? ', Response: ' + JSON.stringify(result.data).substring(0, 50) + '...' : ''}`);
        } catch (error) {
            logTest('GET /api/v1.0/wishlist (with token)', false, error.message);
        }

        try {
            const result = await makeRequest('GET', `${BASE_URL}/api/v1.0/wishlist`);
            logTest('GET /api/v1.0/wishlist (no token)', result.status === 401 || result.status === 400, 
                `Status: ${result.status} (should be 401 or 400)`);
        } catch (error) {
            logTest('GET /api/v1.0/wishlist (no token)', false, error.message);
        }
        console.log();
    }

    // Test 4: Get Testimonials (No Auth, Multiple Limits)
    console.log(`${colors.cyan}⭐ Test Suite 4: Testimonials${colors.reset}`);
    
    // Default limit
    try {
        const result = await makeRequest('GET', `${BASE_URL}/api/v1.0/testimonials`);
        const hasData = result.data && result.data.status !== undefined;
        logTest('GET /api/v1.0/testimonials (default limit)', hasData && result.status === 200, 
            `Status: ${result.status}${hasData ? ', Limit: default (6)' : ''}`);
    } catch (error) {
        logTest('GET /api/v1.0/testimonials (default limit)', false, error.message);
    }

    // Custom limit
    try {
        const result = await makeRequest('GET', `${BASE_URL}/api/v1.0/testimonials?limit=10`);
        const hasData = result.data && result.data.status !== undefined;
        logTest('GET /api/v1.0/testimonials?limit=10', hasData && result.status === 200, 
            `Status: ${result.status}${hasData ? ', Limit: 10' : ''}`);
    } catch (error) {
        logTest('GET /api/v1.0/testimonials?limit=10', false, error.message);
    }

    // Invalid limit (too high)
    try {
        const result = await makeRequest('GET', `${BASE_URL}/api/v1.0/testimonials?limit=2000`);
        logTest('GET /api/v1.0/testimonials?limit=2000 (invalid)', result.status === 400, 
            `Status: ${result.status} (should be 400)`);
    } catch (error) {
        logTest('GET /api/v1.0/testimonials?limit=2000 (invalid)', false, error.message);
    }

    // Invalid limit (negative)
    try {
        const result = await makeRequest('GET', `${BASE_URL}/api/v1.0/testimonials?limit=-5`);
        logTest('GET /api/v1.0/testimonials?limit=-5 (invalid)', result.status === 400, 
            `Status: ${result.status} (should be 400)`);
    } catch (error) {
        logTest('GET /api/v1.0/testimonials?limit=-5 (invalid)', false, error.message);
    }
    console.log();

    // Summary
    console.log(`${colors.cyan}==============================================`);
    console.log('📊 Test Results');
    console.log(`==============================================\n${colors.reset}`);

    console.log(`Total Tests: ${colors.blue}${totalTests}${colors.reset}`);
    console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
    
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    console.log(`\nPass Rate: ${colors.blue}${passRate}%${colors.reset}\n`);

    if (failedTests === 0) {
        console.log(`${colors.green}✓ All tests passed!${colors.reset}`);
    } else {
        console.log(`${colors.red}✗ Some tests failed. Please check the errors above.${colors.reset}`);
    }

    console.log(`${colors.cyan}==============================================\n${colors.reset}`);

    // Exit with appropriate code
    process.exit(failedTests === 0 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
});
