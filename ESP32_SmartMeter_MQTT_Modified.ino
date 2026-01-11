/*
  ESP32 Smart Meter - MQTT + Node.js Backend Integration v3.1
  -----------------------------------------------------------
  • MQTT-based two-way communication with backend
  • Real-time balance updates via MQTT (no polling)
  • Consumption reporting via MQTT
  • OLED display for status
  • SMS notifications via SIM800L
  • Time-based unit consumption
  • HYBRID: WiFi primary, GPRS+MQTT fallback
  • All original pins maintained
*/

// TinyGSM must be defined BEFORE including the library
#define TINY_GSM_MODEM_SIM800
#define TINY_GSM_RX_BUFFER 512

#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGsmClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <time.h>

// ---------- OLED ----------
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ---------- WiFi CONFIG ----------
const char* WIFI_SSID  = "main.gy";
const char* WIFI_PASS  = "maingithe1";

// ---------- MQTT CONFIG ----------
const char* MQTT_SERVER = "broker.hivemq.com";  // Change to your broker
const int   MQTT_PORT = 1883;
const char* MQTT_USER = "";  // Leave empty for public broker
const char* MQTT_PASS = "";  // Leave empty for public broker

// ---------- BACKEND CONFIG ----------
const char* BACKEND_HOST = "http://192.168.1.101:3000";
const char* METER_NO     = "55555";
const char* API_KEY      = "super-secret-esp-key";

// ---------- NTP TIME CONFIG ----------
const char* NTP_SERVER = "pool.ntp.org";
const long  GMT_OFFSET_SEC = 10800;  // Kenya is GMT+3 (3 * 3600 = 10800 seconds)
const int   DAYLIGHT_OFFSET_SEC = 0; // No daylight saving in Kenya

// ---------- MQTT TOPICS ----------
String topicBalanceCommand;    // Backend -> ESP32: balance updates
String topicConsumption;       // ESP32 -> Backend: consumption reports
String topicStatus;            // ESP32 -> Backend: status updates
String topicBalanceReport;     // ESP32 -> Backend: current balance

// Timing parameters
const unsigned long CONSUMPTION_INTERVAL_MS = 1000;    // Decrement every 1 second
const unsigned long DISPLAY_UPDATE_MS = 1000;          // Update display every 1 second
const unsigned long MQTT_PUBLISH_INTERVAL = 2000;      // Publish consumption every 2s for ultra real-time
const unsigned long STATUS_PUBLISH_INTERVAL = 30000;   // Publish status every 30s
const unsigned long HTTP_FALLBACK_INTERVAL = 300000;   // HTTP fallback every 5 min if MQTT fails
const unsigned long RECHARGE_DISPLAY_TIME = 4000;      // Show recharge for 4 seconds

// Consumption parameters
const float UNITS_PER_SECOND = 0.02;                   // Units consumed per SECOND (1 unit = 50 seconds)
const float COST_PER_UNIT = 25.0;                      // Cost per unit
const float ALERT_THRESHOLD = 3.0;                     // Critically low balance alert threshold (< 3 units)

// Simulated power parameters
const float NOMINAL_VOLTAGE = 230.0;
const float BASE_CURRENT = 4.5;
const float CURRENT_VARIATION = 1.5;

// ---------- Pins (YOUR ORIGINAL PINS) ----------
const int LED_BLUE  = 16;  // Load ON indicator
const int LED_GREEN = 17;  // Balance OK indicator
const int LED_RED   = 5;   // Low balance indicator
const int BUZZER_PIN= 4;   // Alert buzzer
const int PWR_LED   = 2;   // Power indicator

// SIM800L pins
#define SIM_RX_PIN 26
#define SIM_TX_PIN 27
HardwareSerial SIM800(2);

// TinyGSM modem instance
TinyGsm modem(SIM800);

// ---------- GSM/GPRS CONFIG ----------
const char* APN = "internet";           // Safaricom/Airtel APN
const char* APN_USER = "";              // Leave empty for most carriers
const char* APN_PASS = "";              // Leave empty for most carriers
bool gsmInitialized = false;
bool gprsConnected = false;
unsigned long lastGPRSCheck = 0;
const unsigned long GPRS_CHECK_INTERVAL = 60000;  // Check GPRS every 60s when WiFi down

// ---------- State Variables ----------
float balance = 0.0;
float lastKnownBalance = 0.0;
float totalConsumed = 0.0;
float sessionUnits = 0.0;              // Units to report in next MQTT publish

// Simulated readings
float currentPower = 0.0;
float currentVoltage = NOMINAL_VOLTAGE;
float currentCurrent = 0.0;

// System state
bool  loadOn = true;
String phoneNumber = "+254743324047";  // FALLBACK: Your registered phone number
String userName = "Smartass";          // FALLBACK: Your registered name
String userEmail = "";
unsigned long lastConsumption = 0;
unsigned long lastDisplayUpdate = 0;
unsigned long lastMQTTPublish = 0;
unsigned long lastStatusPublish = 0;
unsigned long lastHTTPFallback = 0;
unsigned long consumptionStartTime = 0;
bool  lowAlertSent = false;
bool  wifiConnected = false;
bool  mqttConnected = false;
int   displayMode = 0;

// Recharge history for OLED display
struct RechargeRecord {
  float amount;
  unsigned long timestamp;
};
RechargeRecord rechargeHistory[5];  // Store last 5 recharges
int rechargeCount = 0;
bool showingRecharge = false;
unsigned long rechargeDisplayStart = 0;
float lastRechargeAmount = 0.0;
unsigned long lastRechargeTime = 0;              // Timestamp of last recharge for cooldown
const unsigned long RECHARGE_COOLDOWN_MS = 15000; // 15 second cooldown after recharge
float lastRechargeBalance = -1.0;                     // Track balance at last recharge to prevent duplicates

