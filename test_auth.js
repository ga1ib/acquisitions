// Simple test script for authentication endpoints
// Run this after starting the server with: node test_auth.js

import http from 'http';

const BASE_URL = 'localhost';
const PORT = 3000;

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body,
            json: () => {
              try {
                return JSON.parse(body);
              } catch {
                return body;
              }
            }
          };
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAuth() {
  console.log('Testing Authentication Endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await makeRequest('/health');
    if (healthResponse.statusCode === 200) {
      console.log('✅ Health check:', healthResponse.json());
    } else {
      console.log('❌ Health check failed:', healthResponse.body);
    }
    console.log('');

    // Test 2: Sign up
    console.log('2. Testing user signup...');
    const signupData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    };

    const signupResponse = await makeRequest('/api/auth/SignUp', 'POST', signupData);
    if (signupResponse.statusCode === 201) {
      console.log('✅ Signup successful:', signupResponse.json());
    } else {
      console.log('❌ Signup failed:', signupResponse.json());
    }
    console.log('');

    // Test 3: Sign in
    console.log('3. Testing user signin...');
    const signinData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const signinResponse = await makeRequest('/api/auth/SignIn', 'POST', signinData);
    if (signinResponse.statusCode === 200) {
      console.log('✅ Signin successful:', signinResponse.json());
    } else {
      console.log('❌ Signin failed:', signinResponse.json());
    }
    console.log('');

    // Test 4: Sign out
    console.log('4. Testing user signout...');
    const signoutResponse = await makeRequest('/api/auth/SignOut', 'POST');
    if (signoutResponse.statusCode === 200) {
      console.log('✅ Signout successful:', signoutResponse.json());
    } else {
      console.log('❌ Signout failed:', signoutResponse.json());
    }
    console.log('');

    // Test 5: Invalid credentials
    console.log('5. Testing invalid credentials...');
    const invalidSigninData = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };

    const invalidResponse = await makeRequest('/api/auth/SignIn', 'POST', invalidSigninData);
    if (invalidResponse.statusCode === 401) {
      console.log('✅ Invalid credentials properly rejected:', invalidResponse.json());
    } else {
      console.log('❌ Invalid credentials should have been rejected, got status:', invalidResponse.statusCode);
    }
    console.log('');

    console.log('All tests completed!');

  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testAuth();
