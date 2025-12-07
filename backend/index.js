require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { createTransactionForMeter, findUserIdByMeter, saveCallbackTransaction, calculateUserBalance } = require('./transactions');
const { simulateC2BPayment } = require('./daraja');
const { db } = require('./firebase');
const iotRoutes = require('./routes/iot');
const mqttService = require('./services/mqttService');

// Ensure firebase initialization happens by importing firebase.js
require('./firebase');

const app = express();

// Initialize MQTT service
mqttService.connect();

// CORS middleware for frontend integration
app.use((req, res, next) => {
  // Allow multiple origins: production and development
  const allowedOrigins = [
    'https://umeme-smart-frontend.onrender.com',
    'https://umeme-frontend.onrender.com',
    'http://localhost:5173',
    'http://localhost:8080',
    process.env.FRONTEND_URL
  ].filter(Boolean); // Remove undefined values

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// User lookup endpoint for frontend authentication
app.get('/users/lookup', async (req, res) => {
  try {
    const { email, meter_no } = req.query;

    if (!email || !meter_no) {
      return res.status(400).json({
        error: 'Both email and meter_no query parameters are required'
      });
    }

    console.log(`Looking up user with email: ${email}, meter_no: ${meter_no}`);

    const usersRef = db.ref('users');
    const snapshot = await usersRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'No users found in database' });
    }

    const users = snapshot.val();
    const userKey = Object.keys(users).find(key =>
      users[key].email === email && users[key].meter_no === meter_no
    );

    if (!userKey) {
      return res.status(404).json({ error: 'User not found with provided credentials' });
    }

    const userData = {
      user_id: userKey,
      name: users[userKey].name || 'Unknown',
      email: users[userKey].email,
      meter_no: users[userKey].meter_no,
      balance: users[userKey].balance || 0,
      latest_transaction_id: users[userKey].latest_transaction_id || null
    };

    console.log(`Found user: ${userData.user_id}`);
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error looking up user:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register new user endpoint
app.post('/users', async (req, res) => {
  try {
    const { name, email, meter_no, phone_number } = req.body;

    // Validate required fields
    if (!name || !email || !meter_no || !phone_number) {
      return res.status(400).json({
        error: 'All fields are required: name, email, meter_no, phone_number'
      });
    }

    // Check if user with this email or meter_no already exists
    const usersRef = db.ref('users');
    const snapshot = await usersRef.once('value');
    const users = snapshot.val() || {};

    // Check for existing email or meter number
    for (const userKey in users) {
      const user = users[userKey];
      if (user.email === email) {
        return res.status(409).json({
          error: 'User with this email already exists'
        });
      }
      if (user.meter_no === meter_no) {
        return res.status(409).json({
          error: 'User with this meter number already exists'
        });
      }
    }

    // Create new user
    const newUserRef = usersRef.push();
    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      meter_no: meter_no.trim(),
      phone_number: phone_number.trim(),
      balance: 0,
      created_at: new Date().toISOString(),
      latest_transaction_id: null
    };

    await newUserRef.set(userData);

    console.log(`Created new user: ${newUserRef.key} - ${name} (${email}) - Meter: ${meter_no}`);

    res.status(201).json({
      user_id: newUserRef.key,
      ...userData
    });

  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transactions for a specific user
app.get('/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching transactions for user: ${userId}`);

    const transactionsRef = db.ref('transactions');
    const snapshot = await transactionsRef.orderByChild('user_id').equalTo(userId).once('value');

    if (!snapshot.exists()) {
      console.log(`No transactions found for user ${userId}`);
      return res.status(200).json([]);
    }

    const transactionsData = snapshot.val();
    const transactions = Object.keys(transactionsData)
      .map(key => ({
        id: key,
        ...transactionsData[key]
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    console.log(`Found ${transactions.length} transactions for user ${userId}`);
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user balance by meter number (returns persisted balance in units)
app.get('/users/:meterNo/balance', async (req, res) => {
  try {
    const { meterNo } = req.params;
    console.log(`Fetching balance for meter: ${meterNo}`);

    // Find the userId by meter number
    const userId = await findUserIdByMeter(meterNo);
    if (!userId) {
      return res.status(404).json({ error: `No user found with meter_no: ${meterNo}` });
    }

    // Prefer persisted balance on the user record (units). If missing, fall back to recomputing.
    const userSnap = await db.ref(`users/${userId}`).once('value');
    if (userSnap.exists()) {
      const user = userSnap.val();
      const persistedBalance = typeof user.balance === 'number' ? user.balance : (user.balance ? parseFloat(user.balance) : null);
      if (persistedBalance !== null && persistedBalance !== undefined && !Number.isNaN(persistedBalance)) {
        return res.status(200).json({
          meter_no: meterNo,
          availableUnits: Number(parseFloat(persistedBalance).toFixed(2)),
          timestamp: new Date().toISOString()
        });
      }
    }

    // Fallback to recomputing if persisted balance isn't present or isn't numeric
    const balanceData = await calculateUserBalance(userId);
    return res.status(200).json({
      meter_no: meterNo,
      availableUnits: balanceData.availableUnits,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching user balance by meter:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Meter status endpoint - check if ESP32 is online
app.get('/meters/:meterNo/status', async (req, res) => {
  try {
    const { meterNo } = req.params;

    // Get meter data from Firebase
    const meterRef = db.ref(`meters/${meterNo}`);
    const meterSnapshot = await meterRef.once('value');
    const meterData = meterSnapshot.val();

    if (!meterData) {
      return res.status(404).json({
        error: 'Meter not found',
        online: false,
        status: 'unknown'
      });
    }

    const lastSeen = meterData.last_seen || meterData.last_update || 0;
    const now = Date.now();
    const timeSinceLastSeen = now - lastSeen;

    // Consider meter online if last seen within 30 seconds (30000 ms)
    const ONLINE_THRESHOLD = 30000; // 30 seconds
    const isOnline = timeSinceLastSeen < ONLINE_THRESHOLD;

    return res.status(200).json({
      meter_no: meterNo,
      online: isOnline,
      last_seen: lastSeen,
      last_seen_ago_ms: timeSinceLastSeen,
      last_seen_ago_seconds: Math.floor(timeSinceLastSeen / 1000),
      status: isOnline ? 'connected' : 'disconnected',
      timestamp: now
    });
  } catch (error) {
    console.error('Error fetching meter status:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      online: false,
      status: 'error'
    });
  }
});

// M-Pesa Daraja callback endpoint
app.post('/daraja/callback', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Received Daraja callback:`, JSON.stringify(req.body, null, 2));

  try {
    const payload = req.body || {};

    // Process the callback using the new saveCallbackTransaction function
    const result = await saveCallbackTransaction(payload);

    if (result.success) {
      if (result.duplicate) {
        console.log(`[${timestamp}] Duplicate transaction detected: ${result.message}`);
        // Always respond 200 to Daraja to stop retries
        return res.status(200).json({
          ResultCode: 0,
          ResultDesc: "Confirmation received successfully (duplicate)",
          TransactionID: result.transaction_id
        });
      } else {
        console.log(`[${timestamp}] Transaction processed successfully: ${result.transaction_id}`);
        return res.status(200).json({
          ResultCode: 0,
          ResultDesc: "Confirmation received successfully",
          TransactionID: result.transaction_id
        });
      }
    } else {
      // Log error but still respond 200 to Daraja to prevent retries
      console.error(`[${timestamp}] Failed to process callback: ${result.message}`);
      return res.status(200).json({
        ResultCode: 1,
        ResultDesc: result.message || "Failed to process transaction"
      });
    }

  } catch (error) {
    // Log error but always respond 200 to Daraja to prevent infinite retries
    console.error(`[${timestamp}] Error handling Daraja callback:`, error.message);
    return res.status(200).json({
      ResultCode: 1,
      ResultDesc: "Internal server error"
    });
  }
});

// Route to trigger a C2B payment simulation
app.post('/daraja/simulate', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Received simulate request:`, JSON.stringify(req.body, null, 2));

  try {
    const { meter_no, amount } = req.body;
    if (!meter_no || !amount) {
      console.error(`[${timestamp}] Missing required fields: meter_no=${meter_no}, amount=${amount}`);
      return res.status(400).json({ error: 'meter_no and amount are required' });
    }

    console.log(`[${timestamp}] Simulating C2B payment for meter ${meter_no} with amount ${amount}`);
    const darajaResponse = await simulateC2BPayment(meter_no, amount);
    console.log(`[${timestamp}] Daraja simulation successful:`, JSON.stringify(darajaResponse, null, 2));

    // Create initial transaction record after successful simulation
    if (darajaResponse.ResponseCode === '0') {
      try {
        console.log(`[${timestamp}] Creating initial transaction record...`);
        const transaction = await createTransactionForMeter(
          meter_no,
          amount,
          'SUCCESS', // Set as SUCCESS since Daraja simulation was successful
          darajaResponse.OriginatorCoversationID || null
        );
        console.log(`[${timestamp}] Created transaction ${transaction.transaction_id} with SUCCESS status`);

        // PUBLISH MQTT MESSAGE TO ESP32
        try {
          // Get updated balance from Firebase
          const userIdSnap = await findUserIdByMeter(meter_no);
          if (userIdSnap) {
            const userSnap = await db.ref(`users/${userIdSnap}`).once('value');
            const userData = userSnap.val();
            const newBalance = userData.balance || 0;

            console.log(`[${timestamp}] Publishing balance update to ESP32: ${newBalance} units`);
            await mqttService.sendBalanceUpdate(meter_no, newBalance);
            console.log(`[${timestamp}] MQTT balance update sent to ESP32`);
          }
        } catch (mqttError) {
          console.error(`[${timestamp}] Failed to send MQTT update:`, mqttError.message);
          // Don't fail the request, just log the error
        }

        // Return enhanced response with transaction info
        res.status(200).json({
          ...darajaResponse,
          transaction_id: transaction.transaction_id,
          status: 'SUCCESS',
          balance_updated: true
        });
      } catch (dbError) {
        console.error(`[${timestamp}] Failed to create transaction record:`, dbError.message);
        // Still return success from Daraja, but log the DB error
        res.status(200).json(darajaResponse);
      }
    } else {
      res.status(200).json(darajaResponse);
    }
  } catch (error) {
    console.error(`[${timestamp}] Error in /daraja/simulate:`, error.message);
    console.error(`[${timestamp}] Full error details:`, error);
    res.status(500).json({ error: `Failed to simulate payment: ${error.message}` });
  }
});
// app.use('/api/iot', iotRoutes);
app.get('/meter/:meterNo/balance', async (req, res) => {
  try {
    const meterNo = req.params.meterNo;
    const snap = await db.ref(`meters/${meterNo}/balance`).once('value');
    res.json({ meterNo, balance: snap.val() || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'default-key';

// Get user info by meter number (for ESP32 auto-retrieval)
app.get('/users/by-meter/:meterNo', async (req, res) => {
  try {
    const { meterNo } = req.params;
    console.log(`[API] Fetching user info for meter: ${meterNo}`);

    // Find user by meter number
    const usersRef = db.ref('users');
    const snapshot = await usersRef.orderByChild('meter_no').equalTo(meterNo).once('value');

    if (!snapshot.exists()) {
      console.log(`[API] No user found with meter_no: ${meterNo}`);
      return res.status(404).json({
        error: 'User not found',
        meter_no: meterNo
      });
    }

    const users = snapshot.val();
    const userId = Object.keys(users)[0];
    const userData = users[userId];

    console.log(`[API] Found user: ${userData.name} (${userId})`);

    res.status(200).json({
      user_id: userId,
      name: userData.name || 'Unknown User',
      email: userData.email || '',
      phone_number: userData.phone_number || '',
      meter_no: userData.meter_no,
      balance: userData.balance || 0
    });

  } catch (error) {
    console.error('[API] Error fetching user by meter:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get consumption analytics for a user (daily, weekly, monthly)
app.get('/analytics/consumption/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'daily' } = req.query; // daily, weekly, monthly

    console.log(`Fetching ${period} consumption analytics for user: ${userId}`);

    // Get consumption records
    const consumptionRef = db.ref('unit_consumption');
    const consumptionSnapshot = await consumptionRef.orderByChild('user_id').equalTo(userId).once('value');

    const now = new Date();
    let consumptionData = [];

    if (consumptionSnapshot.exists()) {
      const consumptions = consumptionSnapshot.val();
      consumptionData = Object.values(consumptions)
        .filter(c => c.timestamp)
        .map(c => ({
          timestamp: new Date(c.timestamp),
          units: parseFloat(c.units_consumed || 0),
          raw: c
        }));
    }

    // Generate time series based on period
    let timeSeriesData = [];

    if (period === 'daily') {
      // Last 24 hours, grouped by hour
      const hours = [];
      for (let i = 23; i >= 0; i--) {
        const hourDate = new Date(now.getTime() - i * 60 * 60 * 1000);
        hours.push({
          hour: hourDate.getHours(),
          label: hourDate.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true }),
          startTime: new Date(hourDate.setMinutes(0, 0, 0)),
          endTime: new Date(hourDate.setMinutes(59, 59, 999)),
          consumption: 0
        });
      }

      consumptionData.forEach(c => {
        const hour = hours.find(h => c.timestamp >= h.startTime && c.timestamp <= h.endTime);
        if (hour) hour.consumption += c.units;
      });

      timeSeriesData = hours.map(h => ({
        label: h.label,
        value: parseFloat(h.consumption.toFixed(2))
      }));

    } else if (period === 'weekly') {
      // Last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const dayDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const startOfDay = new Date(dayDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(dayDate.setHours(23, 59, 59, 999));

        days.push({
          date: new Date(startOfDay),
          label: startOfDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          startTime: startOfDay,
          endTime: endOfDay,
          consumption: 0
        });
      }

      consumptionData.forEach(c => {
        const day = days.find(d => c.timestamp >= d.startTime && c.timestamp <= d.endTime);
        if (day) day.consumption += c.units;
      });

      timeSeriesData = days.map(d => ({
        label: d.label,
        value: parseFloat(d.consumption.toFixed(2))
      }));

    } else if (period === 'monthly') {
      // Last 30 days
      const days = [];
      for (let i = 29; i >= 0; i--) {
        const dayDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const startOfDay = new Date(dayDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(dayDate.setHours(23, 59, 59, 999));

        days.push({
          date: new Date(startOfDay),
          label: startOfDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          startTime: startOfDay,
          endTime: endOfDay,
          consumption: 0
        });
      }

      consumptionData.forEach(c => {
        const day = days.find(d => c.timestamp >= d.startTime && c.timestamp <= d.endTime);
        if (day) day.consumption += c.units;
      });

      timeSeriesData = days.map(d => ({
        label: d.label,
        value: parseFloat(d.consumption.toFixed(2))
      }));
    }

    const totalConsumption = timeSeriesData.reduce((sum, d) => sum + d.value, 0);
    const avgConsumption = timeSeriesData.length > 0 ? totalConsumption / timeSeriesData.length : 0;
    const peakConsumption = Math.max(...timeSeriesData.map(d => d.value), 0);

    res.status(200).json({
      period,
      data: timeSeriesData,
      summary: {
        total: parseFloat(totalConsumption.toFixed(2)),
        average: parseFloat(avgConsumption.toFixed(2)),
        peak: parseFloat(peakConsumption.toFixed(2)),
        dataPoints: timeSeriesData.length
      }
    });

  } catch (error) {
    console.error('Error fetching consumption analytics:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ESP32 sends consumption updates
app.post('/consume', async (req, res) => {
  try {
    const key = req.header('x-api-key');
    if (key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });

    const { meterNo, units } = req.body;
    if (!meterNo || typeof units !== 'number') {
      return res.status(400).json({ error: 'meterNo and units are required' });
    }

    const result = await consumeUnits(meterNo, units);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(PORT, () => {
  console.log(`M-Pesa middleware server listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Daraja callback: http://localhost:${PORT}/daraja/callback`);
});