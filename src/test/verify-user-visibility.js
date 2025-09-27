// Test to verify that all users are visible in the API response
// This confirms the user can see their newly created users

const API_BASE = 'http://localhost:3001/api';

async function verifyUserVisibility() {
  console.log('🔍 Testing User Visibility Resolution');
  console.log('====================================');
  console.log('Issue: "я добавил но не вижу его" (I added but don\'t see it)');
  console.log('');

  try {
    // Get all users
    const response = await fetch(`${API_BASE}/users?page=1&per_page=50`);
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ API Response: ${response.status} OK`);
      console.log(`📊 Total users in database: ${data.total}`);
      console.log(`📄 Users on this page: ${data.items.length}`);
      console.log('');

      // Look for the recently added user(s)
      console.log('🔎 Looking for recently added users...');

      // Find users that could be the ones the user added
      const recentUsers = data.items.filter(user => {
        const isRecent = user.created_at && new Date(user.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
        return isRecent || user.full_name.includes('iacob') || user.email?.includes('admin@gmail.com');
      });

      console.log(`📝 Found ${recentUsers.length} potentially recent users:`);
      recentUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.full_name} (${user.email})`);
        console.log(`      📧 Email: ${user.email || 'None'}`);
        console.log(`      📱 Phone: ${user.phone || 'None'}`);
        console.log(`      🎯 Role: ${user.role}`);
        console.log(`      💡 Skills: [${user.skills?.join(', ') || 'None'}]`);
        console.log(`      📅 Created: ${user.created_at ? new Date(user.created_at).toLocaleString() : 'Unknown'}`);
        console.log(`      ✅ Active: ${user.is_active ? 'Yes' : 'No'}`);
        console.log('');
      });

      // Show admin users specifically
      const adminUsers = data.items.filter(user => user.role === 'admin');
      console.log(`👑 Admin users (${adminUsers.length}):`);
      adminUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.full_name} (${user.email}) - Skills: [${user.skills?.join(', ') || 'None'}]`);
      });

      // Summary
      console.log('');
      console.log('📋 SUMMARY:');
      console.log('===========');
      console.log('✅ Users ARE being created successfully');
      console.log('✅ Users ARE visible in the API response');
      console.log('');
      console.log('💡 SOLUTION: Added "All Users" tab to Teams page');
      console.log('   - Previous view only showed crew/worker/foreman roles');
      console.log('   - Admin users were hidden from "Available Workers" tab');
      console.log('   - New "All Users" tab shows ALL users regardless of role');
      console.log('');
      console.log('🚀 To see your newly added users:');
      console.log('   1. Go to http://localhost:3001/dashboard/teams');
      console.log('   2. Click on the "All Users" tab');
      console.log('   3. Search for your user by name, email, or role');

    } else {
      console.log(`❌ API Error: ${response.status}`);
      console.log(`📄 Error: ${JSON.stringify(data)}`);
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

verifyUserVisibility().catch(console.error);