const { db } = require('./firebase');

/**
 * Reset user balance to 0
 * This sets a clean starting point
 */
async function resetBalance(userId) {
  try {
    console.log(`Resetting balance for user: ${userId}`);
    
    // Set balance to 0
    await db.ref(`users/${userId}/balance`).set(0);
    console.log(`✅ Balance reset to 0`);
    
    // Also update meter balance if exists
    const userSnap = await db.ref(`users/${userId}`).once('value');
    const userData = userSnap.val();
    
    if (userData && userData.meter_no) {
      await db.ref(`meters/${userData.meter_no}/balance`).set(0);
      console.log(`✅ Meter ${userData.meter_no} balance reset to 0`);
    }
    
    console.log(`\n✅ Reset complete! User can now start fresh.`);
    console.log(`Next payment will add exactly the purchased units.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run with user ID
const userId = process.argv[2] || '-OcEgAb2iCzRn32GUzcc';
resetBalance(userId);
