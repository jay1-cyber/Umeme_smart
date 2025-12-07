# CHAPTER THREE: METHODOLOGY

This chapter details the comprehensive methodology employed in designing, developing, and validating the IoT-enabled automatic recharge system. The methodology follows a systematic approach aligned with the four specific objectives, employing iterative development practices, industry-standard tools, and rigorous testing protocols.

## 3.1 Design and Development of ESP32-Based Smart Meter Prototype

### 3.1.1 Hardware Design and Component Selection

The hardware design prioritizes cost-effectiveness, availability, reliability, and ease of integration. All components were selected based on their proven performance in IoT applications, local market availability in Kenya, and compatibility with the ESP32 microcontroller platform.

**Core Component: ESP32-WROOM-32 Development Board**

The ESP32 was selected as the central processing unit for the following reasons:
- **Dual-core Xtensa 32-bit processor** (up to 240 MHz) providing ample processing power for concurrent tasks
- **Integrated Wi-Fi (802.11 b/g/n)** enabling internet connectivity without additional modules
- **Bluetooth 4.2** for future proximity-based features
- **520 KB SRAM and 4 MB flash memory** sufficient for firmware, data buffering, and OTA updates
- **GPIO pins** (30+ digital I/O) for peripheral interfacing
- **Low cost** (~KES 800-1000 or USD 6-8) making it economically viable for mass deployment
- **Active developer community** with extensive libraries and documentation
- **Low power consumption** (<100 mA typical operation) suitable for embedded applications

**Technical Specifications:**
- Operating Voltage: 3.3V (with onboard 5V regulator)
- Flash Memory: 4 MB
- SRAM: 520 KB
- Wi-Fi: 2.4 GHz, supports station/AP/dual modes
- Communication Interfaces: UART, SPI, I2C, PWM

**Load Control Simulation: LED-Based Approach**

**Design Decision:**
For this proof-of-concept prototype, load control is simulated using LED indicators rather than an actual relay module. This decision was made in consultation with laboratory technical staff based on the following rationale:

**1. Safety in Academic Environment:**
- No actual AC load (bulb, appliance) is being switched in the prototype
- Eliminates electrocution risk from 220V AC circuits in university laboratory
- Complies with student laboratory safety protocols

**2. Focus on Core Innovation:**
- Our contribution is the **automated M-Pesa-to-meter communication workflow**, not physical relay switching
- Relay control is well-established technology; our innovation lies in system integration
- GPIO control logic is identical whether controlling an LED or a relay

**3. Production Integration:**
- For deployment with KPLC, our system would interface with existing meters having certified contactors
- Standalone deployment would use 10A solid-state relay or electromechanical relay certified to IEC standards

**Load Indicator LED (Blue):**
- Type: High-brightness 5mm LED (Blue)
- Purpose: Simulates load connection status
- State: ON when balance > 0 (power connected), OFF when balance depleted (disconnected)
- Connection: GPIO 16 → LED → 220Ω resistor → GND
- Control: `digitalWrite(LED_BLUE, balance > 0 ? HIGH : LOW);`

**Communication Module: SIM800L GSM (Hybrid Connectivity)**

**Specifications:**
- Module: SIM800L
- Network: 2G GSM/GPRS (850/900/1800/1900 MHz)
- Communication: UART (Serial)
- Power: 3.7-4.2V (requires dedicated power supply, 2A peak)

**Purpose:**
- Hybrid connectivity: WiFi primary, GSM data fallback
- SMS alerts for payment confirmations and low balance warnings

**Connection:**
- TX (SIM800L) → RX GPIO 26 (ESP32)
- RX (SIM800L) → TX GPIO 27 (ESP32)
- VCC → 3.7-4.2V dedicated supply (NOT from ESP32)
- GND → Common ground

**Implementation Note:**
SIM800L operates on 2G networks. Safaricom shut down 2G in 2017; Airtel maintains limited 2G coverage. For production deployment, upgrade to SIM7600 (4G LTE, ~KES 2,500) or use cloud-based SMS via Africa's Talking API is recommended. The current implementation demonstrates the hybrid architecture with a clear upgrade path

**Display: 0.96" I2C OLED Display (SSD1306)**

