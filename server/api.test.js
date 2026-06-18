import fs from 'fs';
import path from 'path';

// Configure test environment variables before importing server
process.env.PORT = '5050';
process.env.DB_PATH = 'carboniq.test.db';
process.env.VERCEL = 'true'; // Prevents server.js from auto-listening on import

import app from './server.js';

console.log('🧪 Starting CarbonIQ AI API Integration Test Suite...\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
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

  // 1. Health Check
  const health = await apiRequest('/api/health');
  assert(health.status === 200, 'GET /api/health returns 200');
  assert(health.body.status === 'healthy', 'Health check status is "healthy"');

  // 2. Auth: Register - Missing fields validation
  const regFail1 = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: 'password123' })
  });
  assert(regFail1.status === 400, 'Register validation: Missing username returns 400');
  assert(regFail1.body.error === 'Missing required credential fields.', 'Register validation error matches expected');

  // 3. Auth: Register - Invalid email format validation
  const regFail2 = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username: 'testuser', email: 'invalidemail', password: 'password123' })
  });
  assert(regFail2.status === 400, 'Register validation: Invalid email format returns 400');
  assert(regFail2.body.error === 'Invalid email address format.', 'Register validation email error matches expected');

  // 4. Auth: Register - Weak password validation
  const regFail3 = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username: 'testuser', email: testEmail, password: '123' })
  });
  assert(regFail3.status === 400, 'Register validation: Weak password (<6 chars) returns 400');
  assert(regFail3.body.error === 'Password must be at least 6 characters long.', 'Register validation password error matches');

  // 5. Auth: Register - Success
  const regSuccess = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username: 'testuser', email: testEmail, password: 'password123' })
  });
  assert(regSuccess.status === 201, 'Register success returns 201');
  assert(regSuccess.body.token !== undefined, 'Register success returns JWT token');
  assert(regSuccess.body.user.username === 'testuser', 'Register success returns correct user object');
  token = regSuccess.body.token;

  // 6. Auth: Register - Duplicate email error
  const regDup = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username: 'testuser2', email: testEmail, password: 'password123' })
  });
  assert(regDup.status === 400, 'Register duplicate email returns 400');
  assert(regDup.body.error === 'Email already registered', 'Duplicate email error matches expected');

  // 7. Auth: Login - Missing password validation
  const loginFail1 = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail })
  });
  assert(loginFail1.status === 400, 'Login validation: Missing password returns 400');

  // 8. Auth: Login - Incorrect password
  const loginFail2 = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: 'wrongpassword' })
  });
  assert(loginFail2.status === 400, 'Login: Incorrect password returns 400');
  assert(loginFail2.body.error === 'Invalid email or password', 'Incorrect login error matches');

  // 9. Auth: Login - Success
  const loginSuccess = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: 'password123' })
  });
  assert(loginSuccess.status === 200, 'Login success returns 200');
  assert(loginSuccess.body.token !== undefined, 'Login success returns JWT token');

  // 10. User API - Unauthorized
  const userUnauth = await apiRequest('/api/auth/me');
  assert(userUnauth.status === 401, 'GET /api/auth/me without token returns 401');

  // 11. User API - Authorized
  const userAuth = await apiRequest('/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert(userAuth.status === 200, 'GET /api/auth/me with valid token returns 200');
  assert(userAuth.body.username === 'testuser', 'User details match authenticated user');

  // 12. Twin Assess - Missing transport validation
  const assessFail1 = await apiRequest('/api/twin/assess', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ food: { diet: 'vegan' }, energy: { kwh: 100 }, shopping: { frequency: 'low' } })
  });
  assert(assessFail1.status === 400, 'Twin assess validation: Missing transport returns 400');

  // 13. Twin Assess - Success (EV commuter, Vegan, Low power)
  const assessSuccess = await apiRequest('/api/twin/assess', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      transport: { type: 'car_ev', dailyKm: 20 },
      food: { diet: 'vegan' },
      energy: { kwh: 150 },
      shopping: { frequency: 'low' },
      waste: { bagsPerWeek: 1 }
    })
  });
  assert(assessSuccess.status === 200, 'Twin assess submission returns 200');
  assert(assessSuccess.body.footprint.total === 193, 'Carbon footprint correctly calculated in endpoint (193kg CO2)');

  // 14. Twin History
  const history = await apiRequest('/api/twin', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert(history.status === 200, 'GET /api/twin returns 200');
  assert(history.body.hasTwin === true, 'History contains submitted assessment');

  // 15. Climate Coach Chat - Message validation
  const chatFail = await apiRequest('/api/coach/chat', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ message: '' })
  });
  assert(chatFail.status === 400, 'Chat validation: Empty message returns 400');

  // 16. Climate Coach Chat - Success (runs in mock mode for unit test integration)
  const chatSuccess = await apiRequest('/api/coach/chat', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ message: 'What is my current carbon footprint?', mockMode: true })
  });
  assert(chatSuccess.status === 200, 'Chat response in mock mode returns 200');
  assert(chatSuccess.body.response !== undefined, 'Chat response returns text reply');

  // 17. Receipt Upload - Invalid category validation
  const receiptFail = await apiRequest('/api/receipt/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ receiptData: { category: 'invalid', amount: 50 } })
  });
  assert(receiptFail.status === 400, 'Receipt upload validation: Invalid category returns 400');

  // 18. Receipt Upload - Success
  const receiptSuccess = await apiRequest('/api/receipt/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ receiptData: { category: 'fuel', amount: 40 } })
  });
  assert(receiptSuccess.status === 200, 'Receipt upload returns 200');
  assert(receiptSuccess.body.co2_impact === 92, 'Receipt emissions correctly calculated (92kg CO2)');
  assert(receiptSuccess.body.points_earned === 50, 'Receipt upload awards correct points (50)');

  // 19. Receipt Logs
  const receiptLogs = await apiRequest('/api/receipt/logs', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert(receiptLogs.status === 200, 'GET /api/receipt/logs returns 200');
  assert(receiptLogs.body.length > 0, 'Receipt logs contain uploaded receipt entry');

  // 20. Missions List
  const missions = await apiRequest('/api/missions', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert(missions.status === 200, 'GET /api/missions returns 200');
  assert(missions.body.length > 0, 'Missions list returns seeded weekly missions');

  // 21. Mission Complete - Validation ID format
  const missionCompleteFail1 = await apiRequest('/api/missions/complete', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ missionId: 'abc' })
  });
  assert(missionCompleteFail1.status === 400, 'Mission complete validation: Invalid format returns 400');

  // 22. Mission Complete - Success (Mission 1)
  const missionCompleteSuccess = await apiRequest('/api/missions/complete', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ missionId: 1 })
  });
  assert(missionCompleteSuccess.status === 200, 'Mission completion returns 200');
  assert(missionCompleteSuccess.body.success === true, 'Mission completion response success flag is true');

  // 23. Mission Complete - Already completed validation error
  const missionCompleteFail2 = await apiRequest('/api/missions/complete', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ missionId: 1 })
  });
  assert(missionCompleteFail2.status === 400, 'Mission complete validation: Already completed returns 400');
  assert(missionCompleteFail2.body.error === 'Mission already completed', 'Already completed error message matches');

  // 24. Challenges List
  const challenges = await apiRequest('/api/challenges', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert(challenges.status === 200, 'GET /api/challenges returns 200');
  assert(challenges.body.length > 0, 'Challenges list returns seeded active challenges');

  // 25. Challenges Join - Success (Challenge 1)
  const challengeJoinSuccess = await apiRequest('/api/challenges/join', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ challengeId: 1 })
  });
  assert(challengeJoinSuccess.status === 200, 'Challenge join returns 200');
  assert(challengeJoinSuccess.body.success === true, 'Challenge join response success flag is true');

  // 26. Challenges Join - Already joined validation error
  const challengeJoinFail = await apiRequest('/api/challenges/join', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ challengeId: 1 })
  });
  assert(challengeJoinFail.status === 400, 'Challenge join validation: Already joined returns 400');
  assert(challengeJoinFail.body.error === 'Already joined this challenge', 'Already joined error message matches');

  // 27. Leaderboard
  const leaderboard = await apiRequest('/api/leaderboard');
  assert(leaderboard.status === 200, 'GET /api/leaderboard returns 200');
  assert(leaderboard.body.length > 0, 'Leaderboard returns users and competitors list');
}
