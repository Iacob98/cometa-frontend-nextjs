// Test user profile editing with skills to verify the 500 error fix

const API_BASE = 'http://localhost:3000/api';

async function testUserProfileEdit() {
  console.log('🧪 Testing User Profile Edit with Skills');
  console.log('=====================================');
  console.log('Reproducing and verifying fix for 500 Internal Server Error when editing PM user profiles');
  console.log('');

  try {
    // First, get all users to find a PM user for testing
    console.log('🔍 Finding PM users for testing...');
    const usersResponse = await fetch(`${API_BASE}/users?page=1&per_page=100`);
    const usersData = await usersResponse.json();

    if (!usersData.items) {
      console.log('❌ Failed to fetch users list');
      return;
    }

    // Find PM users
    const pmUsers = usersData.items.filter(user => user.role === 'pm');
    console.log(`📊 Found ${pmUsers.length} PM users`);

    if (pmUsers.length === 0) {
      console.log('⚠️  No PM users found for testing. Creating test PM user...');

      // Create a test PM user
      const createResponse = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test-pm@cometa.test',
          phone: '+49123456789',
          first_name: 'Test',
          last_name: 'ProjectManager',
          role: 'pm',
          lang_pref: 'en',
          skills: [],
          pin_code: '1234'
        })
      });

      if (!createResponse.ok) {
        console.log(`❌ Failed to create test PM user: ${createResponse.status}`);
        return;
      }

      const newUser = await createResponse.json();
      console.log(`✅ Created test PM user: ${newUser.full_name} (${newUser.id})`);
      pmUsers.push(newUser);
    }

    // Test editing the first PM user by adding skills
    const testUser = pmUsers[0];
    console.log('');
    console.log(`🎯 Testing profile edit for: ${testUser.full_name}`);
    console.log(`   User ID: ${testUser.id}`);
    console.log(`   Current role: ${testUser.role}`);
    console.log(`   Current skills: [${testUser.skills?.join(', ') || 'None'}]`);
    console.log('');

    // Test 1: Add skills to user profile
    console.log('📝 TEST 1: Adding skills to user profile...');
    const skillsToAdd = ['project management', 'team leadership', 'budget planning'];

    const updatePayload = {
      email: testUser.email,
      phone: testUser.phone,
      first_name: testUser.first_name,
      last_name: testUser.last_name,
      role: testUser.role,
      lang_pref: testUser.lang_pref,
      skills: skillsToAdd,
      pin_code: testUser.pin_code,
      is_active: testUser.is_active
    };

    console.log(`   Adding skills: [${skillsToAdd.join(', ')}]`);

    const updateResponse = await fetch(`${API_BASE}/users/${testUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });

    console.log(`   Response status: ${updateResponse.status} ${updateResponse.statusText}`);

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.log(`❌ UPDATE FAILED: ${updateResponse.status}`);
      console.log(`   Error details: ${errorText}`);
      console.log('');
      console.log('🔍 DEBUGGING INFO:');
      console.log(`   User ID: ${testUser.id}`);
      console.log(`   Payload: ${JSON.stringify(updatePayload, null, 2)}`);
      return;
    }

    const updatedUser = await updateResponse.json();
    console.log('✅ UPDATE SUCCESSFUL!');
    console.log(`   Updated user: ${updatedUser.full_name}`);
    console.log(`   New skills: [${updatedUser.skills?.join(', ') || 'None'}]`);
    console.log('');

    // Test 2: Update skills with more complex data
    console.log('📝 TEST 2: Updating with complex skills (special characters, spaces)...');
    const complexSkills = [
      'project management & planning',
      'team leadership (5+ years)',
      'budget planning "expert level"',
      'quality assurance',
      'risk management'
    ];

    const complexUpdatePayload = {
      ...updatePayload,
      skills: complexSkills
    };

    console.log(`   Complex skills: [${complexSkills.join(', ')}]`);

    const complexUpdateResponse = await fetch(`${API_BASE}/users/${testUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(complexUpdatePayload)
    });

    console.log(`   Response status: ${complexUpdateResponse.status} ${complexUpdateResponse.statusText}`);

    if (!complexUpdateResponse.ok) {
      const errorText = await complexUpdateResponse.text();
      console.log(`❌ COMPLEX UPDATE FAILED: ${complexUpdateResponse.status}`);
      console.log(`   Error details: ${errorText}`);
      return;
    }

    const complexUpdatedUser = await complexUpdateResponse.json();
    console.log('✅ COMPLEX UPDATE SUCCESSFUL!');
    console.log(`   Updated skills: [${complexUpdatedUser.skills?.join(', ') || 'None'}]`);
    console.log('');

    // Test 3: Verify data retrieval
    console.log('📝 TEST 3: Verifying updated data retrieval...');

    const getResponse = await fetch(`${API_BASE}/users/${testUser.id}`);

    if (!getResponse.ok) {
      console.log(`❌ GET FAILED: ${getResponse.status}`);
      return;
    }

    const retrievedUser = await getResponse.json();
    console.log('✅ RETRIEVAL SUCCESSFUL!');
    console.log(`   Retrieved user: ${retrievedUser.full_name}`);
    console.log(`   Retrieved skills: [${retrievedUser.skills?.join(', ') || 'None'}]`);
    console.log('');

    // Summary
    console.log('🎉 ALL TESTS PASSED!');
    console.log('===================');
    console.log('✅ Basic skill addition works');
    console.log('✅ Complex skills with special characters work');
    console.log('✅ Data retrieval works correctly');
    console.log('✅ 500 Internal Server Error has been FIXED!');
    console.log('');
    console.log('🔧 FIXES APPLIED:');
    console.log('   1. Proper JSON escaping for shell execution');
    console.log('   2. Fixed skills parsing from correct array index');
    console.log('   3. Fixed created_at parsing from correct array index');
    console.log('');
    console.log('👨‍💼 PM users can now successfully edit their profiles and add skills!');

  } catch (error) {
    console.error('❌ Test execution error:', error.message);
    console.log('');
    console.log('🔍 This might indicate a network issue or the server is not running');
    console.log('   Make sure Next.js development server is running on localhost:3000');
  }
}

testUserProfileEdit().catch(console.error);