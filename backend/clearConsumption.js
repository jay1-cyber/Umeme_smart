const { db } = require('./firebase');

/**
 * Clear all unit consumption records for a user
 * This will reset consumed units to 0, making balance = purchased units
 */
async function clearConsumption(userId) {
  try {
    console.log(`Clearing consumption history for user: ${userId}`);
    
    // Get all consumption records for this user
    const consumptionRef = db.ref('unit_consumption');
    const snapshot = await consumptionRef.orderByChild('user_id').equalTo(userId).once('value');
    
    if (!snapshot.exists()) {
      console.log('No consumption records found');
      return;
    }
    
    const consumptions = snapshot.val();
    const consumptionIds = Object.keys(consumptions);
    
    console.log(`Found ${consumptionIds.length} consumption records`);
    
    // Delete all consumption records
    const deletePromises = consumptionIds.map(id => 
      db.ref(`unit_consumption/${id}`).remove()
    );
    
    await Promise.all(deletePromises);
    console.log(`✅ Cleared ${consumptionIds.length} consumption records`);
    
    // Recalculate balance
    const { calculateAvailableUnits } = require('./transactions');
    const newBalance = await calculateAvailableUnits(userId);
    
    // Update user balance
    await db.ref(`users/${userId}`).update({ balance: newBalance });
    console.log(`✅ Updated user balance to: ${newBalance} units`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run with user ID
const userId = process.argv[2] || '-OcEgAb2iCzRn32GUzcc';
clearConsumption(userId);
