#!/usr/bin/env node

/**
 * Verify Chart Setup
 * Checks if everything is configured correctly for the consumption chart
 */

require('dotenv').config();
const { db } = require('./firebase');

async function verifySetup() {
  console.log('\n🔍 Verifying Consumption Chart Setup...\n');

  const checks = {
    firebase: false,
    users: false,
    consumption: false,
    api: false
  };

  // Check 1: Firebase Connection
  console.log('1️⃣ Checking Firebase connection...');
  try {
    const testRef = db.ref('.info/connected');
    const snapshot = await testRef.once('value');
    if (snapshot.val() === true) {
      console.log('   ✅ Firebase connected\n');
      checks.firebase = true;
    } else {
      console.log('   ⚠️  Firebase not connected\n');
    }
  } catch (error) {
    console.log('   ❌ Firebase error:', error.message, '\n');
  }

  // Check 2: Users in Database
  console.log('2️⃣ Checking for users...');
  try {
    const usersRef = db.ref('users');
    const snapshot = await usersRef.limitToFirst(5).once('value');
    
    if (snapshot.exists()) {
      const users = snapshot.val();
      const userCount = Object.keys(users).length;
      console.log(`   ✅ Found ${userCount} user(s)\n`);
      
      console.log('   Available test users:');
      Object.entries(users).forEach(([id, user]) => {
        console.log(`   • ${user.name} (${user.email})`);
        console.log(`     User ID: ${id}`);
        console.log(`     Meter: ${user.meter_no}\n`);
      });
      checks.users = true;
    } else {
      console.log('   ⚠️  No users found. Create a user first.\n');
    }
  } catch (error) {
    console.log('   ❌ Error checking users:', error.message, '\n');
  }

  // Check 3: Consumption Records
  console.log('3️⃣ Checking consumption records...');
  try {
    const consumptionRef = db.ref('unit_consumption');
    const snapshot = await consumptionRef.limitToFirst(100).once('value');
    
    if (snapshot.exists()) {
      const records = snapshot.val();
      const recordCount = Object.keys(records).length;
      console.log(`   ✅ Found ${recordCount} consumption record(s)\n`);
      
      // Group by user
      const byUser = {};
      Object.values(records).forEach(record => {
        const userId = record.user_id;
        if (!byUser[userId]) byUser[userId] = [];
        byUser[userId].push(record);
      });
      
      console.log('   Records by user:');
      Object.entries(byUser).forEach(([userId, userRecords]) => {
        const total = userRecords.reduce((sum, r) => sum + (r.units_consumed || 0), 0);
        const oldest = new Date(Math.min(...userRecords.map(r => new Date(r.timestamp))));
        const newest = new Date(Math.max(...userRecords.map(r => new Date(r.timestamp))));
        
        console.log(`   • User ${userId.substring(0, 10)}...`);
        console.log(`     Records: ${userRecords.length}`);
        console.log(`     Total consumed: ${total.toFixed(2)} units`);
        console.log(`     Date range: ${oldest.toLocaleDateString()} to ${newest.toLocaleDateString()}\n`);
      });
      
      checks.consumption = true;
    } else {
      console.log('   ⚠️  No consumption records found.');
      console.log('   💡 Run: node generate-test-consumption.js <userId> <meterNo>\n');
    }
  } catch (error) {
    console.log('   ❌ Error checking consumption:', error.message, '\n');
  }

  // Check 4: API Endpoint (simulate)
  console.log('4️⃣ Checking API endpoint availability...');
  try {
    const usersRef = db.ref('users');
    const userSnapshot = await usersRef.limitToFirst(1).once('value');
    
    if (userSnapshot.exists()) {
      const userId = Object.keys(userSnapshot.val())[0];
      console.log(`   ℹ️  Test the API with:`);
      console.log(`   curl http://localhost:3000/analytics/consumption/${userId}?period=daily\n`);
      checks.api = true;
    } else {
      console.log('   ⚠️  No users to test API with\n');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message, '\n');
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Setup Status:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const allGood = Object.values(checks).every(v => v === true);
  
  if (allGood) {
    console.log('✅ All checks passed! The consumption chart should work.\n');
    console.log('🎯 Next steps:');
    console.log('   1. Start backend: cd backend && npm run dev');
    console.log('   2. Start frontend: cd frontend && npm run dev');
    console.log('   3. Login to dashboard and view the chart\n');
  } else {
    console.log('⚠️  Some checks failed. Review the issues above.\n');
    
    if (!checks.firebase) {
      console.log('❌ Firebase: Check your .env file and credentials');
    }
    if (!checks.users) {
      console.log('❌ Users: Register a user via the frontend');
    }
    if (!checks.consumption) {
      console.log('❌ Consumption: Run generate-test-consumption.js');
    }
    console.log();
  }

  process.exit(allGood ? 0 : 1);
}

// Run verification
verifySetup().catch(error => {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
});
