import fs from 'fs';
import path from 'path';
import assert from 'assert';

// Clean up any existing test DB file from a previous crash/run
try {
  if (fs.existsSync('carboniq.test.db')) {
    fs.unlinkSync('carboniq.test.db');
    console.log('🗑️ Pre-cleaned existing test database.');
  }
} catch (e) {
  // Ignore
}

// Configure test environment variables before importing server
process.env.PORT = '5050';
process.env.DB_PATH = 'carboniq.test.db';
process.env.VERCEL = 'true'; // Prevents server.js from auto-listening on import

const app = (await import('./server.js')).default;

// Custom synchronous test runner to support Mocha/Jest-style describe/it natively in pure Node
const suites = [];
let currentSuite = null;

function describe(name, fn) {
  currentSuite = { name, tests: [], befores: [] };
  suites.push(currentSuite);
  fn();
  currentSuite = null;
}

function it(name, fn) {
  if (currentSuite) {
    currentSuite.tests.push({ name, fn });
  }
}

function before(fn) {
  if (currentSuite) {
    currentSuite.befores.push(fn);
  }
}

console.log('🧪 Starting CarbonIQ AI API Integration Test Suite...\n');

let passCount = 0;
let failCount = 0;

function assertCondition(condition, message) {
  if (condition) {
    passCount++;
    console.log(`✅ PASS: ${message}`);
  } else {
    failCount++;
    console.error(`❌ FAIL: ${message}`);
  }
}

// Helper for making requests
const baseUrl = 'http://localhost:5050';
async function apiRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const status = res.status;
    let body = null;
    try {
      body = await res.json();
    } catch (e) {
      // Not JSON
    }
    return { status, body };
  } catch (err) {
    console.error(`Fetch error on ${endpoint}:`, err.message);
    return { status: 500, body: { error: err.message } };
  }
}

// Start the server
const server = app.listen(5050, async () => {
  console.log('🚀 Test server running on port 5050.');
  
  try {
    await runTests();
  } catch (err) {
    console.error('Test run failed with fatal error:', err);
    failCount++;
  } finally {
    // Shutdown server and clean up DB file
    server.close(() => {
      console.log('\n🛑 Test server stopped.');
      
      // Delete SQLite test database file
      try {
        if (fs.existsSync('carboniq.test.db')) {
          fs.unlinkSync('carboniq.test.db');
          console.log('🗑️ Cleaned up test database.');
        }
      } catch (err) {
        console.error('Failed to delete test database file:', err.message);
      }
      
      console.log('\n======================================');
      console.log(`📊 API TEST RUN SUMMARY`);
      console.log(`Total Passed: ${passCount}`);
      console.log(`Total Failed: ${failCount}`);
      console.log('======================================');
      
      process.exit(failCount > 0 ? 1 : 0);
    });
  }
});

