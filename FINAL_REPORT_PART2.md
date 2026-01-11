# LIST OF FIGURES

Figure 2.1: Advanced Metering Infrastructure Architecture  
Figure 2.2: Evolution of Prepaid Metering Systems  
Figure 2.3: M-Pesa Transaction Flow in Kenya  
Figure 2.4: Smart Meter Penetration in Sub-Saharan Africa  
Figure 3.1: System Architecture Block Diagram  
Figure 3.2: ESP32-Based Smart Meter Prototype Hardware Design  
Figure 3.3: ESP32 Firmware Architecture  
Figure 3.4: Cloud Backend Architecture  
Figure 3.5: M-Pesa Daraja API Integration Flow  
Figure 3.6: Firebase Database Structure  
Figure 3.7: Frontend Dashboard Interface  
Figure 3.8: MQTT Communication Protocol Flow  
Figure 3.9: System Integration Flowchart  
Figure 3.10: Testing Framework Architecture  
Figure 4.1: ESP32 Prototype Physical Implementation  
Figure 4.2: OLED Display showing Balance Information  
Figure 4.3: Multi-LED Status Indicator System  
Figure 4.4: M-Pesa Payment Confirmation Screenshot  
Figure 4.5: Frontend Dashboard - User View  
Figure 4.6: Real-time Balance Update Graph  
Figure 4.7: Transaction History Display  
Figure 4.8: System Response Time Analysis  
Figure 4.9: Network Latency Measurements  
Figure 4.10: Power Consumption Analysis  

---

# LIST OF TABLES

Table 2.1: Comparison of Metering Technologies  
Table 2.2: Smart Meter Adoption Rates in Africa  
Table 2.3: Mobile Money Penetration in East Africa  
Table 3.1: Hardware Components and Specifications  
Table 3.2: ESP32 Pin Configuration  
Table 3.3: Firebase Database Schema  
Table 3.4: API Endpoints and Functions  
Table 3.5: MQTT Topic Structure  
Table 3.6: Test Cases and Expected Results  
Table 4.1: System Performance Metrics  
Table 4.2: Transaction Processing Time Results  
Table 4.3: System Reliability Statistics  
Table 4.4: Power Consumption Measurements  
Table 4.5: Cost Analysis and Comparison  

---

# ABSTRACT

Kenya's prepaid electricity metering system faces challenges including manual 20-digit token entry errors, faulty Customer Interface Units (CIUs), and SMS delivery failures. This project develops an IoT-enabled automatic recharge system that eliminates these problems through M-Pesa integration and Advanced Metering Infrastructure (AMI) principles.

The system comprises an ESP32-based smart meter prototype with OLED display and LED-based load control simulation, a Node.js cloud backend integrated with Firebase and M-Pesa Daraja API, and a React-based dashboard for real-time monitoring. The ESP32 communicates with the cloud via MQTT protocol, enabling automatic balance updates when M-Pesa payments are received—without manual token entry.

Testing demonstrated successful end-to-end automation with 2.3-second average transaction processing time and 100% load control accuracy. The system achieved 99.7% uptime during validation. The prototype cost of KES 3,440 represents significant savings compared to commercial smart meters (KES 8,000-25,000), making it viable for mass deployment in cost-sensitive markets.

**Keywords:** IoT, Smart Metering, AMI, M-Pesa, Prepaid Meters, ESP32, Automatic Recharge

---

# CHAPTER ONE: INTRODUCTION

## 1.1 Background

Kenya's electricity access has expanded from 27% in 2008 to over 75% in 2023 [1]. Kenya Power and Lighting Company (KPLC) has installed over 6 million prepaid meters, representing approximately 70% of all electricity customers [2][3]. While prepaid metering improves cash flow for utilities and encourages energy conservation, the current system has significant operational challenges.

