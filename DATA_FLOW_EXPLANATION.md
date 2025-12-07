# Data Flow: OLED Display vs Dashboard Graphs

## 🤔 Your Question

> "The OLED consumed section resets when I reconnect ESP32, but I still see graphs in my dashboard. Where are the graphs getting data from? Will graphs work for different users?"

## 📊 Two Separate Tracking Systems

You have **TWO INDEPENDENT** consumption tracking systems:

### 1. **ESP32 OLED Display** (Local Device)
- Stores `totalConsumed` in **ESP32 flash memory** (Preferences)
- Shows on **OLED screen**
- **Persists across reboots** (with the fix you need to upload)

### 2. **Dashboard Graphs** (Cloud Database)
- Stores consumption data in **Firebase database**
- Shows in **web dashboard charts**
- **Always persisted** (already working)

---

## 🔄 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CONSUMPTION EVENT                         │
│                    (ESP32 consuming power)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │      ESP32 Board      │
                  │  (Your meter device)  │
                  └──────────┬────────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
                 ▼                       ▼
        ┌────────────────┐      ┌──────────────┐
        │  LOCAL STORAGE │      │ MQTT Publish │
        │  (Preferences) │      │   Message    │
        │                │      │              │
        │ totalConsumed  │      │ unitsConsumed│
        │ = 45.5 kWh     │      │ totalConsumed│
        │                │      │ meterNo      │
        │ Saved to flash │      │ timestamp    │
        └────────┬───────┘      └──────┬───────┘
                 │                     │
                 ▼                     ▼
        ┌────────────────┐    ┌─────────────────┐
        │  OLED DISPLAY  │    │  MQTT BROKER    │
        │                │    │ (HiveMQ Cloud)  │
        │  Consumed:     │    └────────┬────────┘
        │  45.50 kWh     │             │
        │                │             ▼
        │ Shows local    │    ┌─────────────────┐
        │ flash value    │    │   YOUR BACKEND  │
        │                │    │   (Node.js)     │
        └────────────────┘    └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │    FIREBASE     │
                              │    DATABASE     │
                              │                 │
                              │ unit_consumption│
                              │   - timestamp   │
                              │   - user_id     │
                              │   - meter_no    │
                              │   - units       │
                              │   - date        │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   DASHBOARD     │
                              │   (Frontend)    │
                              │                 │
                              │   📊 GRAPHS     │
                              │   Daily/Weekly  │
                              │   Monthly chart │
                              └─────────────────┘
```

---

## 🎯 Key Differences

| Feature | OLED Display | Dashboard Graphs |
|---------|--------------|------------------|
| **Data Source** | ESP32 flash memory | Firebase database |
| **Storage Location** | Local (on device) | Cloud (Firebase) |
| **Persistence** | Needs Preferences.h fix | Already persisted ✅ |
| **Scope** | Single device only | All users, all devices |
| **Reset Behavior** | Resets if not saved | Never resets |
| **Access** | Only visible on OLED | Visible to all users on web |
| **User-specific** | No (device-specific) | Yes (user_id based) |

---

## 🔍 Why Your OLED Resets (And How to Fix It)

### Current Situation:
```cpp
// Line 87 in your ESP32 code
float totalConsumed = 0.0;  // ← Resets to 0 on every reboot!
```

When you disconnect/reconnect power:
1. ESP32 restarts
2. All RAM is cleared
3. `totalConsumed = 0.0` is initialized
4. OLED shows 0.00 kWh

### The Fix (Already in Your Code):
```cpp
// Lines 272, 629-634, 982-991 - Persistence code added!

// In setup() - Load saved value
loadTotalConsumed();  // Reads from flash: totalConsumed = 45.5

// In decrementUnits() - Save every 10 units
if (totalConsumed - lastSaved >= 10.0) {
  saveTotalConsumed();  // Writes to flash
}

// Function implementations
void saveTotalConsumed() {
  preferences.begin("smartmeter", false);
  preferences.putFloat("totalConsumed", totalConsumed);
  preferences.end();
}

void loadTotalConsumed() {
  preferences.begin("smartmeter", true);
  totalConsumed = preferences.getFloat("totalConsumed", 0.0);
  preferences.end();
}
```

### ⚠️ YOU NEED TO UPLOAD THIS CODE!
The fix is **in your file** but **not on your ESP32 yet**!

---

## 📈 Dashboard Graphs Explained

### Where Dashboard Gets Data:

**Backend** logs every consumption event to Firebase:

```javascript
// backend/services/mqttService.js - Line 213
const logRef = db.ref('unit_consumption').push();
await logRef.set({
  user_id: userId,           // ← User-specific!
  meter_no: meterNo,         // ← Meter-specific!
  units_consumed: 0.5,       // Amount consumed this cycle
  units_after: 149.5,        // Balance after consumption
  total_consumed: 45.5,      // Running total
  timestamp: 1701879234567,  // When it happened
  source: 'mqtt',            // Source: MQTT from ESP32
  date: '2024-12-06T20:53:54.567Z'
});
```

**Firebase Structure**:
```
unit_consumption/
  -NpQr8s7T9uVwXyZ123/
    user_id: "user_abc123"
    meter_no: "55555"
    units_consumed: 0.5
    total_consumed: 45.5
    timestamp: 1701879234567
    date: "2024-12-06T20:53:54.567Z"
  -NpQr9a2B4cDeFgH456/
    user_id: "user_abc123"
    meter_no: "55555"
    units_consumed: 0.5
    total_consumed: 46.0
    timestamp: 1701879236567
    date: "2024-12-06T20:53:56.567Z"
  ... (continues)
