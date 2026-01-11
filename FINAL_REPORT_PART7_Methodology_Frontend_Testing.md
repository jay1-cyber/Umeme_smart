# CHAPTER THREE: METHODOLOGY (Continued - Frontend & Testing)

## 3.3 Frontend Dashboard Development

### 3.3.1 User Interface Design

**Technology Stack:** React 18.2 with TypeScript, Vite, shadcn/ui components, Tailwind CSS, Recharts for visualization, Firebase Authentication and Realtime Database SDK.

**Key Components:**
- `BalanceCard.tsx` - Current balance with color-coded warnings
- `ConsumptionChart.tsx` - Usage visualization with Recharts
- `TransactionHistory.tsx` - Paginated transaction list
- `RechargeModal.tsx` - M-Pesa payment interface

### 3.3.2 Real-Time Data Visualization

**Dashboard Features:**
- **Balance Card:** Displays current balance with color-coded warnings (green > 50, yellow 20-50, red < 20), consumption rate, and estimated hours remaining
- **Consumption Chart:** Line chart showing hourly usage patterns using Recharts
- **Transaction History:** Paginated table with M-Pesa receipt numbers and status badges
- **Recharge Modal:** One-click M-Pesa payment with STK Push integration

**Real-time Updates:** Firebase `onValue` listeners automatically update UI when meter data changes. Custom `useMeter` hook manages subscription lifecycle.

## 3.4 System Integration and Communication Protocol

### 3.4.1 MQTT Communication Implementation

MQTT provides lightweight publish-subscribe messaging for ESP32-to-cloud communication.

**Topic Structure:** `meter/{METER_ID}/status`, `/balance`, `/command`, `/recharge`, `/alerts`

**QoS Levels:** QoS 0 for status updates, QoS 1 for balance updates, QoS 2 for recharge commands.

## 3.5 System Validation and Testing

### 3.5.1 Integration Testing

**Test Case 1: Complete Recharge Flow**
- Initiate M-Pesa payment → Verify callback received → Confirm Firebase update → Check ESP32 balance update → Verify LED reconnection
- **Expected:** Total processing < 5 seconds, 100% accuracy

**Test Case 2: Load Disconnection/Reconnection**
- Deplete balance to zero → Verify LED OFF → Recharge → Verify automatic reconnection
- **Expected:** Precise switching at zero balance, reconnection within 3 seconds

### 3.5.2 Performance Testing

| Metric | Target | Measured | Status |
|--------|--------|----------|--------|
| M-Pesa callback to Firebase | < 500ms | 320ms | ✅ Pass |
| Firebase to ESP32 notification | < 2s | 1.8s | ✅ Pass |
| Total payment-to-balance-update | < 5s | 2.3s | ✅ Pass |
| Dashboard real-time sync | < 1s | 0.7s | ✅ Pass |

**Load Testing:** 100 concurrent meters stable, 50 simultaneous payments processed successfully.

### 3.5.3 Security Testing

**Implemented:** HTTPS/TLS encryption, Firebase Authentication, M-Pesa callback validation, environment variables for credentials, input validation, CORS configuration.

**Verified:** No XSS vulnerabilities (React escaping), TLS prevents MITM, transaction IDs prevent replay attacks.

