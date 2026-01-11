# 1.4 Objectives

## 1.4.1 Main Objective

To design, develop, and evaluate an IoT-enabled automatic recharge system for Kenyan prepaid meters that eliminates manual token entry through seamless M-Pesa integration and Advanced Metering Infrastructure (AMI) principles.

## 1.4.2 Specific Objectives

1. **Design and prototype an ESP32-based smart meter simulation** with real-time balance monitoring (OLED display), LED-based load control simulation, visual/audible alerts, Wi-Fi connectivity, and MQTT communication.

2. **Develop a cloud backend integrated with M-Pesa Daraja API** that processes payment callbacks, manages user accounts in Firebase, and automatically transmits recharge commands to meters without manual intervention.

3. **Create a responsive web dashboard** using React/TypeScript for real-time balance monitoring, transaction history, consumption visualization, and M-Pesa recharge initiation.

4. **Validate system performance** through integration testing (end-to-end transaction flow), performance testing (latency measurements), reliability testing (uptime and fault tolerance), and security testing (encryption validation).

## 1.5 Scope of Study

### Included in Scope

**Hardware:** ESP32-based smart meter prototype with OLED display, SIM800L GSM module, LED indicators, buzzer, and 5V power supply.

**Firmware:** ESP32 programming for Wi-Fi/MQTT connectivity, balance simulation, load control logic, and alert management.

**Cloud Backend:** Node.js/Express server with Firebase Realtime Database integration and M-Pesa Daraja API for automated payment processing.

**Frontend:** React/TypeScript web dashboard with real-time balance display, transaction history, and consumption visualization.

**Testing:** Integration, performance, reliability, and security testing of the complete system.

### Excluded from Scope

- Physical integration with existing KPLC meters (standalone prototype only)
- Live M-Pesa transactions (sandbox testing only)
- EPRA regulatory certification
- Large-scale manufacturing and deployment
- Advanced features: time-of-use tariffing, renewable energy integration, predictive analytics

### Project Constraints

- **Timeline:** 14 weeks
- **Budget:** KES 25,000
- **Team:** Three undergraduate students with faculty supervision

### Success Criteria

1. Functional ESP32 prototype with meter simulation and load control
2. Cloud backend processing M-Pesa payments and updating balances automatically
3. Dashboard displaying real-time data
4. Testing validating performance metrics within acceptable parameters

