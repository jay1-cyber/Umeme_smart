/*
  ESP32 Smart Meter - MQTT + Node.js Backend Integration v3.0
  -----------------------------------------------------------
  • MQTT-based two-way communication with backend
  • Real-time balance updates via MQTT (no polling)
  • Consumption reporting via MQTT
  • OLED display for status
  • SMS notifications via SIM800L
  • Time-based unit consumption
  • All original pins maintained
*/

#include <WiFi.h>
#include <HTTPClient.h>
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
const char* BACKEND_HOST = "http://192.168.1.104:3000";
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
const unsigned long DISPLAY_UPDATE_MS = 500;           // Update display every 500ms
const unsigned long MQTT_PUBLISH_INTERVAL = 2000;      // Publish consumption every 2s for ultra real-time
const unsigned long STATUS_PUBLISH_INTERVAL = 30000;   // Publish status every 30s
const unsigned long HTTP_FALLBACK_INTERVAL = 300000;   // HTTP fallback every 5 min if MQTT fails
const unsigned long RECHARGE_DISPLAY_TIME = 4000;      // Show recharge for 4 seconds

// Consumption parameters
const float UNITS_PER_SECOND = 0.5;                    // Units consumed per SECOND (faster!)
const float COST_PER_UNIT = 25.0;                      // Cost per unit
const float ALERT_THRESHOLD = 5.0;                     // Low balance alert threshold

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
String phoneNumber = "";  // Will be auto-fetched from backend
String userName = "";     // Will be auto-fetched from backend
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

// WiFi and MQTT clients
WiFiClient espClient;
PubSubClient mqttClient(espClient);

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
  Serial.println("[INIT] SIM800L ready");
  
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
  
  // HTTP fallback if MQTT fails
  if (!mqttConnected && now - lastHTTPFallback >= HTTP_FALLBACK_INTERVAL) {
    lastHTTPFallback = now;
    Serial.println("[HTTP] MQTT down, using HTTP fallback...");
    fetchBalanceHTTP();
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
  // Check for recharge (balance increased by ANY amount)
  float difference = newBalance - balance;
  
  // Detect recharge if balance increased (even by 0.001 units)
  if (difference > 0.001) {
    float recharged = difference;
    Serial.printf("[RECHARGE] ✅ Payment detected! +%.2f units | Old: %.2f → New: %.2f units\n", 
                  recharged, balance, newBalance);
    
    // Add to recharge history
    addRechargeToHistory(recharged);
    lastRechargeAmount = recharged;
    
    loadOn = true;  // Re-enable load
    lowAlertSent = false;  // Reset low balance flag
    
    // Send recharge confirmation SMS
    if (phoneNumber.length() > 5) {
      String msg = "Recharge successful! +" + String(recharged, 2) +
                   " units added. New balance: " + String(newBalance, 2) + " units. Thank you!";
      sendSMS(phoneNumber, msg);
      Serial.println("[SMS] Recharge confirmation sent");
    }
  }
  
  // Update balance first
  balance = newBalance;
  lastKnownBalance = newBalance;
  
  // Update load state
  loadOn = (balance > 0);
  
  // NOW show recharge notification (after balance is updated)
  if (difference > 0.001) {
    showingRecharge = true;
    rechargeDisplayStart = millis();
    Serial.println("[DISPLAY] 📺 Showing recharge notification for 4 seconds");
    
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
      
      Serial.printf("[CONSUMPTION] -%.4f units | Balance: %.2f units | Total: %.2f units\n",
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
    display.printf("Balance: %.2f units", balance);
    
    display.setCursor(0, 36);
    display.printf("Consumed: %.2f kWh", totalConsumed);
    
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
  if (balance <= 0) {
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_BLUE, LOW);
    tone(BUZZER_PIN, 2000, 200);
    loadOn = false;
  } else if (balance < ALERT_THRESHOLD) {
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_BLUE, loadOn ? HIGH : LOW);
    if (millis() % 2000 < 100) {
      tone(BUZZER_PIN, 1500, 100);
    }
  } else {
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_BLUE, loadOn ? HIGH : LOW);
    noTone(BUZZER_PIN);
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
  msg += "You have less than 5 units remaining. Please recharge soon to avoid disconnection.";
  
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
