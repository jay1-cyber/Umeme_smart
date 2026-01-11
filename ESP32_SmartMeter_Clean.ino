/*
  ESP32 Smart Meter - MQTT Integration v3.2 (Clean)
  Features: MQTT communication, OLED display, SMS alerts (SIM800L), time-based consumption
*/

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

// ===== CONFIGURATION =====
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

const char* WIFI_SSID = "main.gy";
const char* WIFI_PASS = "maingithe1";
const char* MQTT_SERVER = "broker.hivemq.com";
const int MQTT_PORT = 1883;
const char* BACKEND_HOST = "http://192.168.1.101:3000";
const char* METER_NO = "55555";
const char* APN = "internet";
const char* NTP_SERVER = "pool.ntp.org";
const long GMT_OFFSET_SEC = 10800;

// Pins
const int LED_BLUE = 16, LED_GREEN = 17, LED_RED = 5, BUZZER_PIN = 4, PWR_LED = 2;
#define SIM_RX_PIN 26
#define SIM_TX_PIN 27

// Timing (ms)
const unsigned long CONSUMPTION_INTERVAL = 1000;
const unsigned long MQTT_PUBLISH_INTERVAL = 2000;
const unsigned long STATUS_PUBLISH_INTERVAL = 30000;
const unsigned long RECHARGE_DISPLAY_TIME = 4000;
const unsigned long RECHARGE_COOLDOWN_MS = 15000;

// Consumption
const float UNITS_PER_SECOND = 0.02;
const float ALERT_THRESHOLD = 3.0;

// ===== OBJECTS =====
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
HardwareSerial SIM800(2);
TinyGsm modem(SIM800);
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// ===== STATE =====
float balance = 0.0, totalConsumed = 0.0, sessionUnits = 0.0, lastRechargeAmount = 0.0;
bool loadOn = true, wifiConnected = false, mqttConnected = false, gsmInitialized = false;
bool lowAlertSent = false, showingRecharge = false;
String phoneNumber = "+254743324047", userName = "User";
unsigned long lastConsumption = 0, lastMQTTPublish = 0, lastStatusPublish = 0;
unsigned long rechargeDisplayStart = 0, lastRechargeTime = 0;
float lastRechargeBalance = -1.0;

// MQTT Topics
String topicBalanceCmd, topicConsumption, topicStatus, topicBalanceReport;

// ===== FUNCTION DECLARATIONS =====
void setupWiFi();
void setupMQTT();
void reconnectMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void publishConsumption();
void publishStatus(String status, String msg);
void updateBalance(float newBalance);
void decrementUnits();
void updateDisplay();
void updateIndicators();
void sendSMS(const String &to, const String &msg);
bool fetchBalanceHTTP();
bool fetchUserInfo();
bool initGSM();
void clearGSMBuffer();
String getGSMResponse(unsigned long timeout);

// ===== SETUP =====
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== ESP32 Smart Meter v3.2 ===\n");
  
  pinMode(LED_BLUE, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(PWR_LED, OUTPUT);
  digitalWrite(PWR_LED, HIGH);
  
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("[ERROR] OLED failed!");
    while(1);
  }
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Smart Meter v3.2");
  display.println("Initializing...");
  display.display();
  delay(1000);
  
  // GSM Init
  SIM800.begin(9600, SERIAL_8N1, SIM_RX_PIN, SIM_TX_PIN);
  delay(3000);
  initGSM();
  
  // MQTT Topics
  topicBalanceCmd = "smartmeter/" + String(METER_NO) + "/command/balance";
  topicConsumption = "smartmeter/" + String(METER_NO) + "/consumption";
  topicStatus = "smartmeter/" + String(METER_NO) + "/status";
  topicBalanceReport = "smartmeter/" + String(METER_NO) + "/balance";
  
  setupWiFi();
  
  if (wifiConnected) {
    configTime(GMT_OFFSET_SEC, 0, NTP_SERVER);
    fetchUserInfo();
    fetchBalanceHTTP();
  }
  
  setupMQTT();
  updateIndicators();
  updateDisplay();
  
  lastConsumption = millis();
  lastMQTTPublish = millis();
  lastStatusPublish = millis();
  
  Serial.printf("[READY] Meter: %s | Balance: %.2f\n", METER_NO, balance);
}

