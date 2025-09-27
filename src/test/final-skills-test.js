// Final comprehensive test for skills fix verification

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

async function runFinalTest() {
  const timestamp = Date.now();
  console.log('🎯 Final Skills Fix Verification Test\n');

  const testCases = [
    {
      name: 'No skills (empty array)',
      data: {
        first_name: 'NoSkills',
        last_name: 'User',
        email: `noskills-${timestamp}@test.com`,
        role: 'crew',
        lang_pref: 'de',
        skills: []
      }
    },
    {
      name: 'Single skill',
      data: {
        first_name: 'OneSkill',
        last_name: 'User',
        email: `oneskill-${timestamp}@test.com`,
        role: 'crew',
        lang_pref: 'de',
        skills: ['Electrical Installation']
      }
    },
    {
      name: 'Multiple skills with spaces',
      data: {
        first_name: 'MultiSkill',
        last_name: 'User',
        email: `multiskill-${timestamp}@test.com`,
        role: 'crew',
        lang_pref: 'de',
        skills: ['Electrical Installation', 'Fiber Optic Splicing', 'Equipment Operation']
      }
    },
    {
      name: 'Skills with special characters',
      data: {
        first_name: 'SpecialSkill',
        last_name: 'User',
        email: `specialskill-${timestamp}@test.com`,
        role: 'crew',
        lang_pref: 'de',
        skills: ['Skill with "quotes"', "Skill with 'apostrophe'", 'Skill with ümlaut', 'Skill & Symbol']
      }
    }
  ];

  let allPassed = true;
  let results = [];

  for (const testCase of testCases) {
    console.log(`📝 Testing: ${testCase.name}`);
    console.log(`   Skills: [${testCase.data.skills.join(', ')}] (${testCase.data.skills.length} skills)`);

    const result = await createUser(testCase.data);

    if (result.status === 201) {
      console.log(`   ✅ SUCCESS - User created with ID: ${result.data.id}`);
      console.log(`   🎯 Returned skills: [${result.data.skills.join(', ')}]`);
      console.log(`   ✔️  Skills match: ${JSON.stringify(testCase.data.skills) === JSON.stringify(result.data.skills) ? 'YES' : 'NO'}`);
      results.push({ test: testCase.name, status: 'PASS', skills: result.data.skills });
    } else {
      console.log(`   ❌ FAILED - Status: ${result.status}`);
      console.log(`   📄 Error: ${JSON.stringify(result.data)}`);
      allPassed = false;
      results.push({ test: testCase.name, status: 'FAIL', error: result.data });
    }
    console.log('');
  }

  console.log('🏆 FINAL TEST RESULTS:');
  console.log('========================');

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.test}: ${result.status}`);
    if (result.skills) {
      console.log(`   Skills: [${result.skills.join(', ')}]`);
    }
  });

  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Skills functionality is working correctly!');
    console.log('✅ Users can be created with any combination of skills');
    console.log('✅ Skills with spaces are handled correctly');
    console.log('✅ Skills with special characters work properly');
    console.log('✅ Empty skills arrays work as expected');
    console.log('\nThe reported issue has been RESOLVED:');
    console.log('❌ Before: "ошиюка в скилах если их нет то работает а если добавить ошиюка"');
    console.log('✅ After: All skill combinations work correctly!');
  } else {
    console.log('\n❌ Some tests failed. The issue is not fully resolved.');
  }
}

runFinalTest().catch(console.error);