// WiFi and MQTT clients
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Note: GPRS uses HTTP fallback only (MQTT over GPRS removed for reliability)

// ---------- Function Declarations ----------
void setupWiFi();
void setupMQTT();
void reconnectMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void publishConsumption();
void publishStatus(String status, String message);
void updateBalance(float newBalance);
void updatePowerReadings();
void decrementUnits();
void updateDisplay();
void updateIndicators();
void sendSMS(const String &to, const String &msg);
bool fetchBalanceHTTP();
void addRechargeToHistory(float amount);
void displayRechargeHistory();
bool fetchUserInfo();
void sendLowBalanceAlert();
void sendDisconnectionAlert();
bool initGSM();
void syncModemForGPRS();
bool connectGPRS();
void disconnectGPRS();
bool fetchBalanceGPRS();
bool waitForResponse(const char* expected, unsigned long timeout);
String getGSMResponse(unsigned long timeout);
void clearGSMBuffer();
void sendRechargeAlert(float recharged, float newBalance);

// ---------- Setup ----------
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n\n=================================");
  Serial.println("ESP32 Smart Meter v3.0");
  Serial.println("MQTT + Backend Integration");
  Serial.println("=================================\n");
  
  // Pin setup
  pinMode(LED_BLUE, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(PWR_LED, OUTPUT);
  digitalWrite(PWR_LED, HIGH);
  
  // OLED initialization
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("[ERROR] OLED initialization failed!");
    while(1);
  }
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Smart Meter v3.0");
  display.println("");
  display.println("MQTT Integration");
  display.println("Initializing...");
  display.display();
  delay(2000);
  
  // SIM800L initialization
  SIM800.begin(9600, SERIAL_8N1, SIM_RX_PIN, SIM_TX_PIN);
  Serial.println("[INIT] SIM800L serial ready");
  delay(3000);  // Give SIM800L time to boot
  
  // Initialize GSM module
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Initializing GSM...");
  display.display();
  
  if (initGSM()) {
    Serial.println("[INIT] GSM module ready for SMS and data");
  } else {
    Serial.println("[WARNING] GSM initialization failed - SMS/GPRS may not work");
  }
  
  // Setup MQTT topics
  topicBalanceCommand = "smartmeter/" + String(METER_NO) + "/command/balance";
  topicConsumption = "smartmeter/" + String(METER_NO) + "/consumption";
  topicStatus = "smartmeter/" + String(METER_NO) + "/status";
  topicBalanceReport = "smartmeter/" + String(METER_NO) + "/balance";
  
  Serial.println("[MQTT] Topics configured:");
  Serial.println("  Balance Command: " + topicBalanceCommand);
  Serial.println("  Consumption: " + topicConsumption);
  Serial.println("  Status: " + topicStatus);
  
  // WiFi connection
  setupWiFi();
  
  // Initialize NTP time
  if (wifiConnected) {
    Serial.println("[NTP] Configuring time...");
    configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);
    Serial.println("[NTP] Time sync started");
  }
  
  // MQTT setup
  setupMQTT();
  
  // Fetch user info and initial balance
  if (wifiConnected) {
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("Fetching user info");
    display.println("from backend...");
    display.display();
    
    // First fetch user info (name, phone)
    if (fetchUserInfo()) {
      Serial.println("[INIT] User info loaded successfully");
      Serial.printf("[INFO] Name: %s\n", userName.c_str());
      Serial.printf("[INFO] Phone: %s\n", phoneNumber.c_str());
    } else {
      Serial.println("[WARNING] Could not fetch user info");
    }
    
    // Then fetch balance
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("Fetching balance");
    display.println("from backend...");
    display.display();
    
    if (fetchBalanceHTTP()) {
      Serial.println("[INIT] Balance loaded successfully");
    } else {
      Serial.println("[WARNING] Could not fetch initial balance");
    }
  }
  
  updateIndicators();
  updateDisplay();
  
  // Initialize timers
  lastConsumption = millis();
  lastDisplayUpdate = millis();
  lastMQTTPublish = millis();
  lastStatusPublish = millis();
  lastHTTPFallback = millis();
  lastGPRSCheck = millis();
  consumptionStartTime = millis();
  lastKnownBalance = balance;
  
  Serial.println("\n[READY] Smart Meter initialized!");
  Serial.printf("[INFO] MQTT Server: %s:%d\n", MQTT_SERVER, MQTT_PORT);
  Serial.printf("[INFO] Meter No: %s\n", METER_NO);
  Serial.printf("[INFO] User: %s\n", userName.c_str());
  Serial.printf("[INFO] Phone: %s\n", phoneNumber.c_str());
  Serial.printf("[INFO] Initial Balance: %.2f units\n", balance);
  Serial.printf("[INFO] Consumption rate: %.2f units/second\n", UNITS_PER_SECOND);
  
  // Initialize recharge history
  for (int i = 0; i < 5; i++) {
    rechargeHistory[i].amount = 0.0;
    rechargeHistory[i].timestamp = 0;
  }
  Serial.println("=================================\n");
}