async function runTests() {
  let token = null;
  const testEmail = `test-${Date.now()}@example.com`;

  // ==================== HELPER FUNCTIONS ====================
  async function registerUser(email, password) {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res;
  }

  async function loginUser(email, password) {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    return { res, data };
  }

  // ==================== AUTHENTICATION TESTS ====================
  describe('API - Authentication', () => {
    it('should register a new user with valid credentials', async () => {
      const res = await registerUser('newuser@test.com', 'SecurePass123!');
      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert(data.token, 'Should return JWT token');
      assert(data.userId, 'Should return user ID');
    });

    it('should reject registration with invalid email format', async () => {
      const res = await registerUser('invalid-email', 'SecurePass123!');
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert(data.errors, 'Should return validation errors');
    });

    it('should reject registration with weak password', async () => {
      const res = await registerUser('test@example.com', 'weak');
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert(data.errors, 'Should return password validation error');
    });

    it('should reject duplicate email registration', async () => {
      await registerUser('duplicate@test.com', 'SecurePass123!');
      const res = await registerUser('duplicate@test.com', 'SecurePass123!');
      assert.strictEqual(res.status, 409);
    });

    it('should login with valid credentials', async () => {
      await registerUser('login@test.com', 'TestPass123!');
      const { res, data } = await loginUser('login@test.com', 'TestPass123!');
      assert.strictEqual(res.status, 200);
      assert(data.token, 'Should return JWT token');
      token = data.token;
    });

    it('should reject login with wrong password', async () => {
      const { res } = await loginUser('login@test.com', 'WrongPass123!');
      assert.strictEqual(res.status, 401);
    });

    it('should reject login with non-existent email', async () => {
      const { res } = await loginUser('nonexistent@test.com', 'AnyPass123!');
      assert.strictEqual(res.status, 401);
    });

    it('should return 401 for requests without auth token', async () => {
      const res = await fetch(`${baseUrl}/api/carbon/footprint`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      assert.strictEqual(res.status, 401);
    });
  });

  // ==================== CARBON TRACKING TESTS ====================
  describe('API - Carbon Tracking', () => {
    before(async () => {
      await registerUser('tracker@test.com', 'TestPass123!');
      const { data } = await loginUser('tracker@test.com', 'TestPass123!');
      token = data.token;
    });

    it('should calculate carbon emissions for car transport', async () => {
      const res = await fetch(`${baseUrl}/api/carbon/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: 'transport',
          distance: 50,
          mode: 'car',
        }),
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert(typeof data.emissions === 'number');
      assert(data.emissions > 0);
    });

    it('should calculate lower emissions for public transport', async () => {
      const res = await fetch(`${baseUrl}/api/carbon/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: 'transport',
          distance: 50,
          mode: 'bus',
        }),
      });
      const data = await res.json();
      assert(data.emissions < 10.5);
    });

    it('should track daily emissions', async () => {
      const res = await fetch(`${baseUrl}/api/carbon/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          activity: 'commute',
          emissions: 12.5,
          category: 'transport',
          timestamp: new Date().toISOString(),
        }),
      });
      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert(data.id, 'Should return tracking entry ID');
    });

    it('should reject tracking with invalid emissions value', async () => {
      const res = await fetch(`${baseUrl}/api/carbon/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          activity: 'test',
          emissions: -5,
          timestamp: new Date().toISOString(),
        }),
      });
      assert.strictEqual(res.status, 400);
    });

    it('should retrieve user carbon footprint', async () => {
      const res = await fetch(`${baseUrl}/api/carbon/footprint`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert(typeof data.totalEmissions === 'number');
      assert(typeof data.weeklyAverage === 'number');
      assert(typeof data.monthlyAverage === 'number');
    });

    it('should retrieve carbon timeline', async () => {
      const res = await fetch(`${baseUrl}/api/carbon/timeline?days=7`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert(Array.isArray(data.timeline));
    });
  });

  // ==================== MISSIONS TESTS ====================
  describe('API - Missions', () => {
    before(async () => {
      await registerUser('missions@test.com', 'TestPass123!');
      const { data } = await loginUser('missions@test.com', 'TestPass123!');
      token = data.token;
    });

    it('should generate weekly missions', async () => {
      const res = await fetch(`${baseUrl}/api/missions/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert(Array.isArray(data.missions));
      assert(data.missions.length > 0);
      assert(data.missions[0].title, 'Mission should have title');
      assert(data.missions[0].impact, 'Mission should have impact');
    });

    it('should mark mission as complete', async () => {
      const missionsRes = await fetch(`${baseUrl}/api/missions/weekly`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const missionsData = await missionsRes.json();
      const missionId = missionsData.missions[0].id;

      const res = await fetch(`${baseUrl}/api/missions/${missionId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.completed, true);
    });

    it('should retrieve user missions', async () => {
      const res = await fetch(`${baseUrl}/api/missions/weekly`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert(Array.isArray(data.missions));
    });
  });

  // ==================== RECEIPT TESTS ====================
  describe('API - Receipt Intelligence', () => {
    before(async () => {
      await registerUser('receipt@test.com', 'TestPass123!');
      const { data } = await loginUser('receipt@test.com', 'TestPass123!');
      token = data.token;
    });

    it('should reject receipt upload with invalid category', async () => {
      const res = await fetch(`${baseUrl}/api/receipt/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          receipt: 'base64encodedimage',
          category: 'invalid-category',
          amount: 50,
        }),
      });
      assert.strictEqual(res.status, 400);
    });

    it('should reject receipt with negative amount', async () => {
      const res = await fetch(`${baseUrl}/api/receipt/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          receipt: 'base64encodedimage',
          category: 'food',
          amount: -10,
        }),
      });
      assert.strictEqual(res.status, 400);
    });
  });

  console.log('⏳ Running registered test suites...');
  for (const suite of suites) {
    console.log(`\n📋 Suite: ${suite.name}`);
    for (const beforeFn of suite.befores) {
      await beforeFn();
    }
    for (const test of suite.tests) {
      try {
        await test.fn();
        passCount++;
        console.log(`  ✅ PASS: ${test.name}`);
      } catch (err) {
        failCount++;
        console.error(`  ❌ FAIL: ${test.name}`);
        console.error(err.message || err);
      }
    }
  }
  console.log('\n✅ All API tests completed');
}