// ===== MAIN LOOP =====
void loop() {
  unsigned long now = millis();
  
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    setupWiFi();
  } else {
    wifiConnected = true;
  }
  
  if (!mqttClient.connected()) {
    mqttConnected = false;
    reconnectMQTT();
  } else {
    mqttConnected = true;
    mqttClient.loop();
  }
  
  decrementUnits();
  
  if (now - lastMQTTPublish >= MQTT_PUBLISH_INTERVAL && sessionUnits > 0.001) {
    lastMQTTPublish = now;
    publishConsumption();
  }
  
  if (showingRecharge && (now - rechargeDisplayStart >= RECHARGE_DISPLAY_TIME)) {
    showingRecharge = false;
    updateIndicators();
  }
  
  if (now - lastStatusPublish >= STATUS_PUBLISH_INTERVAL) {
    lastStatusPublish = now;
    publishStatus(balance > 0 ? "online" : "disconnected", balance > 0 ? "OK" : "No balance");
  }
  
  updateDisplay();
  updateIndicators();
  
  if (balance <= 0 && loadOn) {
    loadOn = false;
    sendSMS(phoneNumber, "POWER DISCONNECTED! Balance: 0. Please recharge.");
    publishStatus("disconnected", "Balance exhausted");
  }
  
  delay(50);
}

// ===== WIFI =====
void setupWiFi() {
  Serial.print("[WiFi] Connecting...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  wifiConnected = (WiFi.status() == WL_CONNECTED);
  Serial.println(wifiConnected ? " Connected!" : " Failed!");
  if (wifiConnected) Serial.println("[WiFi] IP: " + WiFi.localIP().toString());
}

// ===== MQTT =====
void setupMQTT() {
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setKeepAlive(60);
  reconnectMQTT();
}

void reconnectMQTT() {
  if (!wifiConnected) return;
  
  int attempts = 0;
  while (!mqttClient.connected() && attempts < 3) {
    String clientId = "ESP32_" + String(METER_NO) + "_" + String(random(0xffff), HEX);
    if (mqttClient.connect(clientId.c_str())) {
      mqttConnected = true;
      mqttClient.subscribe(topicBalanceCmd.c_str());
      Serial.println("[MQTT] Connected & subscribed");
    } else {
      attempts++;
      delay(2000);
    }
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) message += (char)payload[i];
  
  StaticJsonDocument<200> doc;
  if (deserializeJson(doc, message)) return;
  
  if (String(topic) == topicBalanceCmd && doc.containsKey("balance")) {
    updateBalance(doc["balance"]);
  }
}

void publishConsumption() {
  if (!mqttConnected) return;
  
  StaticJsonDocument<256> doc;
  doc["meterNo"] = METER_NO;
  doc["unitsConsumed"] = sessionUnits;
  doc["remainingBalance"] = balance;
  doc["totalConsumed"] = totalConsumed;
  doc["timestamp"] = millis();
  
  String output;
  serializeJson(doc, output);
  
  if (mqttClient.publish(topicConsumption.c_str(), output.c_str(), true)) {
    sessionUnits = 0;
  }
}

void publishStatus(String status, String msg) {
  if (!mqttConnected) return;
  
  StaticJsonDocument<256> doc;
  doc["meterNo"] = METER_NO;
  doc["status"] = status;
  doc["balance"] = balance;
  doc["loadOn"] = loadOn;
  doc["timestamp"] = millis();
  
  String output;
  serializeJson(doc, output);
  mqttClient.publish(topicStatus.c_str(), output.c_str());
}

// ===== BALANCE =====
void updateBalance(float newBalance) {
  unsigned long now = millis();
  bool inCooldown = (now - lastRechargeTime) < RECHARGE_COOLDOWN_MS;
  
  if ((showingRecharge || inCooldown) && newBalance < balance) return;
  
  float diff = newBalance - balance;
  bool isRecharge = (diff >= 0.5) && (newBalance != lastRechargeBalance);
  
  if (isRecharge) {
    Serial.printf("[RECHARGE] +%.1f units | New: %.1f\n", diff, newBalance);
    lastRechargeTime = now;
    lastRechargeBalance = newBalance;
    lastRechargeAmount = diff;
    loadOn = true;
    lowAlertSent = false;
    showingRecharge = true;
    rechargeDisplayStart = now;
    
    sendSMS(phoneNumber, "Recharge: +" + String(diff, 1) + " units. Balance: " + String(newBalance, 1));
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_BLUE, HIGH);
  }
  
  balance = newBalance;
  loadOn = (balance > 0);
  
  StaticJsonDocument<128> doc;
  doc["meterNo"] = METER_NO;
  doc["balance"] = balance;
  String output;
  serializeJson(doc, output);
  mqttClient.publish(topicBalanceReport.c_str(), output.c_str());
}

