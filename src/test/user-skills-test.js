// Test script specifically for skills-related user creation issue
// Tests the reported issue: "ошиюка в скилах если их нет то работает а если добавить ошиюка"

const API_BASE = 'http://localhost:3000/api';

// Test data for skills testing
const testCases = [
  {
    name: 'User without skills (should work)',
    data: {
      first_name: 'NoSkills',
      last_name: 'User',
      email: 'noskills@test.com',
      role: 'crew',
      lang_pref: 'de',
      skills: []
    },
    expectedStatus: 201
  },
  {
    name: 'User with one skill (reported to fail)',
    data: {
      first_name: 'OneSkill',
      last_name: 'User',
      email: 'oneskill@test.com',
      role: 'crew',
      lang_pref: 'de',
      skills: ['Electrical Installation']
    },
    expectedStatus: 201
  },
  {
    name: 'User with multiple skills (reported to fail)',
    data: {
      first_name: 'MultiSkill',
      last_name: 'User',
      email: 'multiskill@test.com',
      role: 'crew',
      lang_pref: 'de',
      skills: ['Electrical Installation', 'Fiber Optic Splicing', 'Equipment Operation']
    },
    expectedStatus: 201
  },
  {
    name: 'User with skills containing special characters',
    data: {
      first_name: 'SpecialSkill',
      last_name: 'User',
      email: 'specialskill@test.com',
      role: 'crew',
      lang_pref: 'de',
      skills: ['Skill with "quotes"', "Skill with 'apostrophe'", 'Skill with ümlaut']
    },
    expectedStatus: 201
  }
];

async function createUser(userData) {
  try {
    console.log('📤 Sending request:', JSON.stringify(userData, null, 2));

    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const responseText = await response.text();
    console.log('📥 Raw response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = responseText;
    }

    return {
      status: response.status,
      data: data
    };
  } catch (error) {
    console.error('Network error:', error.message);
    return {
      status: 500,
      error: error.message
    };
  }
}

async function deleteTestUser(email) {
  try {
    // First get the user ID
    const response = await fetch(`${API_BASE}/users?page=1&per_page=100`);
    const data = await response.json();

    if (data.items) {
      const user = data.items.find(u => u.email === email);
      if (user) {
        const deleteResponse = await fetch(`${API_BASE}/users/${user.id}`, {
          method: 'DELETE'
        });
        if (deleteResponse.ok) {
          console.log(`🗑️  Deleted test user: ${email}`);
        }
      }
    }
  } catch (error) {
    console.log(`⚠️  Could not delete ${email}: ${error.message}`);
  }
}

async function runSkillsTests() {
  console.log('🧪 Starting Skills-Specific User Creation Tests\n');
  console.log('Testing the reported issue: skills cause user creation to fail\n');

  // Clean up any existing test users first
  console.log('🧹 Cleaning up existing test users...');
  for (const testCase of testCases) {
    await deleteTestUser(testCase.data.email);
  }
  console.log('');

  let passed = 0;
  let failed = 0;
  let skillsRelatedFailures = 0;

  for (const test of testCases) {
    console.log(`📝 Testing: ${test.name}`);
    console.log(`   Email: ${test.data.email}`);
    console.log(`   Skills: [${test.data.skills.join(', ')}] (${test.data.skills.length} skills)`);

    const result = await createUser(test.data);

    if (result.status === test.expectedStatus) {
      console.log(`   ✅ PASS - Status: ${result.status}`);
      if (result.status === 201) {
        console.log(`   📋 Created user: ${result.data.first_name} ${result.data.last_name} (ID: ${result.data.id})`);
        console.log(`   🎯 Skills in response: [${result.data.skills.join(', ')}]`);
      }
      passed++;
    } else {
      console.log(`   ❌ FAIL - Expected: ${test.expectedStatus}, Got: ${result.status}`);
      console.log(`   📄 Response:`, result.data || result.error);

      // Check if this is a skills-related failure
      if (test.data.skills.length > 0) {
        skillsRelatedFailures++;
        console.log(`   🚨 SKILLS-RELATED FAILURE DETECTED`);
      }

      failed++;
    }

    console.log('');
  }

  console.log(`📊 Skills Test Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   🎯 Skills-related failures: ${skillsRelatedFailures}`);
  console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (skillsRelatedFailures > 0) {
    console.log(`\n🚨 CONFIRMED: Skills cause user creation to fail!`);
    console.log(`   ${skillsRelatedFailures} out of ${testCases.filter(t => t.data.skills.length > 0).length} tests with skills failed.`);
    console.log(`   This matches the reported issue: "ошиюка в скилах если их нет то работает а если добавить ошиюка"`);
  } else if (failed === 0) {
    console.log(`\n🎉 All tests passed! Skills issue appears to be resolved.`);
  } else {
    console.log(`\n⚠️  Some tests failed, but not specifically skills-related.`);
  }

  // Cleanup after tests
  console.log('\n🧹 Cleaning up test users...');
  for (const testCase of testCases) {
    await deleteTestUser(testCase.data.email);
  }
}

// Run the skills-specific tests
runSkillsTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});