# MQTT Architecture for IoT Smart Meter

## System Overview

This document describes the MQTT-based architecture that enables real-time two-way communication between the backend and ESP32 smart meters.

---

## Communication Flow

### 1. Payment Flow (Backend → ESP32)

```
User Makes Payment
    ↓
M-Pesa Callback
    ↓
Firebase Balance Updated
    ↓
meterService.processPayment()
    ↓
MQTT Publish: smartmeter/{meterNo}/command/balance
    ↓
ESP32 Receives Balance
    ↓
ESP32 Updates Local Balance
    ↓
ESP32 Controls Relay (ON if balance > 0)
```

**MQTT Message:**
```json
Topic: smartmeter/METER001/command/balance
Payload: {
  "balance": 5.25,
  "timestamp": 1698765432000
}
```

---

### 2. Consumption Flow (ESP32 → Backend)

```
ESP32 Monitors Current
    ↓
Calculates Energy (kWh)
    ↓
Deducts from Local Balance
    ↓
MQTT Publish: smartmeter/{meterNo}/consumption
    ↓
Backend Receives Message
    ↓
Updates Firebase Balance
    ↓
Logs Consumption in Database
```

**MQTT Message:**
```json
Topic: smartmeter/METER001/consumption
Payload: {
  "meterNo": "METER001",
  "unitsConsumed": 0.0048,
  "remainingBalance": 5.2452,
  "totalConsumed": 0.0048,
  "timestamp": 1698765432000
}
```

---

## Topic Structure

### Topic Naming Convention

```
smartmeter/{meterNo}/{direction}/{messageType}
```

- **meterNo**: Unique meter identifier (e.g., METER001)
- **direction**: `command` (backend→ESP32) or data topic (ESP32→backend)
- **messageType**: Type of message (balance, consumption, status)

### Complete Topic Map

```
┌─────────────────────────────────────────────────────────┐
│                    MQTT Broker                          │
│                 (broker.hivemq.com)                     │
└─────────────────────────────────────────────────────────┘
           ↑                                    ↑
           │                                    │
    PUBLISH│                                    │SUBSCRIBE
           │                                    │
┌──────────┴─────────┐              ┌──────────┴─────────┐
│      Backend       │              │       ESP32        │
│   (Node.js)        │              │    (Arduino)       │
├────────────────────┤              ├────────────────────┤
│ SUBSCRIBES:        │              │ SUBSCRIBES:        │
│ • smartmeter/+/    │              │ • smartmeter/      │
│   consumption      │              │   METER001/        │
│ • smartmeter/+/    │              │   command/balance  │
│   status           │              │                    │
│ • smartmeter/+/    │              │ PUBLISHES:         │
│   balance          │              │ • smartmeter/      │
│                    │              │   METER001/        │
│ PUBLISHES:         │              │   consumption      │
│ • smartmeter/      │              │ • smartmeter/      │
│   {meterNo}/       │              │   METER001/status  │
│   command/balance  │              │ • smartmeter/      │
│                    │              │   METER001/balance │
└────────────────────┘              └────────────────────┘
```

---

## Message Specifications

### 1. Balance Command (Backend → ESP32)

**Purpose**: Update ESP32 with new balance after payment

**Topic**: `smartmeter/{meterNo}/command/balance`

**Payload Schema**:
```json
{
  "balance": <number>,      // New balance in units
  "timestamp": <number>     // Unix timestamp in milliseconds
}
```

**Example**:
```json
{
  "balance": 10.5,
  "timestamp": 1698765432000
}
```

**QoS**: 1 (At least once delivery)

**Retention**: false

---

### 2. Consumption Report (ESP32 → Backend)

**Purpose**: Report energy consumption to backend

**Topic**: `smartmeter/{meterNo}/consumption`

**Payload Schema**:
```json
{
  "meterNo": <string>,          // Meter identifier
  "unitsConsumed": <number>,    // Units consumed in this report
  "remainingBalance": <number>, // Current balance after consumption
  "totalConsumed": <number>,    // Total consumed this session
  "timestamp": <number>         // Unix timestamp
}
```

**Example**:
```json
{
  "meterNo": "METER001",
  "unitsConsumed": 0.0048,
  "remainingBalance": 10.4952,
  "totalConsumed": 0.0048,
  "timestamp": 1698765432000
}
```

**QoS**: 1 (At least once delivery)

**Frequency**: Every 30 seconds (configurable)

---

### 3. Status Update (ESP32 → Backend)

**Purpose**: Report device status and health

**Topic**: `smartmeter/{meterNo}/status`

**Payload Schema**:
```json
{
  "meterNo": <string>,      // Meter identifier
  "status": <string>,       // Status: "online", "low_balance", "error"
  "message": <string>,      // Human-readable message
  "balance": <number>,      // Current balance
  "wifi_rssi": <number>,    // WiFi signal strength (dBm)
  "timestamp": <number>     // Unix timestamp
}
```

