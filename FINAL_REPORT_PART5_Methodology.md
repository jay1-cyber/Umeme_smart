# CHAPTER THREE: METHODOLOGY

This chapter details the methodology for designing, developing, and validating the IoT-enabled automatic recharge system.

## 3.1 Design and Development of ESP32-Based Smart Meter Prototype

### 3.1.1 Hardware Design and Component Selection

**Core Component: ESP32-WROOM-32 Development Board**

The ESP32 was selected for its dual-core processor (240 MHz), integrated Wi-Fi, 4 MB flash memory, 30+ GPIO pins, and low cost (~KES 900 or USD 7). Key specifications:
- Operating Voltage: 3.3V (with onboard 5V regulator)
- Wi-Fi: 2.4 GHz, supports station/AP modes
- Communication Interfaces: UART, SPI, I2C, PWM

**Load Control Simulation: LED-Based Approach**

For safety in the academic environment, load control is simulated using a blue LED rather than an actual relay. The GPIO control logic is identical whether controlling an LED or relay, making the proof-of-concept directly applicable to production deployment.

**Load Indicator LED (Blue):** GPIO 16 → LED → 220Ω resistor → GND. ON when balance > 0, OFF when balance = 0.

**Communication Module: SIM800L GSM**

SIM800L provides hybrid connectivity (WiFi primary, GSM fallback) and SMS alerts. Connected via UART (TX→GPIO26, RX→GPIO27) with dedicated 3.7-4.2V power supply. For production, upgrade to SIM7600 (4G LTE) is recommended.

**Display: 0.96" I2C OLED (SSD1306)**

128x64 pixel monochrome display connected via I2C (SDA→GPIO21, SCL→GPIO22). Displays current balance, consumption rate, connection status, and alerts. OLED selected over LCD for lower power consumption (15-20mA vs 50-100mA) and better visibility.

**Audible Alert: 5V Active Buzzer**

Connected to GPIO 4. Provides audio feedback for low balance warnings, recharge confirmations, and system alerts.

**Visual Indicators: Multi-LED Status System**

- **Blue LED (GPIO 16):** Load status - ON when balance > 0
- **Green LED (GPIO 17):** Balance OK - ON when balance ≥ KES 50
- **Red LED (GPIO 5):** Warning - BLINKING when balance < 50, SOLID when < 20
- **Built-in LED (GPIO 2):** WiFi status

**Power Supply:** 5V/2A USB adapter. SIM800L requires separate 3.7-4.2V supply.

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
| Safaricom SIM Card | For GSM (testing) | 1 | 100 | 100 |
| Miscellaneous | Headers, capacitors | - | 100 | 100 |
| **TOTAL** | | | | **KES 3,440** |

**Circuit Assembly Process:**

1. Mount ESP32 on breadboard with 5V/GND power rails
2. Connect OLED via I2C (SDA→GPIO21, SCL→GPIO22)
3. Install LEDs with 220Ω resistors (Blue→GPIO16, Green→GPIO17, Red→GPIO5)
4. Connect buzzer to GPIO4
5. Connect SIM800L (TX→GPIO26, RX→GPIO27) with separate power supply
6. Test each component individually before integration

All connections comply with university laboratory safety protocols. LED simulation eliminates high-voltage exposure.

### 3.1.2 ESP32 Firmware Development

The firmware uses Arduino IDE with ESP32 board support, implementing a modular event-driven design with FreeRTOS for concurrent Wi-Fi management, MQTT communication, and display updates.

**Key Libraries:** WiFi.h, PubSubClient.h (MQTT), Adafruit_SSD1306.h (OLED), ArduinoJson.h

**Firmware Modules:**

**1. Configuration Module:** Stores Wi-Fi credentials, MQTT broker settings, meter ID, consumption rate, and GPIO pin definitions.

**2. Wi-Fi Management:** Handles connection with automatic reconnection and LED status indication.

**3. MQTT Communication:** Implements publish-subscribe pattern with topics for status, balance, commands, recharge notifications, and alerts.

**4. Balance Management:** Tracks balance with simulated consumption, handles recharge commands, and triggers load control.

**5. Load Control:** Manages LED switching based on balance with hysteresis to prevent rapid cycling.

**6. Display Management:** Renders balance, consumption rate, and connection status on OLED.

**7. Alert Management:** Generates buzzer and LED alerts for low balance thresholds.

**Key Code Snippets:**

```cpp
// MQTT Callback - handles recharge commands
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<256> doc;
  deserializeJson(doc, payload, length);
  
  if (String(topic).indexOf("/recharge") > 0) {
    float amount = doc["amount"];
    currentBalance += amount;
    playConfirmationSound();
    if (!loadConnected) digitalWrite(RELAY_PIN, HIGH);
  }
}

// Main loop
void loop() {
  checkWiFi();
  if (!mqttClient.connected()) mqttReconnect();
  mqttClient.loop();
  
  if (millis() - lastUpdate >= 1000) {
    updateBalance();
    controlLoad();
  }
  checkBalanceThresholds();
}
```

**Security:** HTTPS/TLS encryption, secure credential storage, OTA update capability.