// ---------- Main Loop ----------
void loop() {
  unsigned long now = millis();
  
  // Check WiFi status
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    Serial.println("[WiFi] Disconnected! Reconnecting...");
    setupWiFi();
  } else {
    wifiConnected = true;
  }
  
  // Maintain MQTT connection
  if (!mqttClient.connected()) {
    mqttConnected = false;
    reconnectMQTT();
  } else {
    mqttConnected = true;
    mqttClient.loop();
  }
  
  // Time-based unit consumption
  decrementUnits();
  
  // Publish consumption data periodically via MQTT (every 5 seconds for real-time)
  if (now - lastMQTTPublish >= MQTT_PUBLISH_INTERVAL) {
    lastMQTTPublish = now;
    
    if (sessionUnits > 0.001) {
      publishConsumption();
    }
  }
  
  // Check if we should stop showing recharge notification
  if (showingRecharge && (now - rechargeDisplayStart >= RECHARGE_DISPLAY_TIME)) {
    showingRecharge = false;
    Serial.println("[DISPLAY] ⏹️ Recharge notification ended, returning to normal display");
    
    // Turn off celebration LEDs
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_BLUE, LOW);
    
    // Update indicators to correct state
    updateIndicators();
  }
  
  // Publish status periodically
  if (now - lastStatusPublish >= STATUS_PUBLISH_INTERVAL) {
    lastStatusPublish = now;
    
    String status = balance > ALERT_THRESHOLD ? "online" : (balance > 0 ? "low_balance" : "disconnected");
    String msg = balance > 0 ? "Operating normally" : "No balance";
    publishStatus(status, msg);
  }
  
  // GPRS HTTP fallback when WiFi is down
  if (!wifiConnected && now - lastHTTPFallback >= 30000) {  // Check every 30 seconds when WiFi down
    lastHTTPFallback = now;
    Serial.println("[GPRS] WiFi down, using GPRS HTTP fallback...");
    fetchBalanceGPRS();  // This will connect GPRS if needed
  }
  
  // Disconnect GPRS when WiFi is restored to save data
  if (wifiConnected && gprsConnected) {
    Serial.println("[GPRS] WiFi restored, disconnecting GPRS to save data...");
    disconnectGPRS();
  }
  
  // Update display periodically
  if (now - lastDisplayUpdate >= DISPLAY_UPDATE_MS) {
    lastDisplayUpdate = now;
    updateDisplay();
    updateIndicators();
  }
  
  // Handle load disconnection when balance exhausted
  if (balance <= 0 && loadOn) {
    loadOn = false;
    Serial.println("[ALERT] LOAD DISCONNECTED - Balance exhausted");
    
    // Send disconnection SMS
    if (phoneNumber.length() > 5) {
      sendDisconnectionAlert();
    }
    
    publishStatus("disconnected", "Balance exhausted");
    updateIndicators();
    updateDisplay();
  }
  
  delay(50);
}

// ---------- WiFi Setup ----------
void setupWiFi() {
  Serial.print("[WIFI] Connecting to: ");
  Serial.println(WIFI_SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Connecting WiFi...");
  display.println(WIFI_SSID);
  display.display();
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("[WIFI] Connected!");
    Serial.print("[WIFI] IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WIFI] Signal: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    wifiConnected = false;
    Serial.println("[ERROR] WiFi connection failed");
  }
}

// ---------- MQTT Setup ----------
void setupMQTT() {
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setKeepAlive(60);
  mqttClient.setSocketTimeout(30);
  
  Serial.println("[MQTT] Configured");
  reconnectMQTT();
}

// ---------- MQTT Reconnection ----------
void reconnectMQTT() {
  if (!wifiConnected) {
    return;
  }
  
  int attempts = 0;
  while (!mqttClient.connected() && attempts < 3) {
    Serial.print("[MQTT] Connecting to broker... ");
    
    String clientId = "ESP32_METER_" + String(METER_NO) + "_" + String(random(0xffff), HEX);
    
    if (mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASS)) {
      Serial.println("Connected!");
      mqttConnected = true;
      
      // Subscribe to balance command topic
      mqttClient.subscribe(topicBalanceCommand.c_str());
      Serial.println("[MQTT] Subscribed to: " + topicBalanceCommand);
      
      // Publish status
      publishStatus("online", "Device connected to MQTT broker");
      
      // Blink green LED
      for (int i = 0; i < 3; i++) {
        digitalWrite(LED_GREEN, HIGH);
        delay(100);
        digitalWrite(LED_GREEN, LOW);
        delay(100);
      }
    } else {
      Serial.print("Failed, rc=");
      Serial.println(mqttClient.state());
      attempts++;
      delay(2000);
    }
  }
}

// ---------- MQTT Callback (Receive Messages) ----------
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("[MQTT] Message received on: ");
  Serial.println(topic);
  
  // Convert payload to string
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.print("[MQTT] Payload: ");
  Serial.println(message);
  
  // Parse JSON
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, message);
  
  if (error) {
    Serial.print("[ERROR] JSON parse error: ");
    Serial.println(error.c_str());
    return;
  }
  
  // Handle balance update command
  if (String(topic) == topicBalanceCommand) {
    if (doc.containsKey("balance")) {
      float newBalance = doc["balance"];
      updateBalance(newBalance);
      Serial.print("[MQTT] Balance updated to: ");
      Serial.println(newBalance, 4);
    }
  }
}