**Example**:
```json
{
  "meterNo": "METER001",
  "status": "online",
  "message": "Device operating normally",
  "balance": 10.4952,
  "wifi_rssi": -65,
  "timestamp": 1698765432000
}
```

**QoS**: 0 (Fire and forget)

**Frequency**: On state change or periodically

---

### 4. Balance Report (ESP32 → Backend)

**Purpose**: Acknowledge balance update

**Topic**: `smartmeter/{meterNo}/balance`

**Payload Schema**:
```json
{
  "meterNo": <string>,      // Meter identifier
  "balance": <number>,      // Current balance
  "timestamp": <number>     // Unix timestamp
}
```

**Example**:
```json
{
  "meterNo": "METER001",
  "balance": 10.5,
  "timestamp": 1698765432000
}
```

**QoS**: 0 (Fire and forget)

**Frequency**: After receiving balance command

---

## Data Synchronization Strategy

### Balance Synchronization

The system maintains balance in three places:

1. **Firebase Database**: Source of truth
2. **Backend Memory**: Cached during operations
3. **ESP32 Memory**: Local copy for real-time control

#### Synchronization Rules:

1. **Payment Made**:
   - Firebase updated first
   - MQTT message sent to ESP32
   - ESP32 updates local balance

2. **Consumption Detected**:
   - ESP32 deducts from local balance
   - Reports to backend via MQTT
   - Backend updates Firebase

3. **Conflict Resolution**:
   - Firebase is always the source of truth
   - On reconnection, ESP32 should request current balance
   - Backend can send balance command to resync

### Handling Connection Loss

#### ESP32 Side:
```cpp
// Continue monitoring with local balance
// Buffer consumption data if possible
// On reconnect, publish buffered data
```

#### Backend Side:
```javascript
// Firebase maintains accurate state
// On ESP32 reconnect, push latest balance
// Process buffered consumption reports
```

---

## Quality of Service (QoS) Levels

### QoS 0 (At most once)
- **Use for**: Status updates, heartbeats
- **Guarantee**: None (fire and forget)
- **Overhead**: Minimal

### QoS 1 (At least once)
- **Use for**: Balance commands, consumption reports
- **Guarantee**: Message delivered at least once
- **Overhead**: Moderate (acknowledgment required)

### QoS 2 (Exactly once)
- **Use for**: Critical financial transactions
- **Guarantee**: Message delivered exactly once
- **Overhead**: High (4-part handshake)

**Current Implementation**:
- Balance commands: QoS 1
- Consumption reports: QoS 1
- Status updates: QoS 0

---

## Scaling Considerations

### Single Meter
- Direct topics: `smartmeter/METER001/...`
- Simple subscription

### Multiple Meters (Recommended)
- Wildcard subscriptions: `smartmeter/+/consumption`
- Backend handles routing based on meter number
- Each ESP32 subscribes to own command topic

### Large Scale (1000+ meters)
- Consider dedicated MQTT broker
- Implement connection pooling
- Use retained messages for last known state
- Implement message queuing for reliability

---

## Security Architecture

### Current Implementation (Development)
```
┌──────────┐          ┌─────────┐          ┌─────────┐
│ Backend  │ ←────→ │  Public  │ ←────→ │  ESP32  │
│          │  MQTT   │  Broker  │  MQTT   │         │
└──────────┘ No Auth └─────────┘ No Auth └─────────┘
```

### Production Implementation (Recommended)
```
┌──────────┐          ┌─────────┐          ┌─────────┐
│ Backend  │ ←────→ │ Private  │ ←────→ │  ESP32  │
│          │ MQTTS   │  Broker  │ MQTTS   │         │
│          │ + Auth  │ + ACL    │ + Auth  │         │
└──────────┘          └─────────┘          └─────────┘
```

### Security Layers:

1. **Transport Layer**:
   - TLS/SSL (MQTTS on port 8883)
   - Certificate-based authentication

2. **Authentication**:
   - Username/password per device
   - Unique credentials per meter

3. **Authorization (ACL)**:
   ```
   # Backend permissions
   user backend
   topic readwrite smartmeter/+/consumption
   topic readwrite smartmeter/+/status
   topic write smartmeter/+/command/#
   
   # ESP32 METER001 permissions
   user meter001
   topic read smartmeter/METER001/command/#
   topic write smartmeter/METER001/consumption
   topic write smartmeter/METER001/status
   ```

4. **Application Layer**:
   - Message validation
   - Rate limiting
   - Anomaly detection

---

## Error Handling

### Backend Error Handling

```javascript
// Connection errors
client.on('error', (error) => {
  console.error('[MQTT] Error:', error);
  // Log to monitoring system
  // Alert operations team
  // Attempt reconnection
});

// Message processing errors
try {
  const payload = JSON.parse(message);
  await processMessage(payload);
} catch (error) {
  console.error('[MQTT] Processing error:', error);
  // Log error with context
  // Continue processing other messages
}
```

### ESP32 Error Handling

