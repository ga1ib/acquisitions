// Simple test script for authentication endpoints
// Run this after starting the server with: node test_auth.js

const BASE_URL = 'http://localhost:3000';

async function testAuth() {
  console.log('Testing Authentication Endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    console.log('');

    // Test 2: Sign up
    console.log('2. Testing user signup...');
    const signupData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    };

    const signupResponse = await fetch(`${BASE_URL}/api/auth/SignUp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData)
    });

    if (signupResponse.ok) {
      const signupResult = await signupResponse.json();
      console.log('✅ Signup successful:', signupResult);
    } else {
      const signupError = await signupResponse.text();
      console.log('❌ Signup failed:', signupError);
    }
    console.log('');

    // Test 3: Sign in
    console.log('3. Testing user signin...');
    const signinData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const signinResponse = await fetch(`${BASE_URL}/api/auth/SignIn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signinData)
    });

    if (signinResponse.ok) {
      const signinResult = await signinResponse.json();
      console.log('✅ Signin successful:', signinResult);
    } else {
      const signinError = await signinResponse.text();
      console.log('❌ Signin failed:', signinError);
    }
    console.log('');

    // Test 4: Sign out
    console.log('4. Testing user signout...');
    const signoutResponse = await fetch(`${BASE_URL}/api/auth/SignOut`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (signoutResponse.ok) {
      const signoutResult = await signoutResponse.json();
      console.log('✅ Signout successful:', signoutResult);
    } else {
      const signoutError = await signoutResponse.text();
      console.log('❌ Signout failed:', signoutError);
    }
    console.log('');

    // Test 5: Invalid credentials
    console.log('5. Testing invalid credentials...');
    const invalidSigninData = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };

    const invalidResponse = await fetch(`${BASE_URL}/api/auth/SignIn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidSigninData)
    });

    if (!invalidResponse.ok) {
      const invalidError = await invalidResponse.json();
      console.log('✅ Invalid credentials properly rejected:', invalidError);
    } else {
      console.log('❌ Invalid credentials should have been rejected');
    }

  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testAuth();