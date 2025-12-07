# CHAPTER THREE: METHODOLOGY (Continued)

## 3.2 Development of Cloud Backend and M-Pesa Integration

### 3.2.1 Cloud Backend Architecture

The cloud backend serves as the central nervous system of the entire ecosystem, orchestrating communication between ESP32 meters, Firebase database, M-Pesa payment gateway, and the frontend dashboard. The backend is developed using Node.js and Express framework, chosen for their asynchronous event-driven architecture ideal for handling real-time IoT data streams and webhook callbacks.

**Technology Stack:**

- **Runtime:** Node.js v18.x (LTS)
- **Framework:** Express.js v4.18
- **Database:** Firebase Realtime Database
- **Payment Integration:** M-Pesa Daraja API
- **Authentication:** Firebase Authentication
- **Deployment:** Cloud hosting (Render, Railway, or AWS EC2)
- **Process Manager:** PM2 for production deployment

**Key Dependencies:**
```json
{
  "express": "^4.18.2",
  "firebase-admin": "^11.9.3",
  "body-parser": "^1.20.2",
  "dotenv": "^16.3.1",
  "axios": "^1.4.0",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "morgan": "^1.10.0"
}
```

**Environment Configuration:**

The system uses environment variables for sensitive credentials and configuration:
```env
# Firebase Configuration
FIREBASE_DATABASE_URL=https://iot-smart-meter-default-rtdb.firebaseio.com
FIREBASE_SA_BASE64=<base64_encoded_service_account_key>

# M-Pesa Daraja API
DARAJA_CONSUMER_KEY=<your_consumer_key>
DARAJA_CONSUMER_SECRET=<your_consumer_secret>
DARAJA_SHORTCODE=174379
DARAJA_PASSKEY=<your_passkey>
DARAJA_CALLBACK_URL=https://yourdomain.com/daraja/callback

# Server Configuration
PORT=3000
NODE_ENV=production
```

**Server Architecture:**