```cpp
// Connection failures
if (!mqttClient.connect(...)) {
  Serial.println("MQTT connection failed");
  // Continue with local operation
  // Retry connection periodically
  return;
}

// Publish failures
if (!mqttClient.publish(...)) {
  // Buffer message for retry
  // Log to local storage
  // Resend on next connection
}
```

---

## Monitoring and Observability

### Key Metrics to Monitor

1. **Connection Health**:
   - Connected devices count
   - Connection uptime
   - Reconnection frequency

2. **Message Flow**:
   - Messages published per minute
   - Messages received per minute
   - Message delivery latency

3. **System Health**:
   - Backend MQTT client status
   - Broker connection count
   - Message queue depth

4. **Business Metrics**:
   - Active meters
   - Total consumption (kWh)
   - Balance updates frequency

### Logging Strategy

**Backend Logs**:
```
[MQTT] [INFO] Connected to broker
[MQTT] [DEBUG] Subscribed to: smartmeter/+/consumption
[MQTT] [INFO] Consumption report - Meter: METER001, Units: 0.0048
[MQTT] [ERROR] Failed to update Firebase: Connection timeout
```

**ESP32 Logs** (Serial Monitor):
```
=== ESP32 Smart Meter ===
WiFi connected: 192.168.1.100
MQTT connected: broker.hivemq.com
Balance updated: 10.5000
Consumption: 0.0048 kWh
Status: Online
```

---

## Performance Optimization

### Backend Optimizations

1. **Connection Pooling**:
   ```javascript
   // Use single MQTT client instance
   // Reuse connections
   // Implement connection management
   ```

2. **Batch Processing**:
   ```javascript
   // Buffer multiple consumption reports
   // Batch write to Firebase
   // Reduce database operations
   ```

3. **Caching**:
   ```javascript
   // Cache meter metadata
   // Cache user mappings
   // Reduce Firebase reads
   ```

### ESP32 Optimizations

1. **Power Management**:
   ```cpp
   // Use WiFi power save mode
   // Sleep between measurements
   // Wake on threshold events
   ```

2. **Network Efficiency**:
   ```cpp
   // Batch small measurements
   // Compress payloads if needed
   // Use appropriate QoS levels
   ```

3. **Memory Management**:
   ```cpp
   // Use static buffers
   // Avoid memory fragmentation
   // Clean up JSON documents
   ```

---

## Testing Strategy

### Unit Tests

```javascript
// Backend: Test MQTT message handling
describe('MQTT Service', () => {
  test('handles consumption report', async () => {
    const payload = {
      meterNo: 'TEST001',
      unitsConsumed: 0.05,
      remainingBalance: 10.0
    };
    await handleConsumption('test/topic', payload);
    // Assert Firebase updated
  });
});
```

### Integration Tests

```javascript
// Test end-to-end flow
test('payment updates ESP32 balance', async () => {
  // 1. Simulate payment
  // 2. Verify MQTT message published
  // 3. Verify ESP32 receives message
  // 4. Verify balance updated
});
```

### Hardware Tests

```cpp
// ESP32: Test individual components
void testRelayControl() {
  digitalWrite(RELAY_PIN, HIGH);
  delay(1000);
  assert(digitalRead(RELAY_PIN) == HIGH);
}
```

---

## Deployment Checklist

### Pre-Production

- [ ] Change to private MQTT broker
- [ ] Enable TLS/SSL
- [ ] Configure authentication
- [ ] Set up ACLs
- [ ] Update firewall rules
- [ ] Configure monitoring
- [ ] Set up alerts
- [ ] Test failover scenarios
- [ ] Document recovery procedures
- [ ] Train operations team

### Production Deployment

- [ ] Deploy backend with MQTT
- [ ] Verify broker connectivity
- [ ] Test with single meter
- [ ] Gradually add meters
- [ ] Monitor for issues
- [ ] Verify data accuracy
- [ ] Check performance metrics
- [ ] Confirm billing accuracy

---

## Maintenance

### Regular Tasks

**Daily**:
- Check connection health
- Monitor message rates
- Review error logs

**Weekly**:
- Analyze consumption patterns
- Check for anomalies
- Review performance metrics

**Monthly**:
- Update security certificates
- Review and update ACLs
- Capacity planning
- Performance optimization

### Upgrade Procedures

1. **Backend Updates**:
   - Deploy to staging first
   - Test MQTT connectivity
   - Gradual rollout to production
   - Monitor for issues

2. **ESP32 Firmware Updates**:
   - Test with single device
   - Implement OTA updates
   - Staged rollout by meter
   - Maintain rollback capability

---

## Future Enhancements

1. **Advanced Features**:
   - Load forecasting
   - Dynamic pricing
   - Demand response
   - Automated alerts

2. **Scalability**:
   - Multi-region deployment
   - Message queue integration
   - Distributed MQTT brokers
   - Edge computing

3. **Analytics**:
   - Real-time dashboards
   - Consumption analytics
   - Predictive maintenance
   - Fraud detection

---

**Document Version**: 1.0  
**Last Updated**: October 2024  
**Maintained By**: IoT Smart Meter Team
