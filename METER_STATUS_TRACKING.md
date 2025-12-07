# ESP32 Meter Status Tracking - Implementation Guide

## Overview
The dashboard now shows **actual ESP32 device connectivity status** based on MQTT communication tracking. The WiFi icon will only show as "connected" when your ESP32 board is powered on and actively communicating with the backend.

## ✨ How It Works

### System Flow

```
ESP32 → MQTT Message → Backend → Updates last_seen timestamp → Frontend polls status → Shows icon

1. ESP32 sends MQTT messages (consumption/status/balance)
2. Backend receives messages and updates meters/{meterNo}/last_seen
3. Frontend fetches status every 30 seconds
4. If last_seen < 2 minutes ago → Show "Meter Online" (green WiFi icon)
5. If last_seen > 2 minutes ago → Show "Meter Offline" (red WifiOff icon)
```

### Status Logic

**Online Threshold**: 2 minutes (120,000 ms)

| Last Seen | Status | Icon | Color |
|-----------|--------|------|-------|
| < 2 min   | Online | Wifi (pulse) | Green |
| > 2 min   | Offline | WifiOff | Red |
| Loading   | Checking | RefreshCw (spin) | Gray |

---

## 🔧 Changes Made

### 1. Backend MQTT Service (`backend/services/mqttService.js`)

**Updated**: Track `last_seen` timestamp on every MQTT message

#### Added to `handleBalanceUpdate()` (Lines 136-138):
```javascript
// Update last_seen timestamp to track meter connectivity
await db.ref(`meters/${meterNo}/last_seen`).set(Date.now());
await db.ref(`meters/${meterNo}/online`).set(true);
```

#### Added to `handleConsumption()` (Lines 202-203):
```javascript
await db.ref(`meters/${meterNo}/last_seen`).set(Date.now());
await db.ref(`meters/${meterNo}/online`).set(true);
```

**Purpose**: Every time ESP32 sends a message, we update the `last_seen` timestamp so we know when it was last active.

---

### 2. Backend API Endpoint (`backend/index.js`)

**Added**: New endpoint to check meter status

#### Endpoint: `GET /meters/:meterNo/status` (Lines 212-255)

```javascript
app.get('/meters/:meterNo/status', async (req, res) => {
  const { meterNo } = req.params;
  
  // Get meter data from Firebase
  const meterSnapshot = await db.ref(`meters/${meterNo}`).once('value');
  const meterData = meterSnapshot.val();
  
  const lastSeen = meterData.last_seen || meterData.last_update || 0;
  const now = Date.now();
  const timeSinceLastSeen = now - lastSeen;
  
  // Online if last seen within 2 minutes
  const ONLINE_THRESHOLD = 120000; // 2 minutes
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
});
```

**Response Example**:
```json
{
  "meter_no": "55555",
  "online": true,
  "last_seen": 1701879234567,
  "last_seen_ago_ms": 15234,
  "last_seen_ago_seconds": 15,
  "status": "connected",
  "timestamp": 1701879249801
}
```

---

### 3. Frontend API (`frontend/src/lib/api.ts`)

**Added**: Meter status interface and function

#### Interface (Lines 167-175):
```typescript
export interface MeterStatus {
  meter_no: string;
  online: boolean;
  last_seen: number;
  last_seen_ago_ms: number;
  last_seen_ago_seconds: number;
  status: 'connected' | 'disconnected' | 'unknown';
  timestamp: number;
}
```

