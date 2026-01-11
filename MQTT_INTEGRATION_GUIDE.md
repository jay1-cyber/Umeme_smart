# MQTT Integration Guide for Umeme Smart Meter

This guide provides complete step-by-step instructions for integrating MQTT into your Umeme Smart Meter project for two-way communication between ESP32 and Firebase.

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Backend Setup](#backend-setup)
4. [ESP32 Setup](#esp32-setup)
5. [MQTT Broker Options](#mqtt-broker-options)
6. [Testing the Integration](#testing-the-integration)
7. [Troubleshooting](#troubleshooting)
8. [MQTT Topics Reference](#mqtt-topics-reference)

---

## Overview

### What is MQTT?

MQTT (Message Queuing Telemetry Transport) is a lightweight messaging protocol designed for IoT devices. It uses a publish-subscribe pattern where:

- **Publisher**: Sends messages to topics
- **Subscriber**: Receives messages from topics
- **Broker**: Routes messages between publishers and subscribers

### Why MQTT for Smart Meter?

1. **Real-time updates**: Balance changes are pushed instantly to ESP32
2. **Two-way communication**: Backend ↔ ESP32 communication
3. **Low bandwidth**: Efficient for IoT devices
4. **Reliable**: Quality of Service (QoS) levels ensure message delivery
5. **Scalable**: Can handle thousands of meters

### Communication Flow

```
Payment Made → Firebase → Backend → MQTT Broker → ESP32 → Updates Balance
ESP32 Consumes Power → MQTT Broker → Backend → Updates Firebase
```

---

## System Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend    │────────▶│   Firebase  │
│  (React)    │         │  (Node.js)   │         │  (Database) │
└─────────────┘         └──────┬───────┘         └─────────────┘
                               │
                               │ MQTT
                               ▼
                        ┌──────────────┐
                        │ MQTT Broker  │
                        │  (HiveMQ)    │
                        └──────┬───────┘
                               │
                               │ MQTT
                               ▼
                        ┌──────────────┐
                        │    ESP32     │
                        │ Smart Meter  │
                        └──────────────┘
```

---

## Backend Setup

### Step 1: Install Dependencies

Navigate to your backend directory and install the MQTT library:

```bash
cd backend
npm install mqtt
```

Or if you're using pnpm:

```bash
pnpm install
```

### Step 2: Configure Environment Variables

Update your `.env` file with MQTT configuration:

```env
# MQTT Configuration
MQTT_BROKER_URL=mqtt://broker.hivemq.com:1883
MQTT_USERNAME=
MQTT_PASSWORD=

# For secure connection (recommended for production)
# MQTT_BROKER_URL=mqtts://your-broker.com:8883
# MQTT_USERNAME=your-username
# MQTT_PASSWORD=your-password

# IoT Configuration
API_KEY=your-secure-api-key-here
UNITS_PER_KES=0.05
```

### Step 3: Verify Backend Files

Ensure these files exist in your backend:

1. **`services/mqttService.js`** - MQTT service handler ✅ (Created)
2. **`services/meterService.js`** - Updated with MQTT integration ✅ (Updated)
3. **`index.js`** - Main server with MQTT initialization ✅ (Updated)

### Step 4: Start the Backend

```bash
cd backend
npm start
```

You should see logs like:

```
[MQTT] Connecting to broker: mqtt://broker.hivemq.com:1883
[MQTT] Connected to broker successfully
[MQTT] Subscribed to topic: smartmeter/+/balance
[MQTT] Subscribed to topic: smartmeter/+/consumption
[MQTT] Subscribed to topic: smartmeter/+/status
```

---

## ESP32 Setup

### Step 1: Install Required Libraries

Open Arduino IDE and install these libraries via Library Manager:

1. **PubSubClient** by Nick O'Leary
   - Sketch → Include Library → Manage Libraries
   - Search "PubSubClient" and install

2. **ArduinoJson** by Benoit Blanchon
   - Search "ArduinoJson" and install (version 6.x)

### Step 2: Hardware Connections

#### Required Components:
- ESP32 Development Board
- ACS712 Current Sensor (30A recommended)
- Relay Module (5V)
- Power Supply (5V for ESP32, appropriate voltage for relay)

#### Wiring Diagram:

```
ESP32 Pin Connections:
┌─────────────────────────────────────┐
│ GPIO 26 → Relay Module (IN)        │
│ GPIO 34 → ACS712 (OUT)              │
│ GPIO 2  → Built-in LED              │
│ 3.3V    → ACS712 (VCC)              │
│ GND     → ACS712 (GND)              │
└─────────────────────────────────────┘

Relay Module:
┌─────────────────────────────────────┐
│ VCC → 5V Power Supply               │
│ GND → Ground                        │
│ IN  → ESP32 GPIO 26                 │
│ COM → Load Power Source             │
│ NO  → Load (Appliance)              │
└─────────────────────────────────────┘
```

### Step 3: Configure ESP32 Code

Open `ESP32_SmartMeter_MQTT.ino` and update these values:

```cpp
// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";           // Your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";   // Your WiFi password

// MQTT Configuration
const char* mqtt_server = "broker.hivemq.com"; // Or your broker
const int mqtt_port = 1883;

// Device Configuration
const char* meterNo = "METER001";              // Match with Firebase
```

### Step 4: Upload to ESP32

1. Connect ESP32 to computer via USB
2. Select board: **Tools → Board → ESP32 Dev Module**
3. Select port: **Tools → Port → COM_X** (Windows) or **/dev/ttyUSB0** (Linux)
4. Click **Upload** button
5. Open **Serial Monitor** (115200 baud) to view logs

### Step 5: Verify Connection

In Serial Monitor, you should see:

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

## MQTT Broker Options

### Option 1: Public Broker (Development/Testing)

**HiveMQ Public Broker** (Default in code)
- URL: `mqtt://broker.hivemq.com:1883`
- No authentication required
- **Pros**: Free, no setup needed
- **Cons**: Not secure, not for production

**Eclipse Mosquitto Public Broker**
- URL: `mqtt://test.mosquitto.org:1883`
- No authentication required

### Option 2: Cloud MQTT Services (Production)

#### HiveMQ Cloud (Recommended)
1. Go to [HiveMQ Cloud](https://www.hivemq.com/mqtt-cloud-broker/)
2. Create free account (up to 100 connections)
3. Create cluster and get credentials
4. Update `.env`:
   ```env
   MQTT_BROKER_URL=mqtts://your-cluster.hivemq.cloud:8883
   MQTT_USERNAME=your-username
   MQTT_PASSWORD=your-password
   ```

#### AWS IoT Core
- Highly scalable
- Integrated with AWS services
- More complex setup

#### Azure IoT Hub
- Microsoft cloud solution
- Enterprise features

### Option 3: Self-Hosted Broker

#### Install Mosquitto on Ubuntu/Debian:

```bash
sudo apt update
sudo apt install mosquitto mosquitto-clients
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
```

#### Configure password authentication:

```bash
sudo mosquitto_passwd -c /etc/mosquitto/passwd your_username
sudo nano /etc/mosquitto/conf.d/default.conf
```

Add:
```
listener 1883
allow_anonymous false
password_file /etc/mosquitto/passwd
```

Restart:
```bash
sudo systemctl restart mosquitto
```

Update your `.env`:
```env
MQTT_BROKER_URL=mqtt://your-server-ip:1883
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password
```

---

## Testing the Integration

### Test 1: Backend to ESP32 Communication

1. **Make a Payment Simulation**
   
   Open Postman or use curl:
   ```bash
   curl -X POST http://localhost:3000/daraja/simulate \
     -H "Content-Type: application/json" \
     -d '{
       "meter_no": "METER001",
       "amount": 100
     }'
   ```

2. **Check Backend Logs**
   ```
   [MQTT] Sent balance update to ESP32: Meter METER001, Balance: 5.0
   ```

3. **Check ESP32 Serial Monitor**
   ```
   Message received on topic: smartmeter/METER001/command/balance
   Balance updated to: 5.0000
   ```

### Test 2: ESP32 to Backend Communication

1. **Power on a load connected to ESP32 relay**

2. **Check ESP32 Serial Monitor**
   ```
   Current: 2.50 A, Power: 575.00 W
   === Publishing Consumption ===
   Units consumed: 0.0048
   Remaining balance: 4.9952
   ```

3. **Check Backend Logs**
   ```
   [MQTT] Consumption report - Meter: METER001, Consumed: 0.0048, Remaining: 4.9952
   [MQTT] Updated Firebase balance for meter METER001: 4.9952
   ```

4. **Verify Firebase**
   - Open Firebase Console
   - Navigate to Realtime Database
   - Check: `meters/METER001/balance` - should show updated value
   - Check: `unit_consumption` - should have new entry

### Test 3: Balance Depletion

1. Let the meter run until balance reaches zero
2. ESP32 should:
   - Turn OFF relay
   - Publish low balance status
3. Backend should log the low balance event

### Test 4: MQTT Connection Test

Use MQTT client tools to test:

#### Using MQTT.fx (GUI):
1. Download from [MQTT.fx](https://mqttfx.jensd.de/)
2. Connect to your broker
3. Subscribe to `smartmeter/#` (all topics)
4. Observe messages

#### Using Mosquitto CLI:

```bash
# Subscribe to all smartmeter topics
mosquitto_sub -h broker.hivemq.com -t "smartmeter/#" -v

# Publish test balance update
mosquitto_pub -h broker.hivemq.com \
  -t "smartmeter/METER001/command/balance" \
  -m '{"balance":10.5,"timestamp":1234567890}'
```

---

## Troubleshooting

### ESP32 Won't Connect to WiFi

**Problem**: ESP32 shows "WiFi connection failed"

**Solutions**:
- Verify SSID and password are correct
- Check if WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
- Move ESP32 closer to router
- Check if WiFi has MAC address filtering

### ESP32 Won't Connect to MQTT Broker

**Problem**: "Failed to connect to MQTT broker"

**Solutions**:
- Verify broker URL and port
- Check if broker requires authentication
- Test broker with MQTT client tool
- Check firewall settings
- Ensure broker supports MQTT v3.1.1

### Backend Not Receiving ESP32 Messages

**Problem**: Backend logs show no MQTT messages from ESP32

**Solutions**:
- Check if backend is subscribed to correct topics
- Verify ESP32 is publishing to correct topics
- Check MQTT broker logs
- Ensure QoS levels are compatible

### Firebase Not Updating

**Problem**: Firebase balance doesn't update when ESP32 publishes

**Solutions**:
- Check `handleConsumption()` function in `mqttService.js`
- Verify meter number matches in Firebase structure
- Check Firebase rules allow writes
- Review backend error logs

### High Current Reading Even When No Load

**Problem**: ACS712 shows current when nothing is connected

**Solutions**:
- Calibrate sensor offset (1.65V for 3.3V systems)
- Adjust noise threshold in code:
  ```cpp
  if (current < 0.1) {  // Increase threshold if needed
    current = 0.0;
  }
  ```
- Check sensor wiring
- Use averaging for more stable readings

### Relay Not Switching

**Problem**: Relay doesn't turn on/off based on balance

**Solutions**:
- Check relay module requires 5V signal (some need level shifter)
- Verify GPIO 26 connection
- Test relay manually: `digitalWrite(RELAY_PIN, HIGH);`
- Check relay module power supply
- Verify relay type (active HIGH/LOW)

---

## MQTT Topics Reference

### Topics Published by ESP32

#### 1. Consumption Report
**Topic**: `smartmeter/{meterNo}/consumption`

**Payload**:
```json
{
  "meterNo": "METER001",
  "unitsConsumed": 0.0048,
  "remainingBalance": 4.9952,
  "totalConsumed": 0.0048,
  "timestamp": 1234567890
}
```

**Frequency**: Every 30 seconds (when consumption detected)

---

#### 2. Balance Report
**Topic**: `smartmeter/{meterNo}/balance`

**Payload**:
```json
{
  "meterNo": "METER001",
  "balance": 5.0,
  "timestamp": 1234567890
}
```

**Frequency**: When balance is updated

---

#### 3. Status Update
**Topic**: `smartmeter/{meterNo}/status`

**Payload**:
```json
{
  "meterNo": "METER001",
  "status": "online",
  "message": "Device connected",
  "balance": 5.0,
  "wifi_rssi": -65,
  "timestamp": 1234567890
}
```

**Status values**: `online`, `low_balance`, `error`

---

### Topics Subscribed by ESP32

#### 1. Balance Command
**Topic**: `smartmeter/{meterNo}/command/balance`

**Payload**:
```json
{
  "balance": 10.5,
  "timestamp": 1234567890
}
```

**Purpose**: Backend sends updated balance to ESP32

---

### Wildcard Subscriptions

Backend subscribes to these patterns:

- `smartmeter/+/balance` - All meter balance reports
- `smartmeter/+/consumption` - All meter consumption reports
- `smartmeter/+/status` - All meter status updates

Where `+` is a wildcard matching any meter number.

---

## Best Practices

### Security

1. **Use TLS/SSL in Production**
   ```env
   MQTT_BROKER_URL=mqtts://broker.example.com:8883
   ```

2. **Use Authentication**
   - Always set username/password for MQTT broker
   - Don't use public brokers in production

3. **Implement Access Control**
   - Configure broker ACLs to restrict topic access
   - Each device should only access its own topics

4. **API Key for REST Endpoints**
   - Keep `API_KEY` in `.env` secure
   - Use different keys for production/development

### Performance

1. **Adjust Publish Interval**
   ```cpp
   const unsigned long PUBLISH_INTERVAL = 60000; // 1 minute for production
   ```

2. **Use QoS Appropriately**
   - QoS 0: Fire and forget (status updates)
   - QoS 1: At least once delivery (consumption data)
   - QoS 2: Exactly once (critical commands)

3. **Implement Buffering**
   - Store messages when offline
   - Resend when connection restored

### Monitoring

1. **Add Logging**
   - Log all MQTT messages
   - Monitor connection status
   - Track message delivery rates

2. **Implement Alerts**
   - Low balance notifications
   - Connection failures
   - Abnormal consumption patterns

3. **Health Checks**
   - Periodic ping between devices
   - Monitor last seen timestamps
   - Auto-restart on failures

---

## Advanced Features (Future Enhancements)

### 1. Over-the-Air (OTA) Updates
Update ESP32 firmware remotely via MQTT.

### 2. Dynamic Configuration
Change parameters without reflashing:
```json
{
  "command": "config",
  "publishInterval": 60000,
  "threshold": 0.1
}
```

### 3. Time-of-Use Pricing
Different rates for peak/off-peak hours.

### 4. Load Scheduling
Smart scheduling based on tariffs.

### 5. Anomaly Detection
Alert on unusual consumption patterns.

### 6. Multi-Meter Dashboard
Monitor multiple meters in real-time.

---

## Support and Resources

### Documentation
- [MQTT Protocol Spec](http://mqtt.org/)
- [PubSubClient Library](https://pubsubclient.knolleary.net/)
- [HiveMQ MQTT Guide](https://www.hivemq.com/mqtt-essentials/)

### Tools
- [MQTT.fx](https://mqttfx.jensd.de/) - Desktop MQTT client
- [MQTT Explorer](http://mqtt-explorer.com/) - MQTT topic visualizer
- [Mosquitto](https://mosquitto.org/) - MQTT broker

### Community
- ESP32 Forum: [esp32.com](https://esp32.com)
- Arduino Forum: [forum.arduino.cc](https://forum.arduino.cc)

---

## Conclusion

You now have a complete MQTT integration for your Umeme Smart Meter project! The system provides:

✅ Real-time two-way communication  
✅ Automatic balance synchronization  
✅ Consumption tracking and reporting  
✅ Remote control capabilities  
✅ Scalable architecture  

**Next Steps**:
1. Test thoroughly with your hardware
2. Implement security measures for production
3. Add monitoring and alerts
4. Scale to multiple meters

For issues or questions, refer to the troubleshooting section or check the logs on both backend and ESP32.

---

**Last Updated**: October 2024  
**Version**: 1.0