// ---------- Update Balance ----------
void updateBalance(float newBalance) {
  unsigned long now = millis();
  
  // PROTECTION: Ignore stale balance updates during recharge cooldown period
  // This prevents race condition where old consumption reports reset balance to 0
  bool inCooldown = (now - lastRechargeTime) < RECHARGE_COOLDOWN_MS;
  
  if ((showingRecharge || inCooldown) && newBalance < balance) {
    Serial.printf("[BALANCE] Ignoring stale update (%.2f < %.2f) - cooldown active\n", newBalance, balance);
    return;
  }
  
  // Check for recharge (balance increased by ANY amount)
  float difference = newBalance - balance;
  
  // Detect recharge: balance must increase by at least 0.5 units (real payment)
  // Also check we're not detecting the same recharge twice
  bool isNewRecharge = (difference >= 0.5) && (newBalance != lastRechargeBalance);
  
  if (isNewRecharge) {
    float recharged = difference;
    Serial.printf("[RECHARGE] ✅ Payment detected! +%.1f units | Old: %.1f → New: %.1f units\n", 
                  recharged, balance, newBalance);
    
    // Set cooldown timestamp and remember this balance to prevent duplicates
    lastRechargeTime = now;
    lastRechargeBalance = newBalance;
    
    // Add to recharge history
    addRechargeToHistory(recharged);
    lastRechargeAmount = recharged;
    
    loadOn = true;  // Re-enable load
    lowAlertSent = false;  // Reset low balance flag
    
    // Send recharge confirmation SMS (only once per payment)
    if (phoneNumber.length() > 5) {
      String msg = "Recharge successful! +" + String(recharged, 1) +
                   " units added. New balance: " + String(newBalance, 1) + " units. Thank you!";
      sendSMS(phoneNumber, msg);
      Serial.println("[SMS] Recharge confirmation sent");
    }
  }
  
  // Update balance first
  balance = newBalance;
  lastKnownBalance = newBalance;
  
  // Update load state
  loadOn = (balance > 0);
  
  // NOW show recharge notification (after balance is updated) - only for real recharges
  if (isNewRecharge) {
    showingRecharge = true;
    rechargeDisplayStart = millis();
    Serial.println("[DISPLAY] Showing recharge notification for 4 seconds");
    
    // Turn on LEDs (will stay on during notification)
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_BLUE, HIGH);
  }
  
  // Publish acknowledgment
  StaticJsonDocument<200> doc;
  doc["meterNo"] = METER_NO;
  doc["balance"] = balance;
  doc["timestamp"] = millis();
  
  String output;
  serializeJson(doc, output);
  mqttClient.publish(topicBalanceReport.c_str(), output.c_str());
  
  updateDisplay();
}

// ---------- Publish Consumption ----------
void publishConsumption() {
  if (!mqttConnected) {
    Serial.println("[MQTT] Not connected, skipping publish");
    return;
  }
  
  float remainingBalance = balance;
  
  Serial.println("=== Publishing Consumption ===");
  Serial.print("Units consumed: ");
  Serial.println(sessionUnits, 4);
  Serial.print("Remaining balance: ");
  Serial.println(remainingBalance, 4);
  
  // Create JSON payload
  StaticJsonDocument<300> doc;
  doc["meterNo"] = METER_NO;
  doc["unitsConsumed"] = sessionUnits;
  doc["remainingBalance"] = remainingBalance;
  doc["totalConsumed"] = totalConsumed;
  doc["timestamp"] = millis();
  
  String output;
  serializeJson(doc, output);
  
  // Publish to MQTT
  if (mqttClient.publish(topicConsumption.c_str(), output.c_str(), true)) {
    Serial.println("[MQTT] Consumption published successfully");
    sessionUnits = 0;  // Reset session counter
  } else {
    Serial.println("[MQTT] Failed to publish consumption");
  }
}

// ---------- Publish Status ----------
void publishStatus(String status, String message) {
  if (!mqttConnected) return;
  
  StaticJsonDocument<300> doc;
  doc["meterNo"] = METER_NO;
  doc["status"] = status;
  doc["message"] = message;
  doc["balance"] = balance;
  doc["wifi_rssi"] = WiFi.RSSI();
  doc["loadOn"] = loadOn;
  doc["timestamp"] = millis();
  
  String output;
  serializeJson(doc, output);
  
  mqttClient.publish(topicStatus.c_str(), output.c_str());
  Serial.println("[MQTT] Status published: " + status);
}

// ---------- Power Reading (Cumulative Consumption) ----------
void updatePowerReadings() {
  // Show cumulative power consumed based on total units consumed
  // 1 unit = 1 kWh = 1000 Wh
  if (loadOn && balance > 0) {
    // Calculate instantaneous power based on consumption rate
    // UNITS_PER_SECOND units/s = UNITS_PER_SECOND kWh/s = UNITS_PER_SECOND * 1000 * 3600 W
    currentPower = UNITS_PER_SECOND * 1000.0 * 3600.0;  // Convert to Watts
    currentVoltage = NOMINAL_VOLTAGE;
    currentCurrent = currentPower / currentVoltage;
  } else {
    currentCurrent = 0;
    currentPower = 0;
  }
}

// ---------- Time-Based Unit Consumption ----------
void decrementUnits() {
  unsigned long now = millis();
  
  if (consumptionStartTime == 0) {
    consumptionStartTime = now;
    lastConsumption = now;
    return;
  }
  
  if (now - lastConsumption >= CONSUMPTION_INTERVAL_MS) {
    if (loadOn && balance > 0) {
      unsigned long intervalsPassed = (now - lastConsumption) / CONSUMPTION_INTERVAL_MS;
      float unitsToDecrement = UNITS_PER_SECOND * intervalsPassed;
      
      balance -= unitsToDecrement;
      totalConsumed += unitsToDecrement;
      sessionUnits += unitsToDecrement;
      
      if (balance < 0) {
        balance = 0;
        loadOn = false;
      }
      
      Serial.printf("[CONSUMPTION] -%.2f units | Balance: %.1f units | Total: %.1f units\n",
                    unitsToDecrement, balance, totalConsumed);
      
      lastConsumption = now;
      
      // Low balance alert (< 5 units)
      if (balance < ALERT_THRESHOLD && balance > 0 && !lowAlertSent && phoneNumber.length() > 5) {
        sendLowBalanceAlert();
        lowAlertSent = true;
      }
      
      if (balance >= ALERT_THRESHOLD) {
        lowAlertSent = false;
      }
    } else {
      lastConsumption = now;
    }
  }
  
  updatePowerReadings();
}

