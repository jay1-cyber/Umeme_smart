// Debug script to check user with meter 55555
require('dotenv').config();
const { db } = require('./firebase');

async function debugUser() {
  console.log('\n=== Debugging User 55555 ===\n');
  
  try {
    // Check all users
    console.log('1. Fetching all users...');
    const usersRef = db.ref('users');
    const snapshot = await usersRef.once('value');
    
    if (!snapshot.exists()) {
      console.log('❌ No users found in database!');
      console.log('\n💡 Solution: Register user first via frontend or API');
      process.exit(1);
    }
    
    const users = snapshot.val();
    console.log(`✅ Found ${Object.keys(users).length} users in database\n`);
    
    // Find user with meter 55555
    console.log('2. Looking for meter 55555...');
    let foundUser = null;
    let foundUserId = null;
    
    for (const userId in users) {
      const user = users[userId];
      console.log(`   - User ${userId}: meter_no="${user.meter_no}", name="${user.name}"`);
      
      if (user.meter_no === '55555') {
        foundUser = user;
        foundUserId = userId;
      }
    }
    
    if (!foundUser) {
      console.log('\n❌ User with meter_no "55555" NOT FOUND!');
      console.log('\n💡 Solution: Register user with:');
      console.log(`
curl -X POST http://localhost:3000/users \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Test User",
    "email": "test55555@example.com",
    "meter_no": "55555",
    "phone_number": "+254700000000"
  }'
      `);
      process.exit(1);
    }
    
    console.log('\n✅ User with meter 55555 FOUND!');
    console.log('════════════════════════════════');
    console.log(`User ID: ${foundUserId}`);
    console.log(`Name: ${foundUser.name}`);
    console.log(`Email: ${foundUser.email}`);
    console.log(`Phone: ${foundUser.phone_number}`);
    console.log(`Meter: ${foundUser.meter_no}`);
    console.log(`Balance: ${foundUser.balance || 0} units`);
    console.log('════════════════════════════════\n');
    
    // Check transactions
    console.log('3. Checking transactions for meter 55555...');
    const transRef = db.ref('transactions');
    const transSnap = await transRef.orderByChild('meter_no').equalTo('55555').once('value');
    
    if (!transSnap.exists()) {
      console.log('⚠️  No transactions found for meter 55555');
      console.log('\n💡 Make a payment first:');
      console.log(`
curl -X POST http://localhost:3000/daraja/simulate \\
  -H "Content-Type: application/json" \\
  -d '{"meter_no": "55555", "amount": 100}'
      `);
    } else {
      const transactions = transSnap.val();
      const transCount = Object.keys(transactions).length;
      console.log(`✅ Found ${transCount} transaction(s) for meter 55555\n`);
      
      for (const transId in transactions) {
        const trans = transactions[transId];
        console.log(`   Transaction ${transId}:`);
        console.log(`   - Amount: KSh ${trans.amount}`);
        console.log(`   - Units: ${trans.units}`);
        console.log(`   - Status: ${trans.status}`);
        console.log(`   - Time: ${trans.timestamp}\n`);
      }
    }
    
    // Check meters collection
    console.log('4. Checking meters collection...');
    const meterSnap = await db.ref(`meters/55555`).once('value');
    
    if (!meterSnap.exists()) {
      console.log('⚠️  Meter 55555 not in meters collection');
      console.log('   (Will be created on first consumption report)');
    } else {
      const meterData = meterSnap.val();
      console.log('✅ Meter data:');
      console.log(`   - Balance: ${meterData.balance || 0} units`);
      console.log(`   - Total Consumed: ${meterData.total_consumed || 0} units`);
      console.log(`   - Status: ${meterData.status?.status || 'unknown'}`);
    }
    
    console.log('\n=== Summary ===');
    console.log(`User exists: ✅`);
    console.log(`Name: ${foundUser.name}`);
    console.log(`Phone: ${foundUser.phone_number}`);
    console.log(`Balance: ${foundUser.balance || 0} units`);
    console.log('\n💡 Next steps:');
    console.log('1. If balance is 0, make a payment');
    console.log('2. Upload ESP32 code with meter_no = "55555"');
    console.log('3. ESP32 should fetch user info automatically\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

debugUser();