#### Function (Lines 180-197):
```typescript
export const getMeterStatus = async (meterNo: string): Promise<MeterStatus> => {
  try {
    const response = await api.get(`/meters/${meterNo}/status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching meter status:', error);
    // Return offline status on error
    return {
      meter_no: meterNo,
      online: false,
      last_seen: 0,
      last_seen_ago_ms: 0,
      last_seen_ago_seconds: 0,
      status: 'unknown',
      timestamp: Date.now()
    };
  }
};
```

---

### 4. Frontend Dashboard (`frontend/src/pages/DashboardPage.tsx`)

**Updated**: Display actual ESP32 device status

#### Added State (Line 19):
```typescript
const [meterStatus, setMeterStatus] = useState<MeterStatus | null>(null);
```

#### Added Fetch Function (Lines 90-101):
```typescript
const fetchMeterStatus = async () => {
  if (!user?.meter_no) return;
  
  try {
    const status = await getMeterStatus(user.meter_no);
    setMeterStatus(status);
    console.log(`[Dashboard] Meter status: ${status.online ? 'Online' : 'Offline'}, Last seen: ${status.last_seen_ago_seconds}s ago`);
  } catch (error) {
    console.error('[Dashboard] Error fetching meter status:', error);
  }
};
```

#### Added Polling Effect (Lines 104-108):
```typescript
useEffect(() => {
  fetchMeterStatus();
  const statusInterval = setInterval(fetchMeterStatus, 30000); // 30 seconds
  return () => clearInterval(statusInterval);
}, [user?.meter_no]);
```

#### Updated Status Indicator (Lines 176-194):
```tsx
<div className="hidden md:flex items-center gap-2 text-sm">
  {!meterStatus ? (
    <span className="flex items-center gap-1.5 text-gray-500" title="Checking meter status...">
      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
      <span className="hidden lg:inline">Checking...</span>
    </span>
  ) : meterStatus.online ? (
    <span className="flex items-center gap-1.5 text-green-600" title={`ESP32 Connected - Last seen ${meterStatus.last_seen_ago_seconds}s ago`}>
      <Wifi className="h-3.5 w-3.5 animate-pulse" />
      <span className="hidden lg:inline">Meter Online</span>
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-red-600" title="ESP32 Disconnected - Device is offline">
      <WifiOff className="h-3.5 w-3.5" />
      <span className="hidden lg:inline">Meter Offline</span>
    </span>
  )}
</div>
```

---

## 🧪 Testing Instructions

### Test 1: ESP32 Online Status

1. **Power on your ESP32**
2. **Wait for it to connect** (watch serial monitor)
3. **ESP32 should send MQTT messages** (consumption updates every 2 seconds)
4. **Open dashboard in browser**
5. **Check header** - Should show:
   ```
   🟢 Wifi icon (pulsing) | Meter Online
   ```
6. **Hover over icon** - Tooltip shows: "ESP32 Connected - Last seen 15s ago"

### Test 2: ESP32 Offline Status

1. **Unplug ESP32** (disconnect power)
2. **Wait 2-3 minutes** (longer than 2-minute threshold)
3. **Dashboard will auto-update** (checks every 30 seconds)
4. **Check header** - Should show:
   ```
   🔴 WifiOff icon | Meter Offline
   ```
5. **Hover over icon** - Tooltip shows: "ESP32 Disconnected - Device is offline"

### Test 3: Quick Reconnect

1. **Unplug ESP32**
2. **Wait 30 seconds** (less than 2 minutes)
3. **Plug ESP32 back in**
4. **ESP32 connects and sends MQTT**
5. **Dashboard updates** - Should show online again
6. **Status changes from Offline → Online**

### Test 4: Check API Directly

**Test the backend endpoint**:
```bash
# Replace 55555 with your meter number
curl http://localhost:3000/meters/55555/status
```

**Expected Response** (ESP32 online):
```json
{
  "meter_no": "55555",
  "online": true,
  "last_seen": 1701879234567,
  "last_seen_ago_ms": 15234,
  "last_seen_ago_seconds": 15,
  "status": "connected",
  "timestamp": 1701879249801
}
```

**Expected Response** (ESP32 offline):
```json
{
  "meter_no": "55555",
  "online": false,
  "last_seen": 1701879034567,
  "last_seen_ago_ms": 215234,
  "last_seen_ago_seconds": 215,
  "status": "disconnected",
  "timestamp": 1701879249801
}
```

---

## 📊 Visual Examples

### Dashboard Header - ESP32 Online
```
┌────────────────────────────────────────────────────┐
│ [Logo] IOT Smart Meter │ 🟢 Meter Online │ User │ ⚡│
└────────────────────────────────────────────────────┘
         ↑                     ↑
     Your logo          Green pulsing WiFi icon
```

### Dashboard Header - ESP32 Offline
```
┌────────────────────────────────────────────────────┐
│ [Logo] IOT Smart Meter │ 🔴 Meter Offline│ User │ ⚡│
└────────────────────────────────────────────────────┘
         ↑                     ↑
     Your logo            Red WifiOff icon
```

### Dashboard Header - Checking Status
```
┌────────────────────────────────────────────────────┐
│ [Logo] IOT Smart Meter │ ⚫ Checking...  │ User │ ⚡│
└────────────────────────────────────────────────────┘
         ↑                     ↑
     Your logo          Gray spinning icon