// ---------- Display Functions ----------
void updateDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  
  // Show recharge notification if recent recharge
  if (showingRecharge) {
    displayRechargeHistory();
    display.display();
    return;
  }
  
  // Get current time
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    // If time not synced yet, show "Syncing..."
    display.setCursor(0, 0);
    display.print("Time: Syncing...");
  } else {
    // Display date and time at the top
    display.setCursor(0, 0);
    char timeStr[20];
    strftime(timeStr, sizeof(timeStr), "%H:%M:%S", &timeinfo);
    display.print(timeStr);
    
    display.setCursor(70, 0);
    char dateStr[20];
    strftime(dateStr, sizeof(dateStr), "%d/%m/%y", &timeinfo);
    display.print(dateStr);
  }
  
  if (displayMode == 0) {
    // Main display - adjusted Y positions to accommodate time display
    display.setCursor(0, 12);
    display.printf("Meter: %s", METER_NO);
    
    display.setCursor(0, 24);
    display.printf("Balance: %.1f units", balance);
    
    display.setCursor(0, 36);
    display.printf("Consumed: %.1f kWh", totalConsumed);
    
    display.setCursor(0, 48);
    // Show status
    display.print("Status: ");
    if (!wifiConnected || !mqttConnected) {
      display.print("OFFLINE");
    } else if (balance <= 0) {
      display.print("NO POWER");
    } else if (balance < ALERT_THRESHOLD) {
      display.print("LOW BAL");
    } else {
      display.print("ONLINE");
    }
    
  } else {
    // Detailed display - Recharge history
    display.setCursor(0, 0);
    display.println("RECHARGE HISTORY");
    display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
    
    int yPos = 14;
    for (int i = rechargeCount - 1; i >= 0 && i >= rechargeCount - 4; i--) {
      if (rechargeHistory[i].amount > 0) {
        display.setCursor(0, yPos);
        display.printf("+%.2f units", rechargeHistory[i].amount);
        yPos += 12;
      }
    }
    
    if (rechargeCount == 0) {
      display.setCursor(0, 30);
      display.print("No recharges yet");
    }
  }
  
  display.display();
}

// ---------- Add Recharge to History ----------
void addRechargeToHistory(float amount) {
  // Shift history if full
  if (rechargeCount >= 5) {
    for (int i = 0; i < 4; i++) {
      rechargeHistory[i] = rechargeHistory[i + 1];
    }
    rechargeCount = 4;
  }
  
  // Add new recharge
  rechargeHistory[rechargeCount].amount = amount;
  rechargeHistory[rechargeCount].timestamp = millis();
  rechargeCount++;
  
  Serial.printf("[HISTORY] Recharge added: +%.2f units (Total records: %d)\n", amount, rechargeCount);
}

// ---------- Display Recharge Notification ----------
void displayRechargeHistory() {
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  
  // Big success banner
  display.setCursor(5, 0);
  display.println("SUCCESS!");
  
  // Draw separator line
  display.drawLine(0, 18, 128, 18, SSD1306_WHITE);
  
  display.setTextSize(1);
  display.setCursor(0, 24);
  display.println("Payment Received:");
  
  display.setTextSize(2);
  display.setCursor(10, 36);
  display.printf("+%.2f", lastRechargeAmount);
  
  display.setTextSize(1);
  display.setCursor(0, 54);
  display.printf("Balance: %.2f units", balance);
  
  // Show animation dots
  int anim = (millis() / 200) % 4;
  display.setCursor(115, 54);
  if (anim == 0) display.print(".");
  else if (anim == 1) display.print("..");
  else if (anim == 2) display.print("...");
  else display.print(".");
}

// ---------- Update Indicators ----------
void updateIndicators() {
  // Blue LED (Load): ON unless balance is 0
  if (balance > 0) {
    digitalWrite(LED_BLUE, HIGH);
    loadOn = true;
  } else {
    digitalWrite(LED_BLUE, LOW);
    loadOn = false;
  }
  
  // Green LED: ON when balance > 3 units
  if (balance > ALERT_THRESHOLD) {
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_RED, LOW);
    noTone(BUZZER_PIN);
  } 
  // Balance <= 3 but > 0: Low frequency warning beeps
  else if (balance > 0) {
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, HIGH);
    // Low frequency beeps every 2 seconds
    if (millis() % 2000 < 150) {
      tone(BUZZER_PIN, 800, 150);  // Low frequency beep
    }
  }
  // Balance = 0: URGENT rapid beeping pattern (4 quick beeps, short pause, repeat)
  else {
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, HIGH);
    
    // Create urgent beep pattern: 4 rapid beeps (80ms each, 60ms gap), then 300ms pause
    // Total cycle = 4*(80+60) + 300 = 860ms
    unsigned long cyclePos = millis() % 860;
    
    if (cyclePos < 80) {
      tone(BUZZER_PIN, 2500, 80);       // Beep 1
    } else if (cyclePos >= 140 && cyclePos < 220) {
      tone(BUZZER_PIN, 2500, 80);       // Beep 2
    } else if (cyclePos >= 280 && cyclePos < 360) {
      tone(BUZZER_PIN, 2500, 80);       // Beep 3
    } else if (cyclePos >= 420 && cyclePos < 500) {
      tone(BUZZER_PIN, 2500, 80);       // Beep 4
    }
    // 500-860ms = silence (360ms pause before next cycle)
  }
}

// ---------- GSM Functions ----------
void sendSMS(const String &to, const String &msg) {
  if (to.length() < 6) {
    Serial.println("[SMS] Invalid phone number");
    return;
  }
  
  Serial.println("[SMS] Sending to: " + to);
  SIM800.println("AT");
  delay(300);
  SIM800.println("AT+CMGF=1");
  delay(300);
  SIM800.print("AT+CMGS=\"");
  SIM800.print(to);
  SIM800.println("\"");
  delay(300);
  SIM800.print(msg);
  SIM800.write(26);
  delay(4000);
  Serial.println("[SMS] Sent");
}

