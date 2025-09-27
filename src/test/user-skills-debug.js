// Debug test for skills issue with unique emails

const API_BASE = 'http://localhost:3000/api';

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

async function testSkillsIssue() {
  const timestamp = Date.now();

  console.log('🧪 Testing Skills Issue Debug\n');

  // Test 1: User without skills
  console.log('📝 Test 1: User without skills');
  const noSkillsResult = await createUser({
    first_name: 'NoSkills',
    last_name: 'Test',
    email: `noskills-${timestamp}@test.com`,
    role: 'crew',
    lang_pref: 'de',
    skills: []
  });
  console.log('Result:', noSkillsResult.status, noSkillsResult.data);
  console.log('');

  // Test 2: User with skills
  console.log('📝 Test 2: User with skills');
  const withSkillsResult = await createUser({
    first_name: 'WithSkills',
    last_name: 'Test',
    email: `withskills-${timestamp}@test.com`,
    role: 'crew',
    lang_pref: 'de',
    skills: ['Electrical Installation', 'Fiber Optic Splicing']
  });
  console.log('Result:', withSkillsResult.status, withSkillsResult.data);
  console.log('');

  if (noSkillsResult.status === 201 && withSkillsResult.status === 201) {
    console.log('✅ Both tests passed - skills issue is fixed!');
    console.log(`📊 NoSkills user skills: [${noSkillsResult.data.skills.join(', ')}]`);
    console.log(`📊 WithSkills user skills: [${withSkillsResult.data.skills.join(', ')}]`);
  } else if (noSkillsResult.status === 201 && withSkillsResult.status !== 201) {
    console.log('🚨 CONFIRMED: Skills cause user creation to fail!');
    console.log('User without skills: SUCCESS');
    console.log('User with skills: FAILED');
  } else {
    console.log('❌ Both tests failed - there may be a different issue');
  }
}

testSkillsIssue().catch(console.error);