// ===== CONSUMPTION =====
void decrementUnits() {
  unsigned long now = millis();
  
  if (now - lastConsumption >= CONSUMPTION_INTERVAL && loadOn && balance > 0) {
    balance -= UNITS_PER_SECOND;
    totalConsumed += UNITS_PER_SECOND;
    sessionUnits += UNITS_PER_SECOND;
    if (balance < 0) balance = 0;
    lastConsumption = now;
    
    if (balance < ALERT_THRESHOLD && balance > 0 && !lowAlertSent) {
      sendSMS(phoneNumber, "LOW BALANCE! " + String(balance, 1) + " units left. Recharge now!");
      lowAlertSent = true;
    }
    if (balance >= ALERT_THRESHOLD) lowAlertSent = false;
  }
}

// ===== DISPLAY =====
void updateDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  
  if (showingRecharge) {
    display.setTextSize(2);
    display.setCursor(5, 0);
    display.println("SUCCESS!");
    display.drawLine(0, 18, 128, 18, SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(0, 24);
    display.println("Payment Received:");
    display.setTextSize(2);
    display.setCursor(10, 36);
    display.printf("+%.1f", lastRechargeAmount);
    display.setTextSize(1);
    display.setCursor(0, 54);
    display.printf("Balance: %.1f units", balance);
    display.display();
    return;
  }
  
  struct tm timeinfo;
  if (getLocalTime(&timeinfo)) {
    char timeStr[12];
    strftime(timeStr, sizeof(timeStr), "%H:%M:%S", &timeinfo);
    display.setCursor(0, 0);
    display.print(timeStr);
    char dateStr[12];
    strftime(dateStr, sizeof(dateStr), "%d/%m/%y", &timeinfo);
    display.setCursor(70, 0);
    display.print(dateStr);
  }
  
  display.setCursor(0, 12);
  display.printf("Meter: %s", METER_NO);
  display.setCursor(0, 24);
  display.printf("Balance: %.1f units", balance);
  display.setCursor(0, 36);
  display.printf("Consumed: %.1f kWh", totalConsumed);
  display.setCursor(0, 48);
  display.print("Status: ");
  if (!wifiConnected || !mqttConnected) display.print("OFFLINE");
  else if (balance <= 0) display.print("NO POWER");
  else if (balance < ALERT_THRESHOLD) display.print("LOW BAL");
  else display.print("ONLINE");
  
  display.display();
}

