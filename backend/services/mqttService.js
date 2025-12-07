// services/mqttService.js
const mqtt = require('mqtt');
const { db } = require('../firebase');

class MQTTService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.subscribers = new Map();
  }

  /**
   * Initialize MQTT broker connection
   * You can use a cloud MQTT broker like HiveMQ, EMQX, or Mosquitto
   */
  connect() {
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883';
    const options = {
      clientId: `smart_meter_backend_${Math.random().toString(16).substring(2, 8)}`,
      clean: true,
      connectTimeout: 4000,
      username: process.env.MQTT_USERNAME || '',
      password: process.env.MQTT_PASSWORD || '',
      reconnectPeriod: 1000,
    };

    console.log(`[MQTT] Connecting to broker: ${brokerUrl}`);
    this.client = mqtt.connect(brokerUrl, options);

    this.client.on('connect', () => {
      this.isConnected = true;
      console.log('[MQTT] Connected to broker successfully');
      
      // Subscribe to all meter balance updates from ESP32 devices
      this.subscribe('smartmeter/+/balance', this.handleBalanceUpdate.bind(this));
      
      // Subscribe to consumption reports
      this.subscribe('smartmeter/+/consumption', this.handleConsumption.bind(this));
      
      // Subscribe to ESP32 status updates
      this.subscribe('smartmeter/+/status', this.handleStatus.bind(this));
    });

    this.client.on('error', (error) => {
      console.error('[MQTT] Connection error:', error.message);
      this.isConnected = false;
    });

    this.client.on('offline', () => {
      console.log('[MQTT] Client is offline');
      this.isConnected = false;
    });

    this.client.on('reconnect', () => {
      console.log('[MQTT] Attempting to reconnect...');
    });

    this.client.on('message', (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        console.log(`[MQTT] Received message on ${topic}:`, payload);
        
        // Call registered handlers
        const handlers = this.subscribers.get(topic);
        if (handlers) {
          handlers.forEach(handler => handler(topic, payload));
        }
        
        // Check wildcard subscriptions
        this.subscribers.forEach((handlers, pattern) => {
          if (this.matchTopic(pattern, topic)) {
            handlers.forEach(handler => handler(topic, payload));
          }
        });
      } catch (error) {
        console.error('[MQTT] Error processing message:', error.message);
      }
    });

    return this.client;
  }

  /**
   * Subscribe to a topic with a handler
   */
  subscribe(topic, handler) {
    if (!this.client) {
      throw new Error('MQTT client not initialized');
    }

    this.client.subscribe(topic, (err) => {
      if (err) {
        console.error(`[MQTT] Failed to subscribe to ${topic}:`, err.message);
      } else {
        console.log(`[MQTT] Subscribed to topic: ${topic}`);
      }
    });

    // Store handler
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    this.subscribers.get(topic).push(handler);
  }

  /**
   * Publish a message to a topic
   */
  publish(topic, message, options = {}) {
    if (!this.client || !this.isConnected) {
      console.error('[MQTT] Cannot publish - client not connected');
      return false;
    }

    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    
    this.client.publish(topic, payload, { qos: options.qos || 1, retain: options.retain || false }, (err) => {
      if (err) {
        console.error(`[MQTT] Failed to publish to ${topic}:`, err.message);
      } else {
        console.log(`[MQTT] Published to ${topic}:`, message);
      }
    });

    return true;
  }

  /**
   * Handle balance update from ESP32
   */
  async handleBalanceUpdate(topic, payload) {
    try {
      const { meterNo, balance, timestamp } = payload;
      console.log(`[MQTT] Balance update from ESP32 - Meter: ${meterNo}, Balance: ${balance}`);
      
      // Update last_seen timestamp to track meter connectivity
      await db.ref(`meters/${meterNo}/last_seen`).set(Date.now());
      await db.ref(`meters/${meterNo}/online`).set(true);
      
      // This is informational - ESP32 reporting its local balance
      // No action needed unless you want to log it
    } catch (error) {
      console.error('[MQTT] Error handling balance update:', error.message);
    }
  }

  /**
   * Handle consumption report from ESP32
   */
  async handleConsumption(topic, payload) {
    try {
      const { meterNo, unitsConsumed, remainingBalance, totalConsumed, timestamp } = payload;
      console.log(`[MQTT] Consumption report - Meter: ${meterNo}, Consumed: ${unitsConsumed}, Remaining: ${remainingBalance}, Total: ${totalConsumed}`);
      
      // Find user by meter number
      const usersRef = db.ref('users');
      const usersSnapshot = await usersRef.once('value');
      const users = usersSnapshot.val();
      
      let userId = null;
      let meterData = null;
      
      // Find user with this meter number
      for (const uid in users) {
        if (users[uid].meter_no === meterNo) {
          userId = uid;
          break;
        }
      }
      
      if (!userId) {
        console.log(`[MQTT] No user found for meter ${meterNo}, creating meter entry`);
      }
      
      // Update balance in Firebase by DECREMENTING consumed units
      if (userId && unitsConsumed > 0) {
        // Get current balance from Firebase (source of truth)
        const userBalanceRef = db.ref(`users/${userId}/balance`);
        const currentBalanceSnap = await userBalanceRef.once('value');
        const currentBalance = parseFloat(currentBalanceSnap.val() || 0);
        
        // Calculate new balance (don't trust ESP32's calculation)
        const newBalance = Math.max(0, parseFloat((currentBalance - unitsConsumed).toFixed(2)));
        
        // Update Firebase
        await userBalanceRef.set(newBalance);
        console.log(`[MQTT] 💰 Balance updated: ${currentBalance} - ${unitsConsumed} = ${newBalance} units`);
        console.log(`[MQTT] ✓ Updated user ${userId} balance: ${newBalance}`);
        
        // Send updated balance back to ESP32
        await this.sendBalanceToESP32(meterNo, newBalance);
        console.log(`[MQTT] 📤 Sent corrected balance to ESP32: ${newBalance}`);
      }
      
      // Update meter balance (create if doesn't exist)
      if (userId) {
        const finalBalance = await db.ref(`users/${userId}/balance`).once('value');
        await db.ref(`meters/${meterNo}/balance`).set(parseFloat(finalBalance.val() || 0));
        await db.ref(`meters/${meterNo}/user_id`).set(userId);
      }
      await db.ref(`meters/${meterNo}/last_update`).set(timestamp || Date.now());
      await db.ref(`meters/${meterNo}/last_seen`).set(Date.now());
      await db.ref(`meters/${meterNo}/online`).set(true);
      await db.ref(`meters/${meterNo}/total_consumed`).set(parseFloat(totalConsumed || 0));
      console.log(`[MQTT] ✓ Updated meter ${meterNo} records`);
      
      // Log consumption with more details
      if (unitsConsumed > 0 && userId) {
        // Get the actual balance after consumption
        const actualBalanceSnap = await db.ref(`users/${userId}/balance`).once('value');
        const actualBalance = parseFloat(actualBalanceSnap.val() || 0);
        
        const logRef = db.ref('unit_consumption').push();
        await logRef.set({
          user_id: userId,
          meter_no: meterNo,
          units_consumed: parseFloat(unitsConsumed),
          units_after: actualBalance,  // Use actual balance from Firebase, not ESP32
          total_consumed: parseFloat(totalConsumed || 0),
          timestamp: timestamp || Date.now(),
          source: 'mqtt',
          date: new Date(timestamp || Date.now()).toISOString()
        });
        console.log(`[MQTT] ✓ Logged consumption to database`);
      }
      
      console.log(`[MQTT] ✅ Real-time update complete for meter ${meterNo}`);
    } catch (error) {
      console.error('[MQTT] Error handling consumption:', error.message);
      console.error('[MQTT] Stack:', error.stack);
    }
  }

  /**
   * Handle ESP32 status updates
   */
  async handleStatus(topic, payload) {
    try {
      const { meterNo, status, message } = payload;
      console.log(`[MQTT] Status update - Meter: ${meterNo}, Status: ${status}, Message: ${message}`);
      
      // Update meter status in Firebase
      await db.ref(`meters/${meterNo}/status`).set({
        status,
        message,
        last_seen: Date.now()
      });
    } catch (error) {
      console.error('[MQTT] Error handling status:', error.message);
    }
  }

  /**
   * Send balance update to ESP32
   */
  sendBalanceToESP32(meterNo, balance) {
    const topic = `smartmeter/${meterNo}/command/balance`;
    const message = {
      balance: parseFloat(balance),
      timestamp: Date.now()
    };
    
    return this.publish(topic, message, { qos: 1 });
  }

  /**
   * Alias for sendBalanceToESP32 (for backward compatibility)
   */
  sendBalanceUpdate(meterNo, balance) {
    return this.sendBalanceToESP32(meterNo, balance);
  }

  /**
   * Send command to ESP32
   */
  sendCommand(meterNo, command, data = {}) {
    const topic = `smartmeter/${meterNo}/command/${command}`;
    const message = {
      ...data,
      timestamp: Date.now()
    };
    
    return this.publish(topic, message, { qos: 1 });
  }

  /**
   * Match wildcard MQTT topics
   */
  matchTopic(pattern, topic) {
    const patternParts = pattern.split('/');
    const topicParts = topic.split('/');
    
    if (patternParts.length !== topicParts.length) return false;
    
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] !== '+' && patternParts[i] !== '#' && patternParts[i] !== topicParts[i]) {
        return false;
      }
      if (patternParts[i] === '#') return true;
    }
    
    return true;
  }

  /**
   * Disconnect from broker
   */
  disconnect() {
    if (this.client) {
      this.client.end();
      this.isConnected = false;
      console.log('[MQTT] Disconnected from broker');
    }
  }
}

// Create singleton instance
const mqttService = new MQTTService();

module.exports = mqttService;