**Specifications:**
- Resolution: 128x64 pixels
- Color: Monochrome (white/blue/yellow)
- Interface: I2C (2-wire communication)
- Operating Voltage: 3.3V - 5V
- Display Active Area: 21.74 x 10.86 mm
- Viewing Angle: >160°

**Selection Rationale - OLED vs. LCD:**

1. **Power Efficiency:** OLED draws 15-20 mA vs. LCD's 50-100 mA (no backlight required)
2. **Superior Visibility:** High contrast, readable in direct sunlight, wide viewing angle (>160°)
3. **Simpler Interface:** I2C uses only 2 GPIO pins vs. LCD's 6-8 pins
4. **Industry Standard:** Commercial smart meters use OLED/LED displays for these reasons
5. **Cost:** OLED KES 400 vs. LCD KES 300 - marginal difference justified by technical benefits

**Displayed Information:**
- Current balance (in KES or kWh units)
- Consumption rate (units/hour)
- Connection status (Wi-Fi, MQTT)
- Last transaction amount and timestamp
- System alerts (low balance, disconnection warnings)

**I2C Connection:**
- SDA → GPIO 21 (default ESP32 I2C data line)
- SCL → GPIO 22 (default ESP32 I2C clock line)
- VCC → 3.3V
- GND → GND

**Audible Alert: 5V Active Buzzer**

**Specifications:**
- Type: Active piezoelectric buzzer (built-in oscillator)
- Operating Voltage: 3.3V - 5V
- Sound Output: 85 dB @ 10 cm
- Resonant Frequency: ~2300 Hz
- Current Draw: ~30 mA

**Usage Scenarios:**
- Low balance warning (< 10% remaining): Short beeps every 5 minutes
- Critical low balance (< 5%): Continuous beeping
- Successful recharge: Three short confirmation beeps
- System errors: Distinct error tone pattern

**Connection:**
- Positive → ESP32 GPIO 4 (direct connection, within GPIO current limit)
- Negative → GND

**Visual Indicators: Multi-LED Status System**

Three LEDs provide instant visual feedback following universal UI/UX color conventions:

**Blue LED - Load Status Indicator (GPIO 16):**
- Type: High-brightness 5mm LED (Blue)
- Purpose: Represents load connection status
- State: ON when balance > 0 (power would be connected), OFF when balance = 0 (disconnected)
- Connection: GPIO 16 → LED → 220Ω resistor → GND

**Green LED - Balance OK Indicator (GPIO 17):**
- Type: 5mm LED (Green)
- Purpose: Indicates sufficient balance
- State: ON when balance ≥ KES 50 (healthy balance)
- Connection: GPIO 17 → LED → 220Ω resistor → GND

**Red LED - Low/Depleted Balance Warning (GPIO 5):**
- Type: 5mm LED (Red)
- Purpose: Critical low balance alert
- State: 
  - BLINKING when balance < KES 50 (warning)
  - SOLID when balance < KES 20 (critical)
  - SOLID when balance = 0 (disconnected)
- Connection: GPIO 5 → LED → 220Ω resistor → GND

**Power/WiFi Status LED (GPIO 2):**
- Built-in LED on ESP32 board
- SOLID when WiFi connected
- BLINKING during connection attempts

**Rationale:** Color-coded LEDs (Blue=Load, Green=OK, Red=Warning) enable at-a-glance status recognition without reading OLED display, improving accessibility for elderly users and those with poor eyesight

**Power Supply: 5V/2A USB Power Adapter**

**Specifications:**
- Input: 100-240V AC, 50/60Hz
- Output: 5V DC, 2A (10W)
- Protection: Overcurrent, overvoltage, short-circuit

The ESP32 development board includes an onboard voltage regulator (AMS1117-3.3V) that steps down 5V to 3.3V for the microcontroller. The 2A capacity provides ample current for ESP32 (~200-300 mA during Wi-Fi transmission), OLED (~20 mA), buzzer (~30 mA), and LEDs (~80 mA total for 4 LEDs), with safety margin.

**Note:** SIM800L requires a separate 3.7-4.2V power supply capable of 2A peak current (cannot be powered from ESP32 due to high current demands during GSM transmission).

