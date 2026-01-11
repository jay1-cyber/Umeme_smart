# CHAPTER THREE: METHODOLOGY (Continued)

## 3.2 Development of Cloud Backend and M-Pesa Integration

### 3.2.1 Cloud Backend Architecture

The backend orchestrates communication between ESP32 meters, Firebase database, M-Pesa payment gateway, and the frontend dashboard.

**Technology Stack:** Node.js v18, Express.js v4.18, Firebase Realtime Database, M-Pesa Daraja API

**Key Dependencies:** express, firebase-admin, axios, cors, helmet, dotenv

**Environment Configuration:** Uses environment variables for Firebase credentials, Daraja API keys, and server settings.

**API Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/meters/:meterId` | GET | Get meter details and status |
| `/api/meters/:meterId/balance` | POST | Update meter balance (from ESP32) |
| `/api/meters/:meterId/status` | POST | Update meter connection status |
| `/api/transactions/:userId` | GET | Get user transaction history |
| `/api/transactions/meter/:meterId` | GET | Get transactions by meter |
| `/daraja/stk-push` | POST | Initiate M-Pesa payment |
| `/daraja/callback` | POST | Receive M-Pesa payment confirmation |

### 3.2.2 M-Pesa Daraja API Integration

The Daraja API integration handles the complete payment lifecycle:

**Authentication:** OAuth tokens obtained via consumer key/secret, cached for 1 hour.

**STK Push Flow:**
1. Frontend initiates payment request with phone number, amount, and meter ID
2. Backend sends STK Push request to Daraja API
3. Customer receives M-Pesa prompt on phone and enters PIN
4. Safaricom sends callback to backend with payment confirmation
5. Backend creates transaction record in Firebase
6. Backend updates `meters/{meterId}/pending_recharge` for ESP32 to read
7. ESP32 detects pending recharge and updates balance

**Key Callback Processing:**
```javascript
router.post('/callback', async (req, res) => {
  const { ResultCode, CallbackMetadata } = req.body.Body.stkCallback;
  
  if (ResultCode === 0) { // Success
    const amount = CallbackMetadata.Item.find(i => i.Name === 'Amount').Value;
    const receipt = CallbackMetadata.Item.find(i => i.Name === 'MpesaReceiptNumber').Value;
    
    // Create transaction record
    await db.ref(`transactions/${transactionId}`).set({...});
    
    // Publish recharge to meter
    await db.ref(`meters/${meterId}/pending_recharge`).set({
      amount, transaction_id: transactionId, processed: false
    });
  }
  res.json({ ResultCode: 0, ResultDesc: 'Processed' });
});
```

### 3.2.3 Firebase Realtime Database Implementation

Firebase provides real-time synchronization ideal for IoT applications.

**Database Schema:**

| Collection | Key Fields |
|------------|------------|
| `users` | name, email, phone_number, meter_no, latest_transaction_id |
| `meters` | current_balance, consumption_rate, status, pending_recharge, alerts |
| `transactions` | amount, mpesa_receipt, phone_number, status, timestamp |
| `consumption_history` | daily readings by hour |

**Real-time Synchronization:** ESP32 listens to `meters/{meterId}/pending_recharge` for new recharge commands. Frontend listens to `current_balance` for live updates. Firebase security rules enforce user-based access control.

