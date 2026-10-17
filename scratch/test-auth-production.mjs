// Production Authentication Flow Test Script for Ashok Raj Lodge & Restaurant
const BASE_URL = 'http://localhost:3001/api/v1';

async function testAuth() {
  console.log('--- Starting Authentication Suite Tests ---');
  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      testPassed++;
    } else {
      console.error(`[FAIL] ${message}`);
      testFailed++;
    }
  }

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const testPhone = `98${randomSuffix}1234`;
  const testEmail = `test_${randomSuffix}@ashoktest.com`;
  const testPassword = 'Password@123';
  const testName = 'Test Customer';

  console.log(`Using Test Phone: ${testPhone}, Email: ${testEmail}`);

  // 1. Send OTP for registration
  console.log('\n--- 1. Testing /send-otp for Registration ---');
  const sendOtpRes = await fetch(`${BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: testPhone }),
  });
  const sendOtpData = await sendOtpRes.json();
  assert(sendOtpRes.status === 200, `Send OTP HTTP status 200 (got ${sendOtpRes.status})`);
  assert(sendOtpData.success === true, 'Send OTP success response');
  const otpCode = sendOtpData.data?.debugOtp || '123456';
  console.log(`Received OTP Code: ${otpCode}`);

  // 2. Register Account
  console.log('\n--- 2. Testing /register with OTP, Name, Email, Password ---');
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testPhone,
      name: testName,
      email: testEmail,
      password: testPassword,
      otp: otpCode,
    }),
  });
  const regData = await regRes.json();
  assert(regRes.status === 201, `Register HTTP status 201 (got ${regRes.status})`);
  assert(regData.success === true, 'Registration succeeded');
  assert(regData.data?.tokens === undefined, 'Per specification: Register does NOT auto-login newly registered user');
  assert(regData.data?.message?.includes('successful'), 'Returned success message for login redirection');

  // 3. Duplicate Registration Prevention
  console.log('\n--- 3. Testing Duplicate Phone Registration (Must reject with 409) ---');
  const dupPhoneRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testPhone,
      name: 'Duplicate Phone User',
      password: testPassword,
    }),
  });
  const dupPhoneData = await dupPhoneRes.json();
  assert(dupPhoneRes.status === 409, `Duplicate phone rejected with 409 (got ${dupPhoneRes.status})`);
  assert(dupPhoneData.error?.code === 'USER_ALREADY_EXISTS', 'Error code is USER_ALREADY_EXISTS');

  console.log('\n--- 3b. Testing Duplicate Email Registration (Must reject with 409) ---');
  const dupEmailPhone = `97${randomSuffix}5678`;
  const dupEmailRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: dupEmailPhone,
      name: 'Duplicate Email User',
      email: testEmail,
      password: testPassword,
    }),
  });
  const dupEmailData = await dupEmailRes.json();
  assert(dupEmailRes.status === 409, `Duplicate email rejected with 409 (got ${dupEmailRes.status})`);
  assert(dupEmailData.error?.code === 'EMAIL_ALREADY_EXISTS', 'Error code is EMAIL_ALREADY_EXISTS');

  // 4. Password Login with Mobile Number
  console.log('\n--- 4. Testing /password-login with Mobile Number ---');
  const phoneLoginRes = await fetch(`${BASE_URL}/auth/password-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testPhone,
      password: testPassword,
    }),
  });
  const phoneLoginData = await phoneLoginRes.json();
  assert(phoneLoginRes.status === 200, `Phone password login HTTP 200 (got ${phoneLoginRes.status})`);
  assert(phoneLoginData.success === true, 'Login successful');
  assert(Boolean(phoneLoginData.data?.tokens?.accessToken), 'Access token received');
  assert(Boolean(phoneLoginData.data?.tokens?.refreshToken), 'Refresh token received');
  assert(phoneLoginData.data?.tokens?.sessionMaxAgeDays === 30, 'Session max age is 30 days');
  const tokens = phoneLoginData.data?.tokens;

  // 5. Password Login with Email
  console.log('\n--- 5. Testing /password-login with Email Address ---');
  const emailLoginRes = await fetch(`${BASE_URL}/auth/password-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: testEmail,
      password: testPassword,
    }),
  });
  const emailLoginData = await emailLoginRes.json();
  assert(emailLoginRes.status === 200, `Email password login HTTP 200 (got ${emailLoginRes.status})`);
  assert(emailLoginData.success === true, 'Email login successful');

  // 6. Password Login with Invalid Password
  console.log('\n--- 6. Testing /password-login with Invalid Password ---');
  const badLoginRes = await fetch(`${BASE_URL}/auth/password-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testPhone,
      password: 'WrongPassword999',
    }),
  });
  const badLoginData = await badLoginRes.json();
  assert(badLoginRes.status === 401, `Invalid password rejected with 401 (got ${badLoginRes.status})`);
  assert(badLoginData.error?.code === 'INVALID_CREDENTIALS', 'Error code is INVALID_CREDENTIALS');

  // 7. Verify Protected Route /auth/me
  console.log('\n--- 7. Testing Protected Profile Route /auth/me ---');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });
  const meData = await meRes.json();
  assert(meRes.status === 200, `/auth/me status 200 (got ${meRes.status})`);
  assert(meData.data?.user?.phone === testPhone, `User phone matches: ${meData.data?.user?.phone}`);
  assert(meData.data?.user?.email === testEmail, `User email matches: ${meData.data?.user?.email}`);

  // 8. Token Refresh with 30-Day Expiry
  console.log('\n--- 8. Testing Token Refresh /auth/refresh ---');
  const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });
  const refreshData = await refreshRes.json();
  assert(refreshRes.status === 200, `Token refresh HTTP 200 (got ${refreshRes.status})`);
  assert(Boolean(refreshData.data?.tokens?.accessToken), 'New rotated access token received');
  assert(Boolean(refreshData.data?.tokens?.refreshToken), 'New rotated refresh token received');
  assert(refreshData.data?.tokens?.sessionMaxAgeDays === 30, 'New rotated token has 30-day session');
  const rotatedTokens = refreshData.data?.tokens;

  // 9. Old Refresh Token Replay Prevention
  console.log('\n--- 9. Testing Old Refresh Token Replay (Must be rejected) ---');
  const replayRes = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });
  const replayData = await replayRes.json();
  assert(replayRes.status === 401, `Old refresh token rejected with 401 (got ${replayRes.status})`);
  assert(replayData.error?.code === 'TOKEN_REVOKED', 'Old token is marked TOKEN_REVOKED');

  // 10. Logout and Server-Side Revocation
  console.log('\n--- 10. Testing /auth/logout (Session Revocation) ---');
  const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${rotatedTokens.accessToken}`,
    },
    body: JSON.stringify({ refreshToken: rotatedTokens.refreshToken }),
  });
  const logoutData = await logoutRes.json();
  assert(logoutRes.status === 200, `Logout HTTP 200 (got ${logoutRes.status})`);

  // Verify that the logged-out refresh token is now revoked on the server
  const afterLogoutRefresh = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rotatedTokens.refreshToken }),
  });
  assert(afterLogoutRefresh.status === 401, 'Logged-out session cannot be refreshed');

  // 11. Mobile OTP Login
  console.log('\n--- 11. Testing Mobile OTP Login (/send-otp + /verify-otp) ---');
  const otpLoginSend = await fetch(`${BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: testPhone }),
  });
  const otpLoginData = await otpLoginSend.json();
  const verifyCode = otpLoginData.data?.debugOtp || '123456';

  const otpVerifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: testPhone, otp: verifyCode }),
  });
  const otpVerifyData = await otpVerifyRes.json();
  assert(otpVerifyRes.status === 200, `OTP verify HTTP 200 (got ${otpVerifyRes.status})`);
  assert(otpVerifyData.success === true, 'OTP login verified successfully');
  assert(otpVerifyData.data?.tokens?.sessionMaxAgeDays === 30, 'OTP login issues 30-day session');

  // 12. Password Reset
  console.log('\n--- 12. Testing Account Recovery (/reset-password) ---');
  const resetOtpSend = await fetch(`${BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: testPhone }),
  });
  const resetOtpData = await resetOtpSend.json();
  const resetCode = resetOtpData.data?.debugOtp || '123456';
  const newPassword = 'NewSecretPassword@456';

  const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testPhone,
      otp: resetCode,
      newPassword: newPassword,
    }),
  });
  const resetResult = await resetRes.json();
  assert(resetRes.status === 200, `Password reset HTTP 200 (got ${resetRes.status})`);
  assert(resetResult.success === true, 'Password reset succeeded');

  // Verify login with new password
  const newLoginRes = await fetch(`${BASE_URL}/auth/password-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testPhone,
      password: newPassword,
    }),
  });
  assert(newLoginRes.status === 200, 'Login with new password succeeded');

  console.log('\n=======================================');
  console.log(`TEST RESULTS: ${testPassed} Passed, ${testFailed} Failed`);
  console.log('=======================================');
  if (testFailed > 0) process.exit(1);
}

testAuth().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
