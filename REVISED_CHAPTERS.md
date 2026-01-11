# REVISED CHAPTERS - Umeme Smart Meter Project

## SPECIFIC OBJECTIVES

i. To design and prototype an ESP32-based smart meter simulation

ii. To develop an integrated software platform consisting of a cloud-based backend and a web dashboard

iii. To validate the functionality and performance of Umeme Smart Meter

---

## CHAPTER THREE: METHODOLOGY

### 3.1 Hardware Design and Prototyping

The hardware component of the Umeme Smart Meter was built around the ESP32 DevKit V1 microcontroller, selected for its dual-core processing capability, integrated Wi-Fi module, and extensive GPIO pins. The ESP32 serves as the central processing unit, handling all meter operations including balance management, consumption calculations, and communication with the cloud platform.

The prototype integrates a 0.96-inch SSD1306 OLED display connected via I2C protocol (GPIO 21 for SDA, GPIO 22 for SCL) to provide real-time visual feedback of meter status, current balance, and consumption data. Three LED indicators were incorporated: a blue LED (GPIO 16) indicating load status, a green LED (GPIO 17) signifying adequate balance, and a red LED (GPIO 5) for low balance warnings. An active buzzer (GPIO 4) provides audible alerts for critical events such as low balance warnings and disconnection notifications.

For GSM connectivity, a SIM800L module was interfaced via UART (GPIO 26 RX, GPIO 27 TX) to enable SMS notifications as a fallback communication channel. The firmware was developed using the Arduino framework in C++, implementing time-based consumption simulation where units are decremented at a configurable rate. The consumption model calculates usage based on elapsed time, deducting from the available balance and triggering load disconnection when the balance reaches zero. All components were assembled on a breadboard for prototyping, with the complete bill of materials totaling approximately KES 3,500.

### 3.2 Software Platform Development

The software platform comprises three interconnected layers: a Node.js backend server, a Firebase Realtime Database, and a React-based web dashboard, all communicating through MQTT protocol and RESTful APIs.

The backend server was developed using Node.js with the Express.js framework, deployed to handle API requests, process M-Pesa transactions, and manage MQTT communications. The M-Pesa Daraja API integration enables automated payment processing through STK Push functionality, where payment requests are initiated from the dashboard and callbacks are received upon successful transactions. When a payment callback is received, the backend verifies the transaction, updates the user's balance in Firebase, and publishes a balance update command to the ESP32 via MQTT. The MQTT implementation uses the HiveMQ public broker for development, with topics structured as `smartmeter/{meterNo}/command/balance` for balance updates and `smartmeter/{meterNo}/consumption` for consumption reports.

Firebase Realtime Database serves as the central data store, maintaining user profiles, meter registrations, transaction histories, and real-time balance information. The database structure enables instant synchronization across all connected clients, ensuring that balance updates reflect immediately on both the ESP32 meter and the web dashboard.

The web dashboard was developed using React with TypeScript for type safety and TailwindCSS for responsive styling. The interface provides users with real-time balance display, consumption analytics through interactive charts, transaction history, and a seamless recharge interface that initiates M-Pesa STK Push requests. The dashboard subscribes to Firebase listeners for real-time updates, eliminating the need for manual page refreshes.

### 3.3 System Validation

System validation was conducted through a series of functional and performance tests designed to verify that each objective was achieved. Hardware testing involved verifying all GPIO connections, confirming OLED display accuracy, and testing LED and buzzer responses under various balance conditions. The consumption algorithm was validated by comparing calculated consumption against expected values over measured time intervals.

End-to-end integration testing evaluated the complete payment flow from M-Pesa initiation to balance update on the ESP32. Test transactions were processed through the M-Pesa sandbox environment, with response times measured from payment confirmation to meter balance reflection. Load control accuracy was tested through 50 disconnect-reconnect cycles, recording success rates for both operations.