```

---

## 🔍 Troubleshooting

### Issue: Always Shows "Meter Offline"

**Possible Causes**:
1. ESP32 not sending MQTT messages
2. MQTT broker connection failed
3. Backend not receiving MQTT
4. Firebase write permissions issue

**Solutions**:

#### Check ESP32 Serial Monitor:
```
[MQTT] Connected to broker
[MQTT] Subscribed to: smartmeter/55555/command/balance
[MQTT] Consumption published successfully
```

#### Check Backend Logs:
```bash
[MQTT] Consumption report - Meter: 55555, Consumed: 0.5000, Remaining: 150.00
[MQTT] ✓ Updated meter 55555 records
```

#### Check Firebase Database:
```
meters/
  55555/
    last_seen: 1701879234567
    online: true
    balance: 150.50
```

#### Manual Test:
```bash
# Check Firebase directly
curl "https://your-firebase.firebaseio.com/meters/55555.json"
```

---

### Issue: Status Doesn't Update

**Possible Causes**:
1. Frontend not polling
2. CORS issue
3. API endpoint not working

**Solutions**:

#### Check Browser Console:
```javascript
[Dashboard] Meter status: Online, Last seen: 15s ago
```

#### Check Network Tab:
- Request: `GET /meters/55555/status`
- Status: 200
- Response: `{"online": true, ...}`

#### Force Refresh:
```javascript
// In browser console
localStorage.clear();
location.reload();
```

---

### Issue: Shows "Checking..." Forever

**Possible Causes**:
1. Backend not responding
2. Meter number not found
3. Network error

**Solutions**:

#### Check Backend Running:
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

#### Check Meter Number:
```bash
curl http://localhost:3000/meters/YOUR_METER_NO/status
```

#### Check Browser Console for Errors:
```javascript
Error fetching meter status: Network Error
```

---

## 📈 Performance Notes

### Polling Frequency
- **Frontend**: Checks status every 30 seconds
- **ESP32**: Sends consumption every 2 seconds
- **Backend**: Updates `last_seen` on every MQTT message

### Network Impact
- **Request size**: ~200 bytes
- **Response size**: ~150 bytes
- **Frequency**: 2 requests per minute
- **Total**: ~400 bytes/min = ~24 KB/hour

### Optimization Tips

1. **Increase polling interval** (less frequent checks):
```javascript
const statusInterval = setInterval(fetchMeterStatus, 60000); // 1 minute
```

2. **Adjust online threshold** (more lenient):
```javascript
const ONLINE_THRESHOLD = 300000; // 5 minutes
```

3. **Use WebSocket** (future enhancement):
- Real-time updates without polling
- More efficient for multiple clients
- Bidirectional communication

---

## 🚀 What's Next?

### Future Enhancements:

1. **Device Status History**:
   - Log connection/disconnection events
   - Show uptime statistics
   - Display connection quality

2. **Alerts**:
   - Notify when meter goes offline
   - Email/SMS alerts for disconnections
   - Dashboard notifications

3. **Multiple Meters**:
   - Support multiple ESP32 devices per user
   - Show status for all meters
   - Aggregate statistics

4. **WebSocket Integration**:
   - Real-time status updates
   - No polling needed
   - Instant notifications

5. **Advanced Monitoring**:
   - Signal strength (RSSI)
   - Network quality
   - Last error message
   - Reboot count

---

## 📋 Summary

### ✅ What Changed:

1. **Backend MQTT**: Updates `last_seen` timestamp on every ESP32 message
2. **Backend API**: New `/meters/:meterNo/status` endpoint to check connectivity
3. **Frontend API**: New `getMeterStatus()` function with `MeterStatus` interface
4. **Dashboard**: Shows actual ESP32 device status with appropriate icons

### ✅ Result:

- **WiFi icon (green)**: ESP32 is powered on and communicating
- **WifiOff icon (red)**: ESP32 is powered off or disconnected
- **RefreshCw icon (gray)**: Checking status...

### ✅ Benefits:

- Real device status visibility
- Know when ESP32 is offline
- Debug connection issues faster
- Better user experience

---

**Your dashboard now shows the TRUE status of your ESP32 meter!** 🎉

Power it on → See green WiFi icon
Power it off → See red WifiOff icon

Simple and accurate! 📱⚡