// ===== INDICATORS =====
void updateIndicators() {
  if (balance > ALERT_THRESHOLD) {
    digitalWrite(LED_BLUE, HIGH);
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_RED, LOW);
    noTone(BUZZER_PIN);
  } else if (balance > 0) {
    digitalWrite(LED_BLUE, HIGH);
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, HIGH);
    if (millis() % 2000 < 150) tone(BUZZER_PIN, 800, 150);
  } else {
    digitalWrite(LED_BLUE, LOW);
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, HIGH);
    unsigned long pos = millis() % 860;
    if (pos < 80) tone(BUZZER_PIN, 2500, 80);
    else if (pos >= 140 && pos < 220) tone(BUZZER_PIN, 2500, 80);
    else if (pos >= 280 && pos < 360) tone(BUZZER_PIN, 2500, 80);
    else if (pos >= 420 && pos < 500) tone(BUZZER_PIN, 2500, 80);
  }
}

// ===== GSM =====
bool initGSM() {
  Serial.println("[GSM] Initializing...");
  while (SIM800.available()) SIM800.read();
  
  modem.sendAT("");
  delay(500);
  
  if (!modem.init()) {
    if (!modem.restart()) {
      Serial.println("[GSM] Modem not responding");
      return false;
    }
  }
  
  Serial.println("[GSM] Modem: " + modem.getModemInfo());
  
  if (modem.getSimStatus() != SIM_READY) {
    delay(3000);
    if (modem.getSimStatus() != SIM_READY) {
      Serial.println("[GSM] SIM not ready");
      return false;
    }
  }
  Serial.println("[GSM] SIM ready");
  
  int sig = modem.getSignalQuality();
  Serial.printf("[GSM] Signal: %d (10-31 good)\n", sig);
  
  SIM800.println("AT+CFUN=1");
  delay(1000);
  clearGSMBuffer();
  
  Serial.println("[GSM] Waiting for network (120s max)...");
  int attempts = 0;
  bool registered = false;
  
  while (attempts < 24 && !registered) {
    SIM800.println("AT+CREG?");
    delay(500);
    String resp = getGSMResponse(2000);
    
    if (resp.indexOf(",1") != -1 || resp.indexOf(",5") != -1) {
      registered = true;
      Serial.println("[GSM] Registered!");
    } else {
      Serial.printf("[GSM] Attempt %d/24...\n", ++attempts);
      delay(5000);
    }
  }
  
  if (!registered) {
    Serial.println("[GSM] Registration failed - 2G may not be available");
    gsmInitialized = true;
    return false;
  }
  
  gsmInitialized = true;
  Serial.println("[GSM] Ready!");
  return true;
}

void sendSMS(const String &to, const String &msg) {
  if (to.length() < 6 || !gsmInitialized) return;
  
  Serial.println("[SMS] Sending to: " + to);
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

bool fetchBalanceHTTP() {
  if (!wifiConnected) return false;
  
  HTTPClient http;
  http.begin(String(BACKEND_HOST) + "/users/" + METER_NO + "/balance");
  http.setTimeout(10000);
  
  int code = http.GET();
  if (code != 200) {
    http.end();
    return false;
  }
  
  StaticJsonDocument<256> doc;
  if (!deserializeJson(doc, http.getString()) && doc.containsKey("availableUnits")) {
    updateBalance(doc["availableUnits"]);
  }
  http.end();
  return true;
}

bool fetchUserInfo() {
  if (!wifiConnected) return false;
  
  HTTPClient http;
  http.begin(String(BACKEND_HOST) + "/users/by-meter/" + METER_NO);
  http.setTimeout(10000);
  
  int code = http.GET();
  if (code != 200) {
    http.end();
    return false;
  }
  
  StaticJsonDocument<256> doc;
  if (!deserializeJson(doc, http.getString())) {
    if (doc.containsKey("name")) userName = doc["name"].as<String>();
    if (doc.containsKey("phone_number")) phoneNumber = doc["phone_number"].as<String>();
  }
  http.end();
  return true;
}

void clearGSMBuffer() {
  while (SIM800.available()) SIM800.read();
}

String getGSMResponse(unsigned long timeout) {
  unsigned long start = millis();
  String resp = "";
  while (millis() - start < timeout) {
    while (SIM800.available()) resp += (char)SIM800.read();
    delay(10);
  }
  resp.trim();
  return resp;
}