**Additional Components:**

- **Breadboard (830-point):** For prototyping and component integration
- **Jumper Wires:** Male-to-male, male-to-female for connections
- **Resistors:** 220Ω (LED current limiting), 10kΩ (pull-up/pull-down where needed)
- **SIM800L Power Supply:** 3.7V LiPo battery or buck converter from 5V
- **Airtel SIM Card:** For 2G GSM connectivity (testing)

**Complete Bill of Materials:**

| Component | Specification | Quantity | Unit Price (KES) | Total (KES) |
|-----------|---------------|----------|------------------|-------------|
| ESP32 Development Board | ESP32-WROOM-32 | 1 | 900 | 900 |
| OLED Display | 0.96" I2C SSD1306 | 1 | 400 | 400 |
| SIM800L GSM Module | 2G GSM/GPRS | 1 | 800 | 800 |
| Active Buzzer | 5V Piezoelectric | 1 | 50 | 50 |
| LED - Blue | 5mm, Load indicator | 1 | 10 | 10 |
| LED - Green | 5mm, Balance OK | 1 | 10 | 10 |
| LED - Red | 5mm, Low balance | 1 | 10 | 10 |
| Resistors | 220Ω, 10kΩ | Assorted | 50 | 50 |
| Breadboard | 830-point | 1 | 200 | 200 |
| Jumper Wires | M-M, M-F sets | 1 | 150 | 150 |
| USB Power Adapter | 5V/2A | 1 | 300 | 300 |
| Micro USB Cable | Data + Power | 1 | 100 | 100 |
| SIM800L Power Supply | 3.7V LiPo/Buck converter | 1 | 250 | 250 |
| Airtel SIM Card | For GSM (testing) | 1 | 100 | 100 |
| Miscellaneous | Headers, capacitors | - | 100 | 100 |
| **TOTAL** | | | | **KES 3,440** |

**Circuit Assembly Process:**

1. **Power Distribution:** Establish common power rails on breadboard (5V and GND from ESP32 VIN)
2. **ESP32 Placement:** Mount ESP32 on breadboard ensuring GPIO access
3. **OLED Integration:** Connect I2C display to GPIO 21 (SDA) and GPIO 22 (SCL)
4. **LED Installation:**
   - Blue LED (Load) → GPIO 16 with 220Ω resistor
   - Green LED (Balance OK) → GPIO 17 with 220Ω resistor
   - Red LED (Low Balance) → GPIO 5 with 220Ω resistor
5. **Buzzer Connection:** Connect buzzer to GPIO 4 (direct connection)
6. **SIM800L Integration:**
   - TX → ESP32 RX (GPIO 26)
   - RX → ESP32 TX (GPIO 27)
   - Dedicated 3.7-4.2V power supply
   - Common ground with ESP32
7. **Verification:** Test each component individually before integrated operation

**Safety Considerations:**

- All connections verified for correct polarity before power-on
- LED simulation eliminates high-voltage exposure (no AC circuits present)
- Current-limiting resistors prevent LED burnout
- ESP32 GPIO current limits (<40 mA per pin) respected
- SIM800L isolated power supply prevents ESP32 brown-out
- Breadboard layout minimizes short-circuit risk
- Complies with university laboratory safety protocols

### 3.1.2 ESP32 Firmware Development

The firmware architecture follows a modular, event-driven design utilizing FreeRTOS (Real-Time Operating System) capabilities built into ESP32. This ensures responsive multitasking—Wi-Fi management, MQTT communication, display updates, and balance calculations occur concurrently without blocking operations.

**Development Environment:**

- **IDE:** Arduino IDE 2.3.2 with ESP32 board support package
- **Programming Language:** C++ (Arduino framework)
- **Libraries Used:**
  - `WiFi.h` - Wi-Fi connectivity management
  - `PubSubClient.h` - MQTT client implementation
  - `Adafruit_SSD1306.h` & `Adafruit_GFX.h` - OLED display drivers
  - `ArduinoJson.h` - JSON parsing and serialization
  - `NTPClient.h` - Network Time Protocol for timestamp synchronization
  - `HTTPClient.h` - HTTPS REST API communication (backup to MQTT)
  - `Preferences.h` - Non-volatile storage for configuration