// ---------- HTTP Fallback ----------
bool fetchBalanceHTTP() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[ERROR] WiFi not connected");
    return false;
  }
  
  HTTPClient http;
  String url = String(BACKEND_HOST) + "/users/" + METER_NO + "/balance";
  http.begin(url);
  http.setTimeout(10000);
  
  Serial.println("[HTTP] Fetching balance from: " + url);
  int code = http.GET();
  
  if (code != 200) {
    Serial.printf("[ERROR] HTTP GET failed: %d\n", code);
    http.end();
    return false;
  }
  
  String payload = http.getString();
  http.end();
  
  // Parse JSON response
  StaticJsonDocument<300> doc;
  DeserializationError error = deserializeJson(doc, payload);
  
  if (error) {
    Serial.println("[ERROR] JSON parse error");
    return false;
  }
  
  if (doc.containsKey("availableUnits")) {
    float newBalance = doc["availableUnits"];
    updateBalance(newBalance);
    Serial.printf("[HTTP] Balance fetched: %.2f units\n", newBalance);
    return true;
  }
  
  return false;
}

// ---------- Fetch User Info from Backend ----------
bool fetchUserInfo() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[ERROR] WiFi not connected");
    return false;
  }
  
  HTTPClient http;
  String url = String(BACKEND_HOST) + "/users/by-meter/" + METER_NO;
  http.begin(url);
  http.setTimeout(10000);
  
  Serial.println("[HTTP] Fetching user info from: " + url);
  int code = http.GET();
  
  if (code != 200) {
    Serial.printf("[ERROR] HTTP GET failed: %d\n", code);
    Serial.println("[ERROR] Response: " + http.getString());
    http.end();
    return false;
  }
  
  String payload = http.getString();
  http.end();
  
  Serial.println("[HTTP] User info response: " + payload);
  
  // Parse JSON response
  StaticJsonDocument<500> doc;
  DeserializationError error = deserializeJson(doc, payload);
  
  if (error) {
    Serial.println("[ERROR] JSON parse error: " + String(error.c_str()));
    return false;
  }
  
  // Extract user information
  if (doc.containsKey("name")) {
    userName = doc["name"].as<String>();
  }
  
  if (doc.containsKey("phone_number")) {
    phoneNumber = doc["phone_number"].as<String>();
  }
  
  if (doc.containsKey("email")) {
    userEmail = doc["email"].as<String>();
  }
  
  Serial.printf("[USER INFO] Name: %s\n", userName.c_str());
  Serial.printf("[USER INFO] Phone: %s\n", phoneNumber.c_str());
  Serial.printf("[USER INFO] Email: %s\n", userEmail.c_str());
  
  return true;
}

// ---------- Send Low Balance Alert ----------
void sendLowBalanceAlert() {
  if (phoneNumber.length() < 6) {
    Serial.println("[SMS] No phone number available for alert");
    return;
  }
  
  String msg = "⚠️ LOW BALANCE ALERT!\n";
  msg += "Meter: " + String(METER_NO) + "\n";
  msg += "User: " + userName + "\n";
  msg += "Balance: " + String(balance, 2) + " units\n";
  msg += "You have less than 3 units remaining. Please recharge IMMEDIATELY to avoid disconnection.";
  
  Serial.println("=== LOW BALANCE ALERT ===");
  Serial.println("Sending SMS to: " + phoneNumber);
  Serial.println("Balance: " + String(balance, 2) + " units");
  
  sendSMS(phoneNumber, msg);
  
  Serial.println("[SMS] Low balance alert sent successfully");
}

// ---------- Send Disconnection Alert ----------
void sendDisconnectionAlert() {
  if (phoneNumber.length() < 6) {
    Serial.println("[SMS] No phone number available for alert");
    return;
  }
  
  String msg = "🚨 POWER DISCONNECTED!\n";
  msg += "Meter: " + String(METER_NO) + "\n";
  msg += "User: " + userName + "\n";
  msg += "Balance: 0.00 units\n";
  msg += "Your power has been disconnected due to insufficient balance. Please recharge immediately to restore power.";
  
  Serial.println("=== DISCONNECTION ALERT ===");
  Serial.println("Sending SMS to: " + phoneNumber);
  Serial.println("Power DISCONNECTED - Balance exhausted");
  
  sendSMS(phoneNumber, msg);
  
  Serial.println("[SMS] Disconnection alert sent successfully");
}

