# Instant ESP32 Status Updates - Configuration

## ⚡ Optimized for Near-Instant Disconnection Detection

### Updated Timings

| Component | Setting | Previous | New | Purpose |
|-----------|---------|----------|-----|---------|
| **ESP32** | Status Publish | 30s | **10s** | Send heartbeat faster |
| **ESP32** | Consumption Publish | 2s | **2s** | Ultra real-time data |
| **Backend** | Online Threshold | 2 min | **30s** | Mark offline faster |
| **Frontend** | Poll Interval | 30s | **5s** | Check status faster |

---

## 📊 Detection Timeline

### When ESP32 Goes Offline:

```
Time 0s:   ESP32 disconnects (power off)
Time 2s:   Last consumption message expires
Time 30s:  Backend marks meter as offline (no message for 30s)
Time 35s:  Frontend polls and detects offline status (within 5s)

Maximum Detection Delay: ~35 seconds
```

### When ESP32 Comes Online:

```
Time 0s:   ESP32 powers on
Time 5s:   ESP32 connects to WiFi and MQTT
Time 7s:   First consumption message sent
Time 7s:   Backend marks meter as online
Time 10s:  Frontend polls and detects online status (within 5s)

Maximum Detection Delay: ~12 seconds
```

---

## 🔧 What Changed

### 1. ESP32 Firmware (`projo_manenoz.ino`)
```cpp
// Line 59: Reduced from 30s to 10s
const unsigned long STATUS_PUBLISH_INTERVAL = 10000;   // 10 seconds
```

**Impact**: ESP32 now sends status updates every 10 seconds instead of 30 seconds.

---

### 2. Backend API (`backend/index.js`)
```javascript
// Line 235: Reduced from 120s to 30s
const ONLINE_THRESHOLD = 30000; // 30 seconds
```

**Impact**: Backend marks meter offline if no message received in 30 seconds (was 2 minutes).

---

### 3. Frontend Dashboard (`frontend/src/pages/DashboardPage.tsx`)
```typescript
// Line 106: Reduced from 30s to 5s
const statusInterval = setInterval(fetchMeterStatus, 5000); // 5 seconds
```

**Impact**: Dashboard checks meter status every 5 seconds (was 30 seconds).

---

## 🧪 Testing

### Test 1: Disconnect ESP32
1. **Start**: ESP32 powered on, dashboard shows 🟢 "Meter Online"
2. **Action**: Unplug ESP32
3. **Expected**: Within **~35 seconds**, dashboard shows 🔴 "Meter Offline"

### Test 2: Reconnect ESP32
1. **Start**: ESP32 powered off, dashboard shows 🔴 "Meter Offline"
2. **Action**: Plug in ESP32, wait for WiFi connection
3. **Expected**: Within **~12 seconds** of connection, dashboard shows 🟢 "Meter Online"

### Test 3: Watch Live Updates
Open browser console and watch:
```
[Dashboard] Meter status: Online, Last seen: 2s ago
[Dashboard] Meter status: Online, Last seen: 7s ago
[Dashboard] Meter status: Online, Last seen: 12s ago
... ESP32 disconnects ...
[Dashboard] Meter status: Online, Last seen: 32s ago
[Dashboard] Meter status: Offline, Last seen: 37s ago  ← Changed!
```

---

## 📈 Network Impact

### Before Optimization:
- Frontend: 2 requests/minute (every 30s)
- Total data: ~400 bytes/min = 24 KB/hour

### After Optimization:
- Frontend: 12 requests/minute (every 5s)
- Total data: ~2400 bytes/min = 144 KB/hour

**Trade-off**: 6x more network requests for near-instant status updates. Still very minimal data usage.

---

## 🚀 Steps to Apply

### 1. Upload New ESP32 Code
```bash
# In Arduino IDE
1. Open projo_manenoz.ino
2. Click "Upload" button
3. Wait for "Done uploading"
4. ESP32 will restart automatically
```

### 2. Restart Backend (Optional - backend auto-updates)
```bash
cd backend
npm start
```

### 3. Frontend Auto-Updates (Vite HMR)
Your frontend is already running with `npm run dev` and will auto-update via Hot Module Replacement. Just refresh the browser if needed.

---

## ✅ Verification

### Check ESP32 Serial Monitor:
```
[MQTT] Status published: online
... 10 seconds later ...
[MQTT] Status published: online
```
Should see status every **10 seconds** (not 30).

### Check Backend Logs:
```
[MQTT] Status update - Meter: 55555, Status: online
```
Should see these frequently.

### Check Browser Console:
```
[Dashboard] Meter status: Online, Last seen: 3s ago
... 5 seconds later ...
[Dashboard] Meter status: Online, Last seen: 8s ago
```
Should update every **5 seconds**.

---

## 🎯 Summary

Your dashboard will now detect ESP32 disconnection in **~35 seconds** (down from 2+ minutes).

### Timeline:
- **ESP32 Consumption**: Every 2s ✅
- **ESP32 Status**: Every 10s ✅
- **Backend Threshold**: 30s ✅
- **Frontend Polling**: Every 5s ✅

**Result**: Near-instant status updates! 🚀

---

## 🔍 Troubleshooting

### Still Slow?

1. **Check ESP32 sending messages**:
   ```
   Serial Monitor: [MQTT] Consumption published successfully
   ```

2. **Check backend receiving**:
   ```
   Backend logs: [MQTT] ✓ Updated meter 55555 records
   ```

3. **Check frontend polling**:
   ```
   Browser console: [Dashboard] Meter status: ...
   ```

4. **Force refresh dashboard**:
   ```
   Ctrl + Shift + R (hard refresh)
   ```

### Adjust Timings Further

**For even faster detection** (more network usage):

#### Frontend - Poll every 3 seconds:
```typescript
const statusInterval = setInterval(fetchMeterStatus, 3000);
```

#### Backend - Offline after 15 seconds:
```javascript
const ONLINE_THRESHOLD = 15000; // 15 seconds
```

---

**Now test it! Disconnect your ESP32 and watch the icon change within 35 seconds!** ⚡🔴
