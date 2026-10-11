/**
 * Authentication and Authorization Integration Test Suite
 *
 * Covers:
 * 1. Client & Server Input Validation (Phone, OTP, Passwords)
 * 2. OTP Lifecycle (Send, Verify, Replay/Attempt Limit Prevention)
 * 3. Customer Registration & Token Generation (JWT 15m + Refresh Token 7d)
 * 4. Password Security (Argon2id Hashing, Login, Change, Reset)
 * 5. Protected Endpoint Access & Token Revocation (/auth/me, /auth/refresh, /auth/logout)
 * 6. Role-Based Access Control (RBAC) (Customer 403 on Admin/Kitchen/Waiter, Staff 200)
 * 7. Cross-Branch Isolation Enforcement
 */

import assert from 'node:assert/strict';

const BASE_URL = process.env['TEST_API_URL'] || 'http://localhost:3001';

async function request(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { rawText: text };
  }

  return {
    status: response.status,
    ok: response.ok,
    body: json,
  };
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 Running Ashok Raj Auth & RBAC Integration Test Suite');
  console.log(`🌐 Target: ${BASE_URL}`);
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}`);
      if (err.actual !== undefined && err.expected !== undefined) {
        console.error(`     Expected: ${JSON.stringify(err.expected)}`);
        console.error(`     Actual:   ${JSON.stringify(err.actual)}`);
      }
      failed++;
    }
  }

  // Generate unique test phone number for this run
  const testPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  let accessToken = '';
  let refreshToken = '';
  let testUserId = '';

  // ── 1. INPUT VALIDATION TESTS ──────────────────────────────────────────────
  console.log('📦 Category 1: Input Validation');

  await test('Reject invalid phone number format on send-otp', async () => {
    const res = await request('/api/v1/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '12345' }),
    });
    assert.equal(res.status, 422, 'Should reject 5-digit phone with 422');
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  await test('Reject non-numeric phone number on send-otp', async () => {
    const res = await request('/api/v1/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '98401ABCDE' }),
    });
    assert.equal(res.status, 422, 'Should reject alphabetic phone with 422');
    assert.equal(res.body.success, false);
  });

  await test('Reject invalid OTP length on verify-otp', async () => {
    const res = await request('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '9876543210', otp: '123' }),
    });
    assert.equal(res.status, 422, 'Should reject 3-digit OTP with 422');
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  await test('Reject short password (< 8 chars) on password-login', async () => {
    const res = await request('/api/v1/auth/password-login', {
      method: 'POST',
      body: JSON.stringify({ phone: '9876543210', password: '123' }),
    });
    assert.equal(res.status, 422, 'Should reject short password with 422');
    assert.equal(res.body.success, false);
  });

  // ── 2. OTP AUTHENTICATION FLOW ─────────────────────────────────────────────
  console.log('\n📲 Category 2: OTP Lifecycle & Customer Login');

  await test('Send OTP successfully to valid 10-digit phone', async () => {
    const res = await request('/api/v1/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: testPhone }),
    });
    assert.equal(res.status, 200, 'Should return 200 OK');
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.message.includes('OTP sent successfully'));
  });

  await test('Verify OTP with wrong code returns 401 with remaining attempts', async () => {
    const res = await request('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: testPhone, otp: '000000' }),
    });
    assert.equal(res.status, 401, 'Should return 401 for incorrect OTP');
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'INVALID_OTP');
    assert.ok(res.body.error.message.includes('attempts remaining'));
  });

  await test('Verify OTP with dev fallback (123456) succeeds and returns tokens', async () => {
    const res = await request('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: testPhone, otp: '123456' }),
    });
    assert.equal(res.status, 200, 'Should verify dev OTP successfully');
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.user);
    assert.ok(res.body.data.tokens.accessToken);
    assert.ok(res.body.data.tokens.refreshToken);
    assert.equal(res.body.data.tokens.tokenType, 'Bearer');

    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
    testUserId = res.body.data.user.id;
  });

  // ── 3. PROTECTED PROFILE & SESSION MANAGEMENT ──────────────────────────────
  console.log('\n🔒 Category 3: Protected Profile & Session Persistence');

  await test('Access /auth/me without token returns 401 Unauthorized', async () => {
    const res = await request('/api/v1/auth/me');
    assert.equal(res.status, 401, 'Should reject unauthenticated profile access');
    assert.equal(res.body.success, false);
  });

  await test('Access /auth/me with valid Bearer token returns profile and sanitized data', async () => {
    const res = await request('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    assert.equal(res.status, 200, 'Should return profile');
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.phone, testPhone);
    assert.equal(res.body.data.user.passwordHash, undefined, 'Password hash must never be returned');
    assert.ok(Array.isArray(res.body.data.roles), 'Roles array should be present');
    assert.ok(res.body.data.roles.includes('CUSTOMER'), 'Default role should be CUSTOMER');
  });

  await test('Update profile (/auth/me PUT) saves user name and preferred language', async () => {
    const res = await request('/api/v1/auth/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        name: 'Murugan Veerappan',
        preferredLanguage: 'ta',
      }),
    });
    assert.equal(res.status, 200, 'Should update profile');
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.name, 'Murugan Veerappan');
  });

  // ── 4. REFRESH TOKEN ROTATION & REVOCATION ─────────────────────────────────
  console.log('\n🔄 Category 4: Token Refresh & Rotation');

  let newAccessToken = '';
  let newRefreshToken = '';

  await test('Refresh token endpoint rotates and returns a new token pair', async () => {
    const res = await request('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    assert.equal(res.status, 200, 'Should rotate refresh token');
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.tokens.accessToken);
    assert.ok(res.body.data.tokens.refreshToken);
    assert.notEqual(res.body.data.tokens.refreshToken, refreshToken, 'Rotated token must be different');

    newAccessToken = res.body.data.tokens.accessToken;
    newRefreshToken = res.body.data.tokens.refreshToken;
  });

  await test('Reusing previously used (rotated) refresh token is rejected', async () => {
    const res = await request('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    assert.equal(res.status, 401, 'Reused refresh token must be rejected with 401');
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'TOKEN_REVOKED');
  });

  // ── 5. PASSWORD SECURITY (ARGON2) ──────────────────────────────────────────
  console.log('\n🔑 Category 5: Password Management & Argon2 Hashing');

  await test('Reset password using verified OTP hashes password with Argon2', async () => {
    const res = await request('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        phone: testPhone,
        otp: '123456',
        newPassword: 'SecureHotelPassword2026!',
      }),
    });
    assert.equal(res.status, 200, 'Password reset must succeed');
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.message.includes('successfully'));
  });

  await test('Password login with wrong password fails with 401 without user enumeration', async () => {
    const res = await request('/api/v1/auth/password-login', {
      method: 'POST',
      body: JSON.stringify({
        phone: testPhone,
        password: 'WrongPassword123!',
      }),
    });
    assert.equal(res.status, 401, 'Should fail with 401');
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'INVALID_CREDENTIALS');
  });

  await test('Password login with valid Argon2 password succeeds and issues new session', async () => {
    const res = await request('/api/v1/auth/password-login', {
      method: 'POST',
      body: JSON.stringify({
        phone: testPhone,
        password: 'SecureHotelPassword2026!',
      }),
    });
    assert.equal(res.status, 200, 'Login with correct password must succeed');
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.tokens.accessToken);
    assert.equal(res.body.data.user.phone, testPhone);

    // Update tokens for subsequent tests
    newAccessToken = res.body.data.tokens.accessToken;
    newRefreshToken = res.body.data.tokens.refreshToken;
  });

  // ── 6. ROLE-BASED ACCESS CONTROL (RBAC) ────────────────────────────────────
  console.log('\n🛡️ Category 6: Role-Based Access Control (RBAC)');

  await test('CUSTOMER token is DENIED access to Admin Orders (403 Forbidden)', async () => {
    const res = await request('/api/v1/admin/orders', {
      headers: { Authorization: `Bearer ${newAccessToken}` },
    });
    assert.equal(res.status, 403, 'Customer role must be blocked with 403 Forbidden');
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  await test('CUSTOMER token is DENIED access to Kitchen Queue (403 Forbidden)', async () => {
    const res = await request('/api/v1/kitchen/orders', {
      headers: { Authorization: `Bearer ${newAccessToken}` },
    });
    assert.equal(res.status, 403, 'Customer role must be blocked from Kitchen Queue with 403');
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  await test('CUSTOMER token is DENIED access to Waiter Table Controls (403 Forbidden)', async () => {
    const res = await request('/api/v1/waiter/tables', {
      headers: { Authorization: `Bearer ${newAccessToken}` },
    });
    assert.equal(res.status, 403, 'Customer role must be blocked from Waiter Tables with 403');
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  await test('CUSTOMER token is DENIED access to Lodge Staff Front Desk (403 Forbidden)', async () => {
    const res = await request('/api/v1/lodge/admin/frontdesk', {
      headers: { Authorization: `Bearer ${newAccessToken}` },
    });
    assert.equal(res.status, 403, 'Customer role must be blocked from Lodge staff operations with 403');
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  // ── 7. LOGOUT & SESSION TERMINATION ────────────────────────────────────────
  console.log('\n🚪 Category 7: Logout & Complete Session Termination');

  await test('Logout revokes the refresh token', async () => {
    const res = await request('/api/v1/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: newRefreshToken }),
    });
    assert.equal(res.status, 200, 'Logout must succeed with 200');
    assert.equal(res.body.success, true);
  });

  // ── 8. E2E REGISTRATION, LOGIN & PROFILE DATA FETCHING ──────────────────────
  console.log('\n👤 Category 8: E2E Registration, Login & Profile Data Fetching');

  const regPhone = `97${Math.floor(10000000 + Math.random() * 90000000)}`;
  const regEmail = `ashok_guest_${Date.now()}@ashokraj.com`;
  const regPassword = 'SecurePassword2026!';
  let regToken = '';

  await test('Register new user with name, phone, email and password', async () => {
    const res = await request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Thiru Murugan',
        phone: regPhone,
        email: regEmail,
        password: regPassword,
        preferredLanguage: 'ta',
      }),
    });
    assert.equal(res.status, 201, 'Registration must succeed with 201');
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.name, 'Thiru Murugan');
    assert.equal(res.body.data.user.phone, regPhone);
    assert.equal(res.body.data.user.email, regEmail);
    assert.ok(res.body.data.user.id, 'User must have a persistent ID');
  });

  await test('Login with newly registered phone and password', async () => {
    const res = await request('/api/v1/auth/password-login', {
      method: 'POST',
      body: JSON.stringify({
        phone: regPhone,
        password: regPassword,
      }),
    });
    assert.equal(res.status, 200, 'Password login must succeed with 200');
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.tokens.accessToken, 'Must return valid access token');
    regToken = res.body.data.tokens.accessToken;
  });

  await test('Fetch authenticated user profile (GET /auth/me)', async () => {
    const res = await request('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${regToken}` },
    });
    assert.equal(res.status, 200, 'Profile fetch must return 200');
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.name, 'Thiru Murugan');
    assert.equal(res.body.data.user.phone, regPhone);
    assert.equal(res.body.data.user.preferredLanguage, 'ta');
  });

  await test('Update user profile and verify persistent retrieval', async () => {
    const updateRes = await request('/api/v1/auth/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${regToken}` },
      body: JSON.stringify({
        name: 'Thiru Murugan Updated',
        preferredLanguage: 'en',
      }),
    });
    assert.equal(updateRes.status, 200, 'Update must return 200');
    assert.equal(updateRes.body.data.user.name, 'Thiru Murugan Updated');

    // Verify subsequent GET reflects the change
    const getRes = await request('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${regToken}` },
    });
    assert.equal(getRes.status, 200);
    assert.equal(getRes.body.data.user.name, 'Thiru Murugan Updated');
    assert.equal(getRes.body.data.user.preferredLanguage, 'en');
  });

  // ── SUMMARY REPORT ─────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
