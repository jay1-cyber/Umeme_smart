// test-mqtt.js - MQTT Testing Script
// This script tests MQTT connectivity and message publishing/subscribing

require('dotenv').config();
const mqtt = require('mqtt');

// Configuration
const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883';
const METER_NO = 'METER001'; // Change to your meter number
const TEST_DURATION = 30000; // 30 seconds

// MQTT Topics
const topics = {
  balanceCommand: `smartmeter/${METER_NO}/command/balance`,
  consumption: `smartmeter/${METER_NO}/consumption`,
  status: `smartmeter/${METER_NO}/status`,
  balanceReport: `smartmeter/${METER_NO}/balance`
};

console.log('=== MQTT Testing Script ===\n');
console.log(`Broker: ${BROKER_URL}`);
console.log(`Meter Number: ${METER_NO}`);
console.log(`Test Duration: ${TEST_DURATION / 1000} seconds\n`);

// Create MQTT client
const client = mqtt.connect(BROKER_URL, {
  clientId: `mqtt_test_${Math.random().toString(16).substring(2, 8)}`,
  clean: true,
  connectTimeout: 4000,
  username: process.env.MQTT_USERNAME || '',
  password: process.env.MQTT_PASSWORD || '',
  reconnectPeriod: 1000,
});

let messageCount = 0;
let isConnected = false;

// Connect event
client.on('connect', () => {
  isConnected = true;
  console.log('✅ Connected to MQTT broker\n');
  
  // Subscribe to all smartmeter topics for this meter
  console.log('📡 Subscribing to topics:');
  Object.entries(topics).forEach(([name, topic]) => {
    client.subscribe(topic, (err) => {
      if (err) {
        console.error(`❌ Failed to subscribe to ${name}: ${err.message}`);
      } else {
        console.log(`   ✓ ${topic}`);
      }
    });
  });
  
  console.log('\n🎯 Running tests...\n');
  
  // Test 1: Publish balance command
  setTimeout(() => {
    console.log('Test 1: Publishing balance command...');
    const balanceMsg = {
      balance: 10.5,
      timestamp: Date.now()
    };
    client.publish(topics.balanceCommand, JSON.stringify(balanceMsg), { qos: 1 }, (err) => {
      if (err) {
        console.error('❌ Failed to publish balance command');
      } else {
        console.log('✅ Balance command published:', balanceMsg);
      }
    });
  }, 2000);
  
  // Test 2: Simulate consumption report
  setTimeout(() => {
    console.log('\nTest 2: Simulating consumption report...');
    const consumptionMsg = {
      meterNo: METER_NO,
      unitsConsumed: 0.005,
      remainingBalance: 10.495,
      totalConsumed: 0.005,
      timestamp: Date.now()
    };
    client.publish(topics.consumption, JSON.stringify(consumptionMsg), { qos: 1 }, (err) => {
      if (err) {
        console.error('❌ Failed to publish consumption');
      } else {
        console.log('✅ Consumption published:', consumptionMsg);
      }
    });
  }, 5000);
  
  // Test 3: Publish status
  setTimeout(() => {
    console.log('\nTest 3: Publishing status update...');
    const statusMsg = {
      meterNo: METER_NO,
      status: 'online',
      message: 'Test status update',
      balance: 10.495,
      wifi_rssi: -65,
      timestamp: Date.now()
    };
    client.publish(topics.status, JSON.stringify(statusMsg), { qos: 0 }, (err) => {
      if (err) {
        console.error('❌ Failed to publish status');
      } else {
        console.log('✅ Status published:', statusMsg);
      }
    });
  }, 8000);
  
  // Test 4: Wildcard subscription test
  setTimeout(() => {
    console.log('\nTest 4: Testing wildcard subscription...');
    client.subscribe('smartmeter/#', (err) => {
      if (err) {
        console.error('❌ Failed to subscribe to wildcard');
      } else {
        console.log('✅ Subscribed to smartmeter/# (all topics)');
      }
    });
  }, 11000);
  
  // End test
  setTimeout(() => {
    console.log(`\n=== Test Complete ===`);
    console.log(`Total messages received: ${messageCount}`);
    console.log('\nDisconnecting...');
    client.end();
    process.exit(0);
  }, TEST_DURATION);
});

// Message received
client.on('message', (topic, message) => {
  messageCount++;
  console.log(`\n📨 Message #${messageCount} received:`);
  console.log(`   Topic: ${topic}`);
  
  try {
    const payload = JSON.parse(message.toString());
    console.log(`   Payload:`, JSON.stringify(payload, null, 2));
  } catch (error) {
    console.log(`   Payload: ${message.toString()}`);
  }
});

// Error event
client.on('error', (error) => {
  console.error('❌ MQTT Error:', error.message);
});

// Offline event
client.on('offline', () => {
  console.log('⚠️  MQTT client is offline');
});

// Reconnect event
client.on('reconnect', () => {
  console.log('🔄 Reconnecting to MQTT broker...');
});

// Close event
client.on('close', () => {
  if (isConnected) {
    console.log('👋 Disconnected from MQTT broker');
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Interrupted. Disconnecting...');
  client.end();
  process.exit(0);
});
