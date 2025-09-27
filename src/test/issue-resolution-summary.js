// Summary test to verify the user's reported issue is resolved
// User reported: "ошиюка в скилах если их нет то работает а если добавить ошиюка"
// Translation: "error with skills - if there are none it works but if you add skills there's an error"

const API_BASE = 'http://localhost:3000/api';

async function createUser(userData) {
  try {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    return {
      status: response.status,
      data: data
    };
  } catch (error) {
    return {
      status: 500,
      error: error.message
    };
  }
}

async function testIssueResolution() {
  const timestamp = Date.now();

  console.log('🔍 TESTING USER REPORTED ISSUE RESOLUTION');
  console.log('==========================================');
  console.log('Original issue: "ошиюка в скилах если их нет то работает а если добавить ошиюка"');
  console.log('Translation: "error with skills - if there are none it works but if you add skills there\'s an error"');
  console.log('');

  // Test 1: User WITHOUT skills (should work according to user)
  console.log('📝 Test 1: User WITHOUT skills (should work according to user report)');
  const noSkillsResult = await createUser({
    first_name: 'NoSkills',
    last_name: 'TestUser',
    email: `noskills-resolution-${timestamp}@test.com`,
    role: 'crew',
    lang_pref: 'de',
    skills: []
  });

  if (noSkillsResult.status === 201) {
    console.log('   ✅ SUCCESS - No skills user created (as expected)');
  } else {
    console.log('   ❌ FAILED - No skills user creation failed');
    console.log('   📄 Error:', noSkillsResult.data);
  }

  // Test 2: User WITH skills (was failing according to user)
  console.log('');
  console.log('📝 Test 2: User WITH skills (was failing according to user report)');
  const withSkillsResult = await createUser({
    first_name: 'WithSkills',
    last_name: 'TestUser',
    email: `withskills-resolution-${timestamp}@test.com`,
    role: 'crew',
    lang_pref: 'de',
    skills: ['Electrical Installation', 'Fiber Optic Splicing', 'Cable Management']
  });

  if (withSkillsResult.status === 201) {
    console.log('   ✅ SUCCESS - Skills user created (issue RESOLVED!)');
    console.log('   🎯 Skills properly saved:', withSkillsResult.data.skills);
  } else {
    console.log('   ❌ FAILED - Skills user creation still failing');
    console.log('   📄 Error:', withSkillsResult.data);
  }

  // Test 3: Complex real-world skills
  console.log('');
  console.log('📝 Test 3: Complex real-world skills');
  const complexSkillsResult = await createUser({
    first_name: 'ComplexSkills',
    last_name: 'TestUser',
    email: `complex-resolution-${timestamp}@test.com`,
    role: 'foreman',
    lang_pref: 'de',
    skills: [
      'Electrical Installation',
      'Fiber Optic Splicing',
      'Cable Management',
      'Equipment Operation',
      'Safety Protocols',
      'Team Leadership'
    ]
  });

  if (complexSkillsResult.status === 201) {
    console.log('   ✅ SUCCESS - Complex skills user created');
    console.log('   🎯 All skills properly saved:', complexSkillsResult.data.skills);
  } else {
    console.log('   ❌ FAILED - Complex skills user creation failed');
    console.log('   📄 Error:', complexSkillsResult.data);
  }

  console.log('');
  console.log('🏆 RESOLUTION SUMMARY:');
  console.log('=====================');

  if (noSkillsResult.status === 201 && withSkillsResult.status === 201 && complexSkillsResult.status === 201) {
    console.log('🎉 ✅ ISSUE COMPLETELY RESOLVED!');
    console.log('');
    console.log('Before fix:');
    console.log('  ❌ Users without skills: ✅ worked');
    console.log('  ❌ Users with skills: ❌ failed');
    console.log('');
    console.log('After fix:');
    console.log('  ✅ Users without skills: ✅ work');
    console.log('  ✅ Users with skills: ✅ work');
    console.log('  ✅ Complex skills: ✅ work');
    console.log('');
    console.log('🔧 Root cause: JSON escaping issue in shell command execution');
    console.log('💡 Solution: Proper escaping of quotes and special characters in skills JSON');
    console.log('');
    console.log('The user can now create workers with any skills combination! 🚀');
  } else {
    console.log('❌ ISSUE NOT FULLY RESOLVED');
    console.log('Some test cases are still failing.');
  }
}

testIssueResolution().catch(console.error);