// ---------- GSM Initialization (using TinyGSM) ----------
bool initGSM() {
  Serial.println("[GSM] Initializing SIM800L with TinyGSM...");
  
  // Clear any pending data
  while (SIM800.available()) SIM800.read();
  
  // Send basic AT to sync
  Serial.println("[GSM] Syncing modem...");
  modem.sendAT("");
  delay(500);
  
  // Try init first (faster than restart)
  Serial.println("[GSM] Initializing modem...");
  if (!modem.init()) {
    Serial.println("[GSM] Init failed, trying restart...");
    if (!modem.restart()) {
      Serial.println("[GSM] Modem restart also failed");
      // Try one more time with basic AT test
      modem.sendAT("");
      if (modem.waitResponse(3000) != 1) {
        Serial.println("[GSM] Modem not responding");
        return false;
      }
    }
  }
  
  // Get modem info
  String modemInfo = modem.getModemInfo();
  if (modemInfo.length() > 0) {
    Serial.println("[GSM] Modem: " + modemInfo);
  }
  
  // Check SIM card
  SimStatus simStatus = modem.getSimStatus();
  if (simStatus != SIM_READY) {
    Serial.println("[GSM] SIM card not ready, waiting...");
    delay(3000);
    simStatus = modem.getSimStatus();
    if (simStatus != SIM_READY) {
      Serial.println("[GSM] SIM card still not ready");
      return false;
    }
  }
  Serial.println("[GSM] SIM card ready");
  
  // Check signal quality FIRST
  int signalQuality = modem.getSignalQuality();
  Serial.printf("[GSM] Signal quality: %d (10-31 is good)\n", signalQuality);
  
  if (signalQuality == 0 || signalQuality == 99) {
    Serial.println("[GSM] Warning: No signal detected - check antenna!");
  }
  
  // Try manual network registration for Airtel
  Serial.println("[GSM] Attempting manual network setup...");
  
  // Set full functionality mode
  SIM800.println("AT+CFUN=1");
  delay(1000);
  clearGSMBuffer();
  
  // Set network mode to GSM only (2G) - helps with Airtel
  SIM800.println("AT+CNMP=13");  // 13 = GSM only
  delay(500);
  clearGSMBuffer();
  
  // Check current operator
  SIM800.println("AT+COPS?");
  delay(500);
  String copsResp = getGSMResponse(2000);
  Serial.println("[GSM] Operator check: " + copsResp);
  
  // Try automatic operator selection
  Serial.println("[GSM] Setting automatic operator selection...");
  SIM800.println("AT+COPS=0");
  delay(2000);
  clearGSMBuffer();
  
  // Wait for network registration with LONGER timeout (2 minutes for 2G)
  Serial.println("[GSM] Waiting for network registration (up to 120s)...");
  
  int regAttempts = 0;
  bool registered = false;
  
  while (regAttempts < 24 && !registered) {  // 24 x 5s = 120 seconds max
    SIM800.println("AT+CREG?");
    delay(500);
    String regResp = getGSMResponse(2000);
    
    // +CREG: 0,1 = registered home, +CREG: 0,5 = registered roaming
    if (regResp.indexOf(",1") != -1 || regResp.indexOf(",5") != -1) {
      registered = true;
      Serial.println("[GSM] Network registered!");
    } else if (regResp.indexOf(",2") != -1) {
      Serial.printf("[GSM] Searching... attempt %d/24\n", regAttempts + 1);
    } else if (regResp.indexOf(",3") != -1) {
      Serial.println("[GSM] Registration denied!");
      break;
    } else {
      Serial.printf("[GSM] Not registered, attempt %d/24 - Response: %s\n", regAttempts + 1, regResp.c_str());
    }
    
    if (!registered) {
      regAttempts++;
      delay(5000);  // Wait 5 seconds between attempts
    }
  }
  
  if (!registered) {
    Serial.println("[GSM] Network registration failed after 120 seconds");
    Serial.println("[GSM] Possible causes:");
    Serial.println("  1. Airtel 2G not available in your area");
    Serial.println("  2. Weak antenna connection");
    Serial.println("  3. SIM not activated for data");
    
    // Still mark as partially initialized for SMS attempts later
    gsmInitialized = true;  // Allow SMS attempts even without full registration
    Serial.println("[GSM] Will retry registration in background");
    return false;
  }
  
  // Get operator name
  SIM800.println("AT+COPS?");
  delay(500);
  String opResp = getGSMResponse(2000);
  Serial.println("[GSM] Connected to: " + opResp);
  
  // Final signal check
  signalQuality = modem.getSignalQuality();
  Serial.printf("[GSM] Final signal quality: %d\n", signalQuality);
  
  gsmInitialized = true;
  Serial.println("[GSM] Initialized successfully!");
  return true;
}

// ---------- Sync modem before GPRS (after SMS operations) ----------
void syncModemForGPRS() {
  Serial.println("[GSM] Syncing modem for GPRS...");
  while (SIM800.available()) SIM800.read();
  modem.sendAT("");
  modem.waitResponse(1000);
  delay(500);
}