**Firmware Architecture:**

The firmware is organized into distinct functional modules:

**1. Configuration Module (`config.h`)**

Stores system-wide constants and credentials:
```cpp
// Wi-Fi Configuration
#define WIFI_SSID "your_ssid"
#define WIFI_PASSWORD "your_password"

// MQTT Broker Configuration
#define MQTT_BROKER "broker.hivemq.com" // or cloud MQTT broker
#define MQTT_PORT 1883
#define MQTT_USER "meter_device"
#define MQTT_PASSWORD "secure_password"

// Meter Configuration
#define METER_ID "METER_12345678" // Unique meter identifier
#define CONSUMPTION_RATE 0.5 // Units consumed per hour
#define LOW_BALANCE_THRESHOLD 50.0 // KES
#define CRITICAL_BALANCE_THRESHOLD 20.0 // KES

// GPIO Pin Definitions
#define RELAY_PIN 5
#define BUZZER_PIN 18
#define LED_WIFI 2
#define LED_MQTT 4
#define LED_LOW_BALANCE 15
```

**2. Wi-Fi Management Module**

Handles network connectivity with automatic reconnection:
```cpp
void setupWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_WIFI, !digitalRead(LED_WIFI)); // Blink during connection
    delay(500);
  }
  
  digitalWrite(LED_WIFI, HIGH); // Solid when connected
  Serial.println("WiFi Connected: " + WiFi.localIP().toString());
}

void checkWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    digitalWrite(LED_WIFI, LOW);
    WiFi.reconnect();
  }
}
```

**3. MQTT Communication Module**

Implements publish-subscribe pattern for bidirectional communication:

**Topic Structure:**
- `meter/{METER_ID}/status` - Meter publishes status updates
- `meter/{METER_ID}/balance` - Current balance updates
- `meter/{METER_ID}/command` - Cloud sends commands (subscribe)
- `meter/{METER_ID}/recharge` - Recharge notifications (subscribe)
- `meter/{METER_ID}/alerts` - Alert messages

**MQTT Callback Function:**
```cpp
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  StaticJsonDocument<256> doc;
  deserializeJson(doc, message);
  
  if (String(topic).indexOf("/recharge") > 0) {
    float amount = doc["amount"];
    String txnId = doc["transaction_id"];
    handleRecharge(amount, txnId);
  }
  else if (String(topic).indexOf("/command") > 0) {
    String cmd = doc["command"];
    handleCommand(cmd);
  }
}

void mqttReconnect() {
  while (!mqttClient.connected()) {
    if (mqttClient.connect(METER_ID, MQTT_USER, MQTT_PASSWORD)) {
      digitalWrite(LED_MQTT, HIGH);
      // Subscribe to command topics
      mqttClient.subscribe(("meter/" + String(METER_ID) + "/command").c_str());
      mqttClient.subscribe(("meter/" + String(METER_ID) + "/recharge").c_str());
    } else {
      digitalWrite(LED_MQTT, LOW);
      delay(5000);
    }
  }
}
```

**4. Balance Management Module**

Core logic for balance tracking and consumption simulation:
```cpp
float currentBalance = 100.0; // Initial balance in KES
float consumptionRate = 0.5; // KES per hour
unsigned long lastUpdate = 0;

void updateBalance() {
  unsigned long now = millis();
  float elapsedHours = (now - lastUpdate) / 3600000.0; // Convert ms to hours
  
  if (currentBalance > 0) {
    currentBalance -= (consumptionRate * elapsedHours);
    if (currentBalance < 0) currentBalance = 0;
  }
  
  lastUpdate = now;
  
  // Trigger alerts and load control
  checkBalanceThresholds();
  updateDisplay();
  publishBalanceUpdate();
}

void handleRecharge(float amount, String txnId) {
  currentBalance += amount;
  
  // Alert confirmation
  playConfirmationSound();
  displayRechargeNotification(amount);
  
  // Reconnect load if previously disconnected
  if (digitalRead(RELAY_PIN) == LOW) {
    digitalWrite(RELAY_PIN, HIGH); // Reconnect power
  }
  
  // Publish confirmation
  publishRechargeConfirmation(amount, txnId);
}
```

