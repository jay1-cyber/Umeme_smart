# Quick Start Guide - MQTT Integration

Get your Umeme Smart Meter with MQTT up and running in 15 minutes!

## Prerequisites

- ✅ Node.js installed (v14 or higher)
- ✅ Arduino IDE installed
- ✅ ESP32 board
- ✅ WiFi network (2.4GHz)
- ✅ Firebase project configured

---

## 🚀 Backend Setup (5 minutes)

### 1. Install MQTT Package

```bash
cd backend
npm install mqtt
```

### 2. Update .env File

Add these lines to your `backend/.env`:

```env
# MQTT Configuration
MQTT_BROKER_URL=mqtt://broker.hivemq.com:1883
MQTT_USERNAME=
MQTT_PASSWORD=

# API Configuration
API_KEY=your-secure-key-here
UNITS_PER_KES=0.05
```

### 3. Start Backend

```bash
npm start
```

**Expected output:**
```
[MQTT] Connecting to broker: mqtt://broker.hivemq.com:1883
[MQTT] Connected to broker successfully
[MQTT] Subscribed to topic: smartmeter/+/balance
M-Pesa middleware server listening on port 3000
```

### 4. Test MQTT (Optional)

```bash
node test-mqtt.js
```

---

## 📡 ESP32 Setup (10 minutes)

### 1. Install Arduino Libraries

Open Arduino IDE → Tools → Manage Libraries

Search and install:
- **PubSubClient** by Nick O'Leary
- **ArduinoJson** by Benoit Blanchon (v6.x)

### 2. Open ESP32 Code

Open `ESP32_SmartMeter_MQTT.ino` in Arduino IDE

### 3. Configure WiFi and MQTT

Update these lines (around line 28-40):

```cpp
// WiFi Configuration
const char* ssid = "YourWiFiName";           // ← Change this
const char* password = "YourWiFiPassword";   // ← Change this

// MQTT Configuration  
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;

// Device Configuration
const char* meterNo = "METER001";            // ← Change to match Firebase
```

### 4. Select Board and Port

- **Tools → Board → ESP32 Dev Module**
- **Tools → Port → COM_X** (select your ESP32 port)

### 5. Upload Code

Click the **Upload** button (→)

### 6. Open Serial Monitor

**Tools → Serial Monitor** (set to 115200 baud)

**Expected output:**
```
=== ESP32 Smart Meter Starting ===
Connecting to WiFi: YourNetwork
WiFi connected!
IP address: 192.168.1.100
Connecting to MQTT broker... Connected!
Subscribed to: smartmeter/METER001/command/balance
=== Setup Complete ===
```

---

## 🧪 Quick Test

### Test 1: Send Balance from Backend to ESP32

**In terminal:**
```bash
curl -X POST http://localhost:3000/daraja/simulate \
  -H "Content-Type: application/json" \
  -d '{"meter_no": "METER001", "amount": 100}'
```

**Check ESP32 Serial Monitor:**
```
Message received on topic: smartmeter/METER001/command/balance
Balance updated to: 5.0000
```

### Test 2: ESP32 Reports Consumption

1. Connect a load (light bulb) to the relay
2. Watch Serial Monitor for consumption data
3. Check backend logs

**Backend should show:**
```
[MQTT] Consumption report - Meter: METER001, Consumed: 0.0048
[MQTT] Updated Firebase balance
```

---

## 🔧 Hardware Setup (Basic)

### Minimal Setup (No Current Sensor)

If you don't have ACS712 sensor yet:

1. Connect only the relay:
   ```
   ESP32 GPIO 26 → Relay IN
   ESP32 GND → Relay GND
   5V → Relay VCC
   ```

2. Modify code to simulate consumption:
   ```cpp
   // In measureCurrent() function, replace with:
   float current = 1.0; // Simulate 1A current
   ```

### Full Setup (With Current Sensor)

```
Connections:
  ESP32 3.3V → ACS712 VCC
  ESP32 GND → ACS712 GND
  ESP32 GPIO 34 → ACS712 OUT
  ESP32 GPIO 26 → Relay IN
  
Load Connection:
  Power Source → ACS712 IN
  ACS712 OUT → Relay COM
  Relay NO → Load (appliance)
```

---

## 📊 Monitor in Real-Time

### Option 1: MQTT Explorer (Recommended)

1. Download [MQTT Explorer](http://mqtt-explorer.com/)
2. Connect to `broker.hivemq.com:1883`
3. Subscribe to `smartmeter/#`
4. See all messages in real-time

### Option 2: Mosquitto CLI

```bash
# Subscribe to all smartmeter topics
mosquitto_sub -h broker.hivemq.com -t "smartmeter/#" -v
```

### Option 3: Firebase Console

1. Open Firebase Console
2. Go to Realtime Database
3. Watch `meters/METER001/balance` update in real-time

---

## 🐛 Common Issues

### ESP32 Won't Connect to WiFi
- Check SSID and password
- Use 2.4GHz WiFi (not 5GHz)
- Move closer to router

### MQTT Connection Fails
- Check broker URL
- Try different public broker: `mqtt://test.mosquitto.org:1883`
- Check firewall settings

### No Messages Received
- Verify meter number matches in code and backend
- Check Serial Monitor for errors
- Test with MQTT Explorer

### Relay Not Working
- Check if relay needs 5V signal
- Test manually: `digitalWrite(26, HIGH);`
- Verify wiring connections

---

## 📚 Next Steps

1. ✅ Read full documentation: `MQTT_INTEGRATION_GUIDE.md`
2. ✅ Secure your setup (use TLS, authentication)
3. ✅ Add more meters
4. ✅ Implement monitoring dashboard
5. ✅ Set up alerts for low balance

---

## 🔗 Important Files

- **Backend MQTT Service**: `backend/services/mqttService.js`
- **ESP32 Code**: `ESP32_SmartMeter_MQTT.ino`
- **Full Guide**: `MQTT_INTEGRATION_GUIDE.md`
- **Test Script**: `backend/test-mqtt.js`

---

## 🆘 Need Help?

1. Check logs in Serial Monitor (ESP32)
2. Check logs in terminal (Backend)
3. Test with `test-mqtt.js`
4. Review `MQTT_INTEGRATION_GUIDE.md` troubleshooting section

---

## ✨ Success Checklist

- [ ] Backend starts without errors
- [ ] Backend shows "Connected to broker successfully"
- [ ] ESP32 connects to WiFi
- [ ] ESP32 connects to MQTT broker
- [ ] ESP32 receives balance updates
- [ ] Backend receives consumption reports
- [ ] Firebase updates with new balance
- [ ] Relay switches based on balance

**All checked? Congratulations! 🎉 Your MQTT integration is working!**

---

**Quick Start Version**: 1.0  
**Last Updated**: October 2024
