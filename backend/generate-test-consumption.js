#!/usr/bin/env node

/**
 * Generate Test Consumption Data
 * Creates sample consumption records for testing the analytics chart
 */

require('dotenv').config();
const { db } = require('./firebase');

async function generateTestConsumption(userId, meterNo, hours = 24) {
  console.log(`\n📊 Generating test consumption data for user: ${userId}`);
  console.log(`Meter: ${meterNo}`);
  console.log(`Time range: Last ${hours} hours\n`);

  try {
    const consumptionRef = db.ref('unit_consumption');
    const now = new Date();
    const records = [];

    // Generate consumption records for the specified time period
    for (let i = hours - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000); // Hours ago
      
      // Simulate realistic consumption patterns
      // Higher consumption during day hours (6am-10pm), lower at night
      const hour = timestamp.getHours();
      let baseConsumption = 0.5; // Base consumption
      
      if (hour >= 6 && hour < 10) {
        baseConsumption = 1.5; // Morning peak
      } else if (hour >= 10 && hour < 17) {
        baseConsumption = 1.0; // Daytime
      } else if (hour >= 17 && hour < 22) {
        baseConsumption = 2.0; // Evening peak
      } else {
        baseConsumption = 0.3; // Night time
      }

      // Add some randomness
      const variation = (Math.random() - 0.5) * 0.5;
      const unitsConsumed = Math.max(0.1, baseConsumption + variation);

      const record = {
        user_id: userId,
        meter_no: meterNo,
        units_consumed: parseFloat(unitsConsumed.toFixed(2)),
        units_before: 100.0, // Placeholder
        units_after: 99.0, // Placeholder
        consumption_rate: 0.1,
        timestamp: timestamp.toISOString(),
        type: 'test_consumption'
      };

      records.push(record);
    }

    // Insert records into Firebase
    console.log(`Creating ${records.length} consumption records...`);
    for (const record of records) {
      const newRef = consumptionRef.push();
      await newRef.set(record);
    }

    console.log(`✅ Successfully created ${records.length} test consumption records`);
    console.log('\n📈 Summary:');
    const totalConsumed = records.reduce((sum, r) => sum + r.units_consumed, 0);
    const avgConsumption = totalConsumed / records.length;
    const maxConsumption = Math.max(...records.map(r => r.units_consumed));
    
    console.log(`   Total consumed: ${totalConsumed.toFixed(2)} units`);
    console.log(`   Average: ${avgConsumption.toFixed(2)} units/hour`);
    console.log(`   Peak: ${maxConsumption.toFixed(2)} units`);
    
    console.log('\n🎯 You can now test the consumption chart on the dashboard!\n');

  } catch (error) {
    console.error('❌ Error generating test consumption:', error.message);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('\n📋 Usage: node generate-test-consumption.js <userId> <meterNo> [hours]');
    console.log('\nExample:');
    console.log('  node generate-test-consumption.js -OcEgAb2iCzRn32GUzcc 55555 48');
    console.log('\nThis will generate consumption data for the last 48 hours');
    console.log('Default is 24 hours if not specified\n');
    
    // Try to fetch a user from the database
    console.log('🔍 Fetching available users...\n');
    try {
      const usersRef = db.ref('users');
      const snapshot = await usersRef.limitToFirst(5).once('value');
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        console.log('Available users:');
        Object.entries(users).forEach(([id, user]) => {
          console.log(`  User ID: ${id}`);
          console.log(`    Name: ${user.name}`);
          console.log(`    Meter: ${user.meter_no}`);
          console.log(`    Email: ${user.email}\n`);
        });
      } else {
        console.log('No users found in database');
      }
    } catch (error) {
      console.error('Error fetching users:', error.message);
    }
    
    process.exit(0);
  }

  const userId = args[0];
  const meterNo = args[1];
  const hours = args[2] ? parseInt(args[2]) : 24;

  if (isNaN(hours) || hours <= 0) {
    console.error('❌ Hours must be a positive number');
    process.exit(1);
  }

  await generateTestConsumption(userId, meterNo, hours);
  process.exit(0);
}

main();