The predominant recharge mechanism requires consumers to purchase tokens via M-Pesa, then manually enter a 20-digit token code into a Customer Interface Unit (CIU). This process introduces multiple failure points: human error during token entry, reliance on functional CIUs (often faulty or missing), and SMS delivery delays [4].

M-Pesa, with over 32 million active users conducting transactions worth KES 500 billion monthly [5], presents an opportunity for innovation. However, current M-Pesa integration with prepaid meters remains superficial—payments trigger SMS tokens rather than enabling automated recharges.

Advanced Metering Infrastructure (AMI) enables two-way communication between utilities and consumers, facilitating real-time monitoring and remote control [6]. While developed nations have extensively deployed AMI, adoption in developing countries remains limited due to cost constraints. The Internet of Things (IoT) offers a pathway to bridge this gap through affordable microcontrollers like the ESP32, which combines processing power and Wi-Fi connectivity at under USD 10 [7].

This project addresses these challenges by developing an automated recharge system that eliminates manual token entry through seamless M-Pesa integration. The system aligns with Kenya's Energy Act 2019 mandates for smart metering adoption and the Vision 2030 digital transformation agenda [8][9].

## 1.2 Problem Statement

Despite the advantages of prepaid electricity metering in Kenya, the current system suffers from critical inefficiencies:

**1. Manual Token Entry and Human Error:** The requirement for manual entry of 20-digit token codes is error-prone and time-consuming. KPLC data indicates approximately 15-20% of initial token entries fail due to user error [10], generating significant customer support inquiries.

**2. Faulty Customer Interface Units (CIUs):** Up to 30% of installed prepaid meters have non-functional CIUs due to damage, theft, or power surges [11]. When power is disconnected and the CIU is faulty, consumers must visit neighbors' homes to borrow their CIU—an inconvenient experience, especially at night or during emergencies.

**3. SMS Reliability Issues:** Approximately 8% of M-Pesa electricity tokens experience delivery delays exceeding 30 minutes, and 2% fail entirely [12]. These failures cause unexpected power disconnections.

**4. Lack of Real-time Monitoring:** Consumers discover credit depletion only when power disconnects, with no advance warnings. Utilities lack real-time data for load forecasting and loss detection.

**5. Underutilized AMI Potential:** Most existing meters function with limited remote communication rather than as comprehensive smart grid endpoints [13].

**6. Operational Inefficiencies:** KPLC customer care centers receive an estimated 50,000+ monthly inquiries related to token entry errors, CIU malfunctions, and SMS failures [14].

There is an urgent need for an integrated solution that automates the recharge process and eliminates manual interventions using cost-effective technology.

## 1.3 Justification

### Technological Justification

The ESP32 microcontroller (under KES 1,000) proves that advanced smart metering does not require expensive infrastructure. The system integrates MQTT protocol for efficient IoT communication, Firebase for scalable cloud storage, and M-Pesa Daraja API for payment automation—demonstrating that local payment ecosystems can enable service automation.

### Economic Justification

**For Utilities:** Automated recharging can reduce KPLC's operational costs by 25-35% in customer support, eliminating call center capacity for token troubleshooting and reducing field technician deployments [15].

**For Consumers:** Eliminates time wasted on failed token entries and economic losses from unexpected power outages. Real-time consumption visibility can reduce electricity bills by 10-15% through informed usage decisions.

**For National Economy:** The African smart grid market is projected to reach USD 9.4 billion by 2030 [16]. This project demonstrates Kenya's capacity for indigenous technological innovation.

### Social Justification

The system benefits vulnerable populations (elderly, disabled, technologically inexperienced) by removing manual token entry barriers. The dashboard empowers consumers with consumption data for better budgeting.

### Environmental Justification

Real-time consumption feedback reduces electricity usage by 5-15% [17], contributing to lower carbon emissions. The architecture supports future renewable energy integration.

### Policy Alignment

The project aligns with Kenya Vision 2030, Energy Act 2019, and UN SDG 7 (Affordable and Clean Energy) [18].

