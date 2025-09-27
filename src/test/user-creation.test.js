// Test script for user creation functionality
// Uses Node.js built-in fetch (Node 18+)

const API_BASE = 'http://localhost:3000/api';

// Test data
const testUsers = [
  {
    name: 'Valid user with email',
    data: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@test.com',
      role: 'crew',
      lang_pref: 'de'
    },
    expectedStatus: 201
  },
  {
    name: 'Valid user with phone',
    data: {
      first_name: 'Jane',
      last_name: 'Smith',
      phone: '+1234567890',
      role: 'foreman',
      lang_pref: 'en'
    },
    expectedStatus: 201
  },
  {
    name: 'Valid user with both email and phone',
    data: {
      first_name: 'Bob',
      last_name: 'Wilson',
      email: 'bob.wilson@test.com',
      phone: '+0987654321',
      role: 'pm',
      lang_pref: 'ru'
    },
    expectedStatus: 201
  },
  {
    name: 'Invalid user - no email or phone',
    data: {
      first_name: 'Invalid',
      last_name: 'User',
      role: 'crew'
    },
    expectedStatus: 400
  },
  {
    name: 'Invalid user - missing first name',
    data: {
      last_name: 'NoFirstName',
      email: 'no.firstname@test.com',
      role: 'crew'
    },
    expectedStatus: 400
  },
  {
    name: 'Invalid user - missing last name',
    data: {
      first_name: 'NoLastName',
      email: 'no.lastname@test.com',
      role: 'crew'
    },
    expectedStatus: 400
  }
];

async function createUser(userData) {
  try {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    return {
      status: response.status,
      data: response.status < 400 ? await response.json() : await response.text()
    };
  } catch (error) {
    console.error('Network error:', error.message);
    return {
      status: 500,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('🚀 Starting User Creation Tests\n');

  let passed = 0;
  let failed = 0;

  for (const test of testUsers) {
    console.log(`📝 Testing: ${test.name}`);
    console.log(`   Data:`, JSON.stringify(test.data, null, 2));

    const result = await createUser(test.data);

    if (result.status === test.expectedStatus) {
      console.log(`   ✅ PASS - Status: ${result.status}`);
      if (result.status === 201) {
        console.log(`   📋 Created user: ${result.data.first_name} ${result.data.last_name} (ID: ${result.data.id})`);
        console.log(`   🔐 PIN: ${result.data.pin_code}`);
      }
      passed++;
    } else {
      console.log(`   ❌ FAIL - Expected: ${test.expectedStatus}, Got: ${result.status}`);
      console.log(`   📄 Response:`, result.data || result.error);
      failed++;
    }

    console.log('');
  }

  console.log(`📊 Test Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! User creation functionality is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the API implementation.');
    process.exit(1);
  }
}

// Cleanup function to remove test users
async function cleanupTestUsers() {
  console.log('\n🧹 Cleaning up test users...');

  try {
    // Get all users
    const response = await fetch(`${API_BASE}/users?page=1&per_page=100`);
    const data = await response.json();

    if (data.items) {
      const testUserEmails = ['john.doe@test.com', 'bob.wilson@test.com', 'no.firstname@test.com', 'no.lastname@test.com'];
      const testUserPhones = ['+1234567890', '+0987654321'];

      for (const user of data.items) {
        if (testUserEmails.includes(user.email) || testUserPhones.includes(user.phone)) {
          const deleteResponse = await fetch(`${API_BASE}/users/${user.id}`, {
            method: 'DELETE'
          });

          if (deleteResponse.ok) {
            console.log(`   🗑️  Deleted test user: ${user.first_name} ${user.last_name}`);
          }
        }
      }
    }
  } catch (error) {
    console.log(`   ⚠️  Cleanup warning: ${error.message}`);
  }
}

// Run tests
runTests().then(() => {
  return cleanupTestUsers();
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});