**Main Application (`index.js`):**
```javascript
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/meters', require('./routes/meters'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/daraja', require('./routes/daraja'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**API Endpoint Design:**

**Meter Management Endpoints:**

```javascript
// GET /api/meters/:meterId - Get meter details and current status
router.get('/:meterId', async (req, res) => {
  const { meterId } = req.params;
  
  try {
    const snapshot = await db.ref(`meters/${meterId}`).once('value');
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Meter not found' });
    }
    
    res.json(snapshot.val());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/meters/:meterId/balance - Update meter balance (from ESP32)
router.post('/:meterId/balance', async (req, res) => {
  const { meterId } = req.params;
  const { balance } = req.body;
  
  try {
    await db.ref(`meters/${meterId}`).update({
      current_balance: balance,
      last_update: admin.database.ServerValue.TIMESTAMP
    });
    
    res.json({ success: true, balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/meters/:meterId/status - Update meter status
router.post('/:meterId/status', async (req, res) => {
  const { meterId } = req.params;
  const { load_connected, wifi_status, mqtt_status } = req.body;
  
  try {
    await db.ref(`meters/${meterId}/status`).update({
      load_connected,
      wifi_status,
      mqtt_status,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Transaction Management:**

```javascript
// GET /api/transactions/:userId - Get user transaction history
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { limit = 50 } = req.query;
  
  try {
    const snapshot = await db.ref('transactions')
      .orderByChild('user_id')
      .equalTo(userId)
      .limitToLast(parseInt(limit))
      .once('value');
    
    const transactions = [];
    snapshot.forEach(child => {
      transactions.push({ id: child.key, ...child.val() });
    });
    
    res.json(transactions.reverse()); // Most recent first
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/transactions/meter/:meterId - Get transactions by meter
router.get('/meter/:meterId', async (req, res) => {
  const { meterId } = req.params;
  
  try {
    const snapshot = await db.ref('transactions')
      .orderByChild('meter_no')
      .equalTo(meterId)
      .once('value');
    
    const transactions = [];
    snapshot.forEach(child => {
      transactions.push({ id: child.key, ...child.val() });
    });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 3.2.2 M-Pesa Daraja API Integration

The Daraja API integration handles the complete payment lifecycle from initiation to confirmation, ensuring reliable and secure transaction processing.

**Authentication Module (`daraja.js`):**

M-Pesa Daraja API requires OAuth authentication to obtain access tokens:

```javascript
const axios = require('axios');

class DarajaAPI {
  constructor() {
    this.consumerKey = process.env.DARAJA_CONSUMER_KEY;
    this.consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry > Date.now()) {
      return this.accessToken;
    }

    const auth = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`
    ).toString('base64');

    try {
      const response = await axios.get(
        `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (3600 * 1000); // 1 hour

      return this.accessToken;
    } catch (error) {
      console.error('Daraja auth error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with M-Pesa Daraja API');
    }
  }
}

module.exports = new DarajaAPI();
```

**STK Push (Lipa na M-Pesa Online) Implementation:**

```javascript
async initiateSTKPush(phoneNumber, amount, meterId, accountReference) {
  const token = await this.getAccessToken();
  const timestamp = new Date().toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14);
  
  const shortcode = process.env.DARAJA_SHORTCODE;
  const passkey = process.env.DARAJA_PASSKEY;
  const password = Buffer.from(
    `${shortcode}${passkey}${timestamp}`
  ).toString('base64');

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount), // Must be integer
    PartyA: phoneNumber, // Format: 254XXXXXXXXX
    PartyB: shortcode,
    PhoneNumber: phoneNumber,
    CallBackURL: process.env.DARAJA_CALLBACK_URL,
    AccountReference: accountReference || meterId,
    TransactionDesc: `Electricity recharge for meter ${meterId}`
  };

  try {
    const response = await axios.post(
      `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      checkoutRequestID: response.data.CheckoutRequestID,
      merchantRequestID: response.data.MerchantRequestID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription
    };
  } catch (error) {
    console.error('STK Push error:', error.response?.data || error.message);
    throw new Error('Failed to initiate M-Pesa payment');
  }
}
```

**Callback Handler:**

The callback endpoint receives payment confirmation from M-Pesa:

```javascript
router.post('/callback', async (req, res) => {
  console.log('Daraja callback received:', JSON.stringify(req.body, null, 2));

  try {
    const { Body } = req.body;
    const stkCallback = Body?.stkCallback;

    if (!stkCallback) {
      return res.status(400).json({
        ResultCode: 1,
        ResultDesc: 'Invalid callback format'
      });
    }

    const { ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // ResultCode 0 = Success, other = Failure
    if (ResultCode !== 0) {
      console.log('Payment failed:', ResultDesc);
      return res.json({
        ResultCode: 0,
        ResultDesc: 'Callback received'
      });
    }

    // Extract payment details from CallbackMetadata
    const metadata = {};
    CallbackMetadata.Item.forEach(item => {
      metadata[item.Name] = item.Value;
    });

    const amount = metadata.Amount;
    const mpesaReceiptNumber = metadata.MpesaReceiptNumber;
    const phoneNumber = metadata.PhoneNumber;
    const transactionDate = metadata.TransactionDate;

    // Find meter from account reference or phone number mapping
    const meterId = await findMeterByPhoneNumber(phoneNumber);
    const userId = await findUserByMeterId(meterId);

    if (!userId || !meterId) {
      console.error('Meter/User not found for phone:', phoneNumber);
      return res.json({
        ResultCode: 1,
        ResultDesc: 'Meter not found'
      });
    }

    // Create transaction record
    const transactionId = `TXN_${Date.now()}_${mpesaReceiptNumber}`;
    await db.ref(`transactions/${transactionId}`).set({
      transaction_id: transactionId,
      user_id: userId,
      meter_no: meterId,
      amount: amount,
      mpesa_receipt: mpesaReceiptNumber,
      phone_number: phoneNumber,
      transaction_date: transactionDate,
      status: 'SUCCESS',
      timestamp: admin.database.ServerValue.TIMESTAMP
    });

    // Update user's latest transaction
    await db.ref(`users/${userId}`).update({
      latest_transaction_id: transactionId,
      last_payment_amount: amount,
      last_payment_timestamp: admin.database.ServerValue.TIMESTAMP
    });

    // Publish recharge command to MQTT (or update Firebase for ESP32 to read)
    await publishRechargeToMeter(meterId, amount, transactionId);

    res.json({
      ResultCode: 0,
      ResultDesc: 'Payment processed successfully',
      TransactionID: transactionId
    });

  } catch (error) {
    console.error('Callback processing error:', error);
    res.status(500).json({
      ResultCode: 1,
      ResultDesc: 'Internal server error'
    });
  }
});
```

**Helper Functions:**

```javascript
async function findMeterByPhoneNumber(phoneNumber) {
  // Query users collection for matching phone number
  const snapshot = await db.ref('users')
    .orderByChild('phone_number')
    .equalTo(phoneNumber)
    .once('value');
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const userData = Object.values(snapshot.val())[0];
  return userData.meter_no;
}

async function findUserByMeterId(meterId) {
  const snapshot = await db.ref('users')
    .orderByChild('meter_no')
    .equalTo(meterId)
    .once('value');
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return Object.keys(snapshot.val())[0]; // Return user ID
}

async function publishRechargeToMeter(meterId, amount, transactionId) {
  // Option 1: Update Firebase for ESP32 to read
  await db.ref(`meters/${meterId}/pending_recharge`).set({
    amount,
    transaction_id: transactionId,
    timestamp: admin.database.ServerValue.TIMESTAMP,
    processed: false
  });

  // Option 2: Publish to MQTT broker (if using external MQTT)
  // mqttClient.publish(`meter/${meterId}/recharge`, JSON.stringify({
  //   amount,
  //   transaction_id: transactionId,
  //   timestamp: Date.now()
  // }));

  console.log(`Recharge command sent to meter ${meterId}: KES ${amount}`);
}
```

### 3.2.3 Firebase Realtime Database Implementation

Firebase Realtime Database provides cloud-hosted NoSQL database with real-time synchronization capabilities, ideal for IoT applications requiring instant data updates.

**Database Schema Design:**

```json
{
  "users": {
    "user_001": {
      "name": "Moses Maingi",
      "email": "moses@example.com",
      "phone_number": "254712345678",
      "meter_no": "METER_12345678",
      "created_at": 1700000000000,
      "latest_transaction_id": "TXN_1700100000000_ABC123",
      "last_payment_amount": 500,
      "last_payment_timestamp": 1700100000000
    }
  },
  
  "meters": {
    "METER_12345678": {
      "user_id": "user_001",
      "meter_no": "METER_12345678",
      "current_balance": 450.75,
      "consumption_rate": 0.5,
      "last_update": 1700101000000,
      "status": {
        "load_connected": true,
        "wifi_status": "connected",
        "mqtt_status": "connected",
        "last_seen": 1700101000000
      },
      "pending_recharge": {
        "amount": 0,
        "transaction_id": null,
        "processed": true,
        "timestamp": null
      },
      "alerts": {
        "low_balance": false,
        "critical_balance": false,
        "connection_lost": false
      }
    }
  },
  
  "transactions": {
    "TXN_1700100000000_ABC123": {
      "transaction_id": "TXN_1700100000000_ABC123",
      "user_id": "user_001",
      "meter_no": "METER_12345678",
      "amount": 500,
      "mpesa_receipt": "ABC123XYZ",
      "phone_number": "254712345678",
      "transaction_date": "20231115120000",
      "status": "SUCCESS",
      "timestamp": 1700100000000
    }
  },
  
  "consumption_history": {
    "METER_12345678": {
      "2024-01-15": {
        "date": "2024-01-15",
        "total_consumption": 12.5,
        "cost": 625,
        "readings": {
          "00": 0.4, "01": 0.3, "02": 0.3,
          "06": 0.5, "07": 0.8, "08": 0.7,
          "18": 1.2, "19": 1.5, "20": 1.3,
          "21": 1.0, "22": 0.8, "23": 0.5
        }
      }
    }
  }
}
```

**Firebase Admin SDK Initialization:**

```javascript
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
let serviceAccount;

if (process.env.FIREBASE_SA_BASE64) {
  // Base64 encoded service account (for cloud deployment)
  const decoded = Buffer.from(
    process.env.FIREBASE_SA_BASE64,
    'base64'
  ).toString('utf-8');
  serviceAccount = JSON.parse(decoded);
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // Service account file path (for local development)
  serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
} else {
  throw new Error('Firebase credentials not configured');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();

module.exports = { admin, db };
```

**Database Security Rules:**

Firebase security rules ensure data access control:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "meters": {
      "$meterId": {
        ".read": "data.child('user_id').val() === auth.uid",
        ".write": "data.child('user_id').val() === auth.uid || auth.uid === 'server'"
      }
    },
    "transactions": {
      ".read": "auth != null",
      ".write": "auth.uid === 'server'"
    }
  }
}
```

**Real-time Data Synchronization:**

Firebase automatically pushes updates to connected clients:

```javascript
// ESP32 listens for recharge commands
db.ref(`meters/${METER_ID}/pending_recharge`).on('value', (snapshot) => {
  const recharge = snapshot.val();
  
  if (recharge && !recharge.processed && recharge.amount > 0) {
    // Process recharge
    handleRecharge(recharge.amount, recharge.transaction_id);
    
    // Mark as processed
    db.ref(`meters/${METER_ID}/pending_recharge/processed`).set(true);
  }
});

// Frontend dashboard listens for balance updates
db.ref(`meters/${meterId}/current_balance`).on('value', (snapshot) => {
  const balance = snapshot.val();
  updateBalanceDisplay(balance);
});
```