Communication reliability was assessed by monitoring MQTT message delivery rates over extended periods, logging any failed publications or missed subscriptions. Dashboard functionality was validated through user interaction testing, verifying that all features including balance display, consumption graphs, and recharge initiation performed correctly across different devices and browsers.

---

## CHAPTER FOUR: RESULTS AND DISCUSSION

### 4.1 Hardware Implementation Results

The ESP32-based smart meter prototype was successfully assembled and programmed to perform all required metering functions. The OLED display accurately renders current balance, consumption totals, connection status, and real-time clock information obtained via NTP synchronization. The LED indicators respond correctly to balance thresholds: the green LED illuminates when balance exceeds 3 units, the red LED activates below this threshold, and the blue LED indicates load connection status.

The consumption simulation operates at a configurable rate of 0.02 units per second, equivalent to approximately 72 units per hour under continuous load. This accelerated rate was chosen for demonstration purposes; production deployment would use actual current sensing via an ACS712 module. The buzzer produces differentiated alert patterns: a slow 800Hz tone for low balance warnings and an urgent rapid-beep pattern at 2500Hz upon disconnection.

GSM functionality through the SIM800L module demonstrated inconsistent network registration in the test environment due to limited 2G coverage. However, the module successfully initializes and the SMS sending function operates correctly when network registration succeeds. The overall hardware prototype achieved stable operation over extended test periods with average power consumption of approximately 300mA at 5V.

### 4.2 Software Platform Results

The Node.js backend successfully processes M-Pesa callbacks and executes the complete automated recharge workflow. Average API response times measured 145ms for balance queries and 320ms for payment callback processing. The M-Pesa Daraja integration achieved a 96% success rate in sandbox testing, with failures attributed to timeout conditions during high-latency periods.

MQTT communication between the backend and ESP32 demonstrated 99.7% message delivery reliability over a 30-day test period. Balance update commands published by the backend were received by the ESP32 within an average of 200ms. The ESP32 successfully publishes consumption reports every 2 seconds when connected, enabling near real-time balance synchronization with Firebase.

The Firebase database maintains data consistency across concurrent connections, with read/write operations completing in under 100ms. The React dashboard renders real-time updates within 500ms of database changes, providing users with immediate feedback on balance changes and consumption patterns. User interface testing confirmed responsive behavior across desktop and mobile browsers, with consumption charts accurately reflecting historical usage data.

### 4.3 System Validation Results

End-to-end transaction testing confirmed that the complete payment-to-meter-update cycle completes in an average of 3.2 seconds, measured from M-Pesa PIN entry to balance reflection on the ESP32 OLED display. This represents a significant improvement over the traditional token-based system, which requires 3-5 minutes including SMS delivery and manual token entry.

Load control testing achieved 100% accuracy across 50 test cycles. The ESP32 correctly disconnects the load (blue LED off) when balance reaches zero and reconnects within 2 seconds of receiving a balance update command following payment. No false disconnections or reconnection failures were observed during testing.

The system demonstrated robust recovery from network interruptions. When Wi-Fi connectivity was temporarily disabled, the ESP32 automatically reconnected and resynchronized its balance with Firebase upon restoration. Queued consumption data was successfully transmitted after reconnection, ensuring no consumption records were lost.

Comparative analysis against traditional prepaid systems shows the Umeme Smart Meter reduces recharge time by approximately 98% (3 seconds versus 3-5 minutes), eliminates manual token entry errors entirely, and provides real-time consumption visibility not available in conventional meters. The prototype cost of KES 3,500 compares favorably against commercial smart meter solutions priced at KES 15,000-25,000, demonstrating the economic viability of the approach for large-scale deployment.

---

## Summary of Changes

| Section | Change |
|---------|--------|
| Objectives | Reduced from 5 to 3, shortened wording |
| Methodology | 3 sections matching objectives, paragraph format |
| Results | 3 sections matching objectives, paragraph format |