// ---------- GPRS Connection (using direct AT commands - more reliable) ----------
bool connectGPRS() {
  Serial.println("[GPRS] Connecting using AT commands...");
  
  // Clear buffer
  clearGSMBuffer();
  
  // Reset and sync modem first
  SIM800.println("AT");
  delay(500);
  clearGSMBuffer();
  
  SIM800.println("AT");
  delay(300);
  String response = getGSMResponse(1000);
  Serial.println("[GPRS] AT response: " + response);
  
  if (response.indexOf("OK") == -1 && response.indexOf("AT") == -1) {
    Serial.println("[GPRS] Modem not responding, resetting...");
    SIM800.println("AT+CFUN=1,1");  // Reset modem
    delay(5000);
    clearGSMBuffer();
  }
  
  // Check signal
  SIM800.println("AT+CSQ");
  delay(500);
  response = getGSMResponse(2000);
  Serial.println("[GPRS] Signal: " + response);
  
  // Check network registration with retry
  int regAttempts = 0;
  bool registered = false;
  while (regAttempts < 3 && !registered) {
    SIM800.println("AT+CREG?");
    delay(500);
    response = getGSMResponse(2000);
    Serial.println("[GPRS] Network reg: " + response);
    
    if (response.indexOf(",1") != -1 || response.indexOf(",5") != -1) {
      registered = true;
    } else {
      regAttempts++;
      Serial.println("[GPRS] Not registered, waiting 3s...");
      delay(3000);
    }
  }
  
  if (!registered) {
    Serial.println("[GPRS] Network registration failed after retries");
    return false;
  }
  
  // Check GPRS registration
  SIM800.println("AT+CGATT?");
  delay(500);
  response = getGSMResponse(2000);
  Serial.println("[GPRS] GPRS attach: " + response);
  
  // Attach to GPRS if not attached
  if (response.indexOf("+CGATT: 0") != -1) {
    Serial.println("[GPRS] Attaching to GPRS...");
    SIM800.println("AT+CGATT=1");
    delay(3000);
    response = getGSMResponse(5000);
    Serial.println("[GPRS] Attach result: " + response);
  }
  
  // Close any existing connections
  SIM800.println("AT+CIPSHUT");
  delay(1000);
  clearGSMBuffer();
  
  // Set connection type
  SIM800.println("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"");
  delay(500);
  response = getGSMResponse(2000);
  Serial.println("[GPRS] CONTYPE: " + response);
  
  // Set APN
  String apnCmd = "AT+SAPBR=3,1,\"APN\",\"" + String(APN) + "\"";
  Serial.println("[GPRS] Setting APN: " + String(APN));
  SIM800.println(apnCmd);
  delay(500);
  response = getGSMResponse(2000);
  Serial.println("[GPRS] APN result: " + response);
  
  // Open bearer
  Serial.println("[GPRS] Opening bearer...");
  SIM800.println("AT+SAPBR=1,1");
  delay(5000);  // Give more time
  response = getGSMResponse(5000);
  Serial.println("[GPRS] Bearer open result: " + response);
  
  // Query bearer status
  SIM800.println("AT+SAPBR=2,1");
  delay(1000);
  response = getGSMResponse(5000);
  Serial.println("[GPRS] Bearer status: " + response);
  
  if (response.indexOf("0.0.0.0") != -1) {
    Serial.println("[GPRS] No IP assigned");
    return false;
  }
  
  if (response.indexOf("+SAPBR: 1,1") != -1) {
    Serial.println("[GPRS] Connected successfully!");
    gprsConnected = true;
    return true;
  }
  
  Serial.println("[GPRS] Connection failed - response: " + response);
  return false;
}

// ---------- Disconnect GPRS ----------
void disconnectGPRS() {
  if (!gprsConnected) return;
  
  Serial.println("[GPRS] Disconnecting...");
  SIM800.println("AT+SAPBR=0,1");
  delay(1000);
  clearGSMBuffer();
  gprsConnected = false;
  Serial.println("[GPRS] Disconnected");
}

// ---------- Fetch Balance via GPRS HTTP ----------
bool fetchBalanceGPRS() {
  if (!gprsConnected) {
    if (!connectGPRS()) {
      Serial.println("[GPRS] Cannot connect for balance fetch");
      return false;
    }
  }
  
  Serial.println("[GPRS] Fetching balance via HTTP...");
  
  // Initialize HTTP
  SIM800.println("AT+HTTPINIT");
  delay(500);
  if (!waitForResponse("OK", 3000)) {
    Serial.println("[GPRS] HTTP init failed");
    SIM800.println("AT+HTTPTERM");
    delay(500);
    return false;
  }
  
  // Set HTTP parameters
  SIM800.println("AT+HTTPPARA=\"CID\",1");
  delay(300);
  
  // Set URL - use backend host for balance
  String url = String(BACKEND_HOST) + "/users/" + METER_NO + "/balance";
  String urlCmd = "AT+HTTPPARA=\"URL\",\"" + url + "\"";
  SIM800.println(urlCmd);
  delay(500);
  if (!waitForResponse("OK", 3000)) {
    Serial.println("[GPRS] Failed to set URL");
    SIM800.println("AT+HTTPTERM");
    delay(500);
    return false;
  }
  
  // Perform HTTP GET
  SIM800.println("AT+HTTPACTION=0");
  delay(5000);
  String response = getGSMResponse(15000);
  
  if (response.indexOf("+HTTPACTION:0,200") == -1) {
    Serial.println("[GPRS] HTTP GET failed: " + response);
    SIM800.println("AT+HTTPTERM");
    delay(500);
    return false;
  }
  
  // Read response data
  SIM800.println("AT+HTTPREAD");
  delay(1000);
  String data = getGSMResponse(5000);
  
  // Terminate HTTP
  SIM800.println("AT+HTTPTERM");
  delay(500);
  clearGSMBuffer();
  
  // Parse JSON response - look for availableUnits
  int startIdx = data.indexOf("availableUnits");
  if (startIdx != -1) {
    int colonIdx = data.indexOf(":", startIdx);
    int endIdx = data.indexOf(",", colonIdx);
    if (endIdx == -1) endIdx = data.indexOf("}", colonIdx);
    
    if (colonIdx != -1 && endIdx != -1) {
      String balanceStr = data.substring(colonIdx + 1, endIdx);
      balanceStr.trim();
      float newBalance = balanceStr.toFloat();
      
      Serial.printf("[GPRS] Balance fetched: %.2f units\n", newBalance);
      updateBalance(newBalance);
      return true;
    }
  }
  
  Serial.println("[GPRS] Failed to parse balance response");
  return false;
}

// ---------- GSM Helper Functions ----------
bool waitForResponse(const char* expected, unsigned long timeout) {
  unsigned long start = millis();
  String response = "";
  
  while (millis() - start < timeout) {
    while (SIM800.available()) {
      char c = SIM800.read();
      response += c;
    }
    if (response.indexOf(expected) != -1) {
      return true;
    }
    if (response.indexOf("ERROR") != -1) {
      Serial.println("[GSM] Error: " + response);
      return false;
    }
    delay(10);
  }
  return false;
}

String getGSMResponse(unsigned long timeout) {
  unsigned long start = millis();
  String response = "";
  
  while (millis() - start < timeout) {
    while (SIM800.available()) {
      char c = SIM800.read();
      response += c;
    }
    delay(10);
  }
  response.trim();
  return response;
}

void clearGSMBuffer() {
  while (SIM800.available()) {
    SIM800.read();
  }
}

// ---------- Send Recharge Confirmation SMS ----------
void sendRechargeAlert(float recharged, float newBalance) {
  if (phoneNumber.length() < 6) {
    Serial.println("[SMS] No phone number available for recharge alert");
    return;
  }
  
  String msg = "✅ RECHARGE SUCCESSFUL!\n";
  msg += "Meter: " + String(METER_NO) + "\n";
  msg += "User: " + userName + "\n";
  msg += "Amount: +" + String(recharged, 2) + " units\n";
  msg += "New Balance: " + String(newBalance, 2) + " units\n";
  msg += "Thank you for your payment!";
  
  Serial.println("=== RECHARGE CONFIRMATION ===");
  Serial.println("Sending SMS to: " + phoneNumber);
  Serial.printf("Recharged: +%.2f units | New Balance: %.2f units\n", recharged, newBalance);
  
  sendSMS(phoneNumber, msg);
  
  Serial.println("[SMS] Recharge confirmation sent successfully");
}

// ==================== END OF CODE ====================