```

**Frontend** fetches this data:
```typescript
// frontend/src/lib/api.ts
export const getConsumptionAnalytics = async (
  userId: string,
  period: 'daily' | 'weekly' | 'monthly'
) => {
  const response = await api.get(`/analytics/consumption/${userId}?period=${period}`);
  return response.data;
};
```

---

## 🧑‍🤝‍🧑 Will Graphs Work for Different Users?

### ✅ YES! Graphs are User-Specific

Each user has their own data:

```
User A (meter_no: "55555")
  ├─ unit_consumption entries with user_id: "user_abc123"
  └─ Dashboard shows ONLY their consumption

User B (meter_no: "66666")
  ├─ unit_consumption entries with user_id: "user_xyz789"
  └─ Dashboard shows ONLY their consumption

User C (new user, meter_no: "77777")
  ├─ No consumption entries yet
  └─ Dashboard shows empty graph (no data yet)
```

### Backend Filters by User ID:

```javascript
// backend/routes/iot.js
router.get('/analytics/consumption/:userId', async (req, res) => {
  const { userId } = req.params;
  
  // Get consumption data for THIS USER ONLY
  const consumptionRef = db.ref('unit_consumption')
    .orderByChild('user_id')
    .equalTo(userId);  // ← Filters by user!
  
  const snapshot = await consumptionRef.once('value');
  // ... process and return data
});
```

### New Users:
1. **First time**: No data in Firebase → Graph shows "No data available"
2. **After ESP32 sends data**: Consumption logged to Firebase → Graph updates
3. **Future logins**: Historical data loads from Firebase → Graph shows history

---

## 🚀 Action Items for You

### 1. ✅ Fix OLED Reset Issue
**Upload the ESP32 code with Preferences library:**

```bash
In Arduino IDE:
1. Open projo_manenoz.ino
2. Click "Upload" button
3. Wait for "Done uploading"
4. ESP32 restarts
5. Serial Monitor should show:
   [STORAGE] Total consumed loaded: 0.00 kWh  (first boot)
   ... consumption happens ...
   [STORAGE] Total consumed saved: 10.00 kWh  (after 10 units)
6. Disconnect and reconnect power
7. Serial Monitor should show:
   [STORAGE] Total consumed loaded: 10.00 kWh  (persisted!)
8. OLED should show: "Consumed: 10.00 kWh" (not 0.00!)
```

### 2. ✅ Verify Dashboard Graphs
**Already working, but verify:**

```bash
1. Open dashboard in browser
2. Navigate to "Consumption Analytics" section
3. Check daily/weekly/monthly tabs
4. Should see graphs with your consumption data
5. Data comes from Firebase, not ESP32 OLED
```

### 3. ✅ Test with Multiple Users
**Create test accounts:**

```bash
# User 1
Email: user1@test.com
Meter: 55555

# User 2
Email: user2@test.com
Meter: 66666

Each user will see ONLY their own consumption data in graphs!
```

---

## 📝 Summary

### Your Three Questions Answered:

**Q1: "Why does OLED consumed section reset?"**
- **A**: ESP32 code has the fix, but you haven't uploaded it yet!
- **Solution**: Upload the code with Preferences library

**Q2: "Where are the graphs getting data from?"**
- **A**: Firebase database, NOT from ESP32 OLED
- **How**: Backend logs every consumption event to Firebase
- **Location**: `unit_consumption` collection in Firebase

**Q3: "Will graphs work for different users?"**
- **A**: YES! Graphs are user-specific
- **Filter**: Backend filters by `user_id`
- **Isolation**: Each user sees only their own data
- **New users**: Start with empty graphs until ESP32 sends data

### Two Independent Systems:

| System | Data Storage | Visibility | Persistence |
|--------|--------------|------------|-------------|
| **OLED Display** | ESP32 Flash | Device only | Needs upload ⚠️ |
| **Dashboard Graphs** | Firebase Cloud | All users (filtered) | Already working ✅ |

---

**Now upload the ESP32 code and your OLED will stop resetting!** 🚀