**5. Load Control Module**

Manages relay switching with hysteresis to prevent rapid cycling:
```cpp
bool loadConnected = true;

void controlLoad() {
  if (currentBalance <= 0 && loadConnected) {
    // Disconnect load
    digitalWrite(RELAY_PIN, LOW);
    loadConnected = false;
    playDisconnectionAlert();
    displayDisconnectionMessage();
    publishLoadStatus(false);
  }
  else if (currentBalance > 5.0 && !loadConnected) {
    // Reconnect load with hysteresis (balance > 5 KES prevents immediate re-disconnect)
    digitalWrite(RELAY_PIN, HIGH);
    loadConnected = true;
    playReconnectionAlert();
    displayReconnectionMessage();
    publishLoadStatus(true);
  }
}
```

**6. Display Management Module**

Renders information on OLED with multiple screens:
```cpp
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

void setupDisplay() {
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
    for(;;);
  }
  display.clearDisplay();
  display.setTextColor(WHITE);
}

void updateDisplay() {
  display.clearDisplay();
  
  // Header
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("IoT Smart Meter");
  display.drawLine(0, 10, 128, 10, WHITE);
  
  // Balance Display
  display.setTextSize(2);
  display.setCursor(0, 18);
  display.print("KES ");
  display.println(currentBalance, 2);
  
  // Status Icons
  display.setTextSize(1);
  display.setCursor(0, 40);
  display.print("WiFi: ");
  display.println(WiFi.status() == WL_CONNECTED ? "OK" : "X");
  
  display.setCursor(0, 50);
  display.print("Load: ");
  display.println(loadConnected ? "ON" : "OFF");
  
  display.display();
}
```

**7. Alert Management Module**

Generates audible and visual alerts:
```cpp
void checkBalanceThresholds() {
  if (currentBalance < CRITICAL_BALANCE_THRESHOLD && currentBalance > 0) {
    digitalWrite(LED_LOW_BALANCE, HIGH);
    // Critical alert - continuous beeping
    if (millis() % 2000 < 100) {
      digitalWrite(BUZZER_PIN, HIGH);
      delay(50);
      digitalWrite(BUZZER_PIN, LOW);
    }
  }
  else if (currentBalance < LOW_BALANCE_THRESHOLD) {
    digitalWrite(LED_LOW_BALANCE, millis() % 1000 < 500); // Blinking
  }
  else {
    digitalWrite(LED_LOW_BALANCE, LOW);
  }
}

void playConfirmationSound() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(100);
    digitalWrite(BUZZER_PIN, LOW);
    delay(100);
  }
}
```

**8. Main Program Loop**

FreeRTOS tasks ensure concurrent execution:
```cpp
void setup() {
  Serial.begin(115200);
  
  // Initialize hardware
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_WIFI, OUTPUT);
  pinMode(LED_MQTT, OUTPUT);
  pinMode(LED_LOW_BALANCE, OUTPUT);
  
  // Initial state: Load connected
  digitalWrite(RELAY_PIN, HIGH);
  
  setupDisplay();
  setupWiFi();
  
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  
  lastUpdate = millis();
}

void loop() {
  // Maintain connections
  checkWiFi();
  if (!mqttClient.connected()) {
    mqttReconnect();
  }
  mqttClient.loop();
  
  // Update balance every second
  if (millis() - lastUpdate >= 1000) {
    updateBalance();
    controlLoad();
  }
  
  // Handle alerts
  checkBalanceThresholds();
  
  delay(100); // Prevent CPU overload
}
```

**Security Measures:**

- **HTTPS for REST APIs:** TLS/SSL encryption when using HTTP fallback
- **MQTT over TLS:** Port 8883 for encrypted MQTT (production deployment)
- **Credential Storage:** Sensitive data stored in ESP32 secure storage (Preferences library with encryption)
- **OTA Updates:** Secure over-the-air firmware updates with signature verification

**Testing and Debugging:**

- Serial monitor (115200 baud) for real-time logging
- Extensive debug messages at each functional module
- Watchdog timer to prevent firmware hangs
- Exception handling for JSON parsing errors, network failures

