/*
  GSM SMS Test Sketch for SIM800L
  --------------------------------
  Tests if SMS sending works properly
  
  Wiring:
  - SIM800L TX -> ESP32 GPIO26 (RX)
  - SIM800L RX -> ESP32 GPIO27 (TX)
  - SIM800L VCC -> 4V (use buck converter, NOT 3.3V or 5V directly)
  - SIM800L GND -> ESP32 GND
*/

#define SIM_RX_PIN 26
#define SIM_TX_PIN 27

HardwareSerial SIM800(2);

// *** CHANGE THIS TO YOUR PHONE NUMBER ***
const char* TEST_PHONE = "+254743324047";

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n================================");
  Serial.println("GSM SMS TEST SKETCH");
  Serial.println("================================\n");
  
  // Initialize SIM800L
  SIM800.begin(9600, SERIAL_8N1, SIM_RX_PIN, SIM_TX_PIN);
  Serial.println("Waiting for SIM800L to initialize...");
  delay(5000);
  
  // Test AT command
  Serial.println("\n--- Testing AT Command ---");
  sendATCommand("AT", 2000);
  
  // Check SIM card
  Serial.println("\n--- Checking SIM Card ---");
  sendATCommand("AT+CPIN?", 2000);
  
  // Check network registration
  Serial.println("\n--- Checking Network Registration ---");
  sendATCommand("AT+CREG?", 2000);
  
  // Check signal quality
  Serial.println("\n--- Signal Quality ---");
  sendATCommand("AT+CSQ", 2000);
  
  // Check SMS service center
  Serial.println("\n--- SMS Service Center ---");
  sendATCommand("AT+CSCA?", 2000);
  
  // Check SIM balance (Safaricom USSD)
  Serial.println("\n--- Checking Airtime Balance (Safaricom) ---");
  Serial.println("Sending USSD *144#...");
  sendATCommand("AT+CUSD=1,\"*144#\"", 5000);
  delay(5000);
  
  // Read any USSD response
  Serial.println("USSD Response:");
  while (SIM800.available()) {
    Serial.write(SIM800.read());
  }
  
  Serial.println("\n\n================================");
  Serial.println("Type 'SEND' in Serial Monitor to send test SMS");
  Serial.println("Type 'AT' commands to send them directly");
  Serial.println("================================\n");
}

void loop() {
  // Check for user input from Serial Monitor
  if (Serial.available()) {
    String input = Serial.readStringUntil('\n');
    input.trim();
    
    if (input.equalsIgnoreCase("SEND")) {
      sendTestSMS();
    } else if (input.length() > 0) {
      // Send any AT command directly
      Serial.println("Sending: " + input);
      sendATCommand(input.c_str(), 3000);
    }
  }
  
  // Print any responses from SIM800L
  while (SIM800.available()) {
    Serial.write(SIM800.read());
  }
}

void sendATCommand(const char* cmd, unsigned long timeout) {
  // Clear buffer
  while (SIM800.available()) {
    SIM800.read();
  }
  
  Serial.print(">> ");
  Serial.println(cmd);
  
  SIM800.println(cmd);
  
  unsigned long start = millis();
  while (millis() - start < timeout) {
    while (SIM800.available()) {
      char c = SIM800.read();
      Serial.write(c);
    }
    delay(10);
  }
  Serial.println();
}

void sendTestSMS() {
  Serial.println("\n================================");
  Serial.println("SENDING TEST SMS");
  Serial.println("================================");
  Serial.print("To: ");
  Serial.println(TEST_PHONE);
  
  // Clear buffer
  while (SIM800.available()) {
    SIM800.read();
  }
  
  // Set text mode
  Serial.println("\n1. Setting text mode...");
  SIM800.println("AT+CMGF=1");
  delay(1000);
  while (SIM800.available()) {
    Serial.write(SIM800.read());
  }
  
  // Set GSM character set
  Serial.println("\n2. Setting character set...");
  SIM800.println("AT+CSCS=\"GSM\"");
  delay(500);
  while (SIM800.available()) {
    Serial.write(SIM800.read());
  }
  
  // Send SMS command
  Serial.println("\n3. Starting SMS...");
  SIM800.print("AT+CMGS=\"");
  SIM800.print(TEST_PHONE);
  SIM800.println("\"");
  delay(1000);
  
  // Wait for > prompt
  Serial.print("Waiting for prompt: ");
  unsigned long start = millis();
  bool gotPrompt = false;
  while (millis() - start < 5000) {
    if (SIM800.available()) {
      char c = SIM800.read();
      Serial.write(c);
      if (c == '>') {
        gotPrompt = true;
        break;
      }
    }
  }
  
  if (!gotPrompt) {
    Serial.println("\nERROR: No '>' prompt received!");
    Serial.println("This usually means:");
    Serial.println("  - SIM card issue");
    Serial.println("  - Network not registered");
    Serial.println("  - Invalid phone number format");
    SIM800.write(27); // ESC to cancel
    return;
  }
  
  // Send message content
  Serial.println("\n4. Sending message content...");
  SIM800.print("TEST from ESP32 Smart Meter. If you receive this, SMS is working!");
  delay(100);
  
  // Send Ctrl+Z
  Serial.println("5. Sending Ctrl+Z...");
  SIM800.write(26);
  
  // Wait for response
  Serial.println("6. Waiting for network response (up to 30 seconds)...");
  start = millis();
  String response = "";
  while (millis() - start < 30000) {
    while (SIM800.available()) {
      char c = SIM800.read();
      Serial.write(c);
      response += c;
    }
    
    if (response.indexOf("+CMGS:") != -1) {
      Serial.println("\n\n*** SUCCESS! SMS SENT! ***");
      Serial.println("Message ID received from network.");
      return;
    }
    
    if (response.indexOf("ERROR") != -1) {
      Serial.println("\n\n*** ERROR! SMS FAILED! ***");
      Serial.println("Check:");
      Serial.println("  1. SIM card has airtime");
      Serial.println("  2. Phone number is correct");
      Serial.println("  3. Network signal is good");
      return;
    }
    
    delay(100);
  }
  
  Serial.println("\n\nTIMEOUT - No confirmation received");
  Serial.println("SMS may or may not have been sent.");
  Serial.println("Check your phone for the message.");
}
