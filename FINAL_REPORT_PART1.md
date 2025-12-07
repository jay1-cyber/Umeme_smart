# DEDAN KIMATHI UNIVERSITY OF TECHNOLOGY

**DEPARTMENT OF ELECTRICAL & ELECTRONIC ENGINEERING**

**FINAL YEAR PROJECT REPORT**

---

## PROJECT TITLE:

**IoT-ENABLED AUTOMATIC RECHARGE SYSTEM FOR KENYAN PREPAID METERS BASED ON ADVANCED METERING INFRASTRUCTURE**

---

| Registration No. | Name | Signature |
|---|---|---|
| E021-01-1297/2021 | MOSES MAINGI | _________________ |
| E021-01-1302/2021 | KELVIN LIMO | _________________ |
| E021-01-1318/2021 | DANIEL KIMOI | _________________ |

---

**SUPERVISOR: MR. NDEGWA**

A project submitted to the Department of Electrical and Electronic Engineering in partial fulfillment of the Award of Degree of Bachelor of Science in Electrical and Electronics Engineering.

**DECEMBER 2025**

---

# DECLARATION

This project is our original work, except where due acknowledgement is made in the text, and to the best of our knowledge has not been previously submitted to Dedan Kimathi University of Technology or any other institution for award of degree or diploma.

**NAME:** MOSES MAINGI **REG NO:** E021-01-1297/2021  
**SIGNATURE:** ……………………………. **DATE:** …………………………………….

**NAME:** KELVIN LIMO **REG NO:** E021-01-1302/2021  
**SIGNATURE:** ……………………………. **DATE:** …………………………………….

**NAME:** DANIEL KIMOI **REG NO:** E021-01-1318/2021  
**SIGNATURE:** ……………………………. **DATE:** …………………………………….

---

# SUPERVISOR'S CONFIRMATION

This project has been submitted to the department of Electrical and Electronics Engineering, Dedan Kimathi University of Technology with my approval as the university supervisor.

**NAME:** MR. NDEGWA  
**SIGNATURE:** ……………………………. **DATE:** ……………………………………

---

# ACKNOWLEDGEMENT

We express our profound gratitude to our supervisor, Mr. Ndegwa, for his invaluable guidance, unwavering support, and insightful feedback throughout this project. His expertise in IoT systems and smart grid technologies has been instrumental in shaping this work.

We are deeply grateful to the Department of Electrical and Electronic Engineering at Dedan Kimathi University of Technology for providing the necessary resources, laboratory facilities, and conducive learning environment that made this project possible.

Our sincere appreciation goes to Kenya Power and Lighting Company (KPLC) for their insights into the current prepaid metering challenges in Kenya, which helped us understand real-world requirements.

We thank our families and friends for their continuous encouragement and moral support during the entire duration of this project.

Above all, we thank God Almighty for the gift of life, good health, and wisdom to complete this project successfully.

---

# TABLE OF CONTENTS

**DECLARATION**  
**ACKNOWLEDGEMENT**  
**TABLE OF CONTENTS**  
**LIST OF ABBREVIATIONS**  
**LIST OF FIGURES**  
**LIST OF TABLES**  
**ABSTRACT**

**CHAPTER ONE: INTRODUCTION**
- 1.1 Background
- 1.2 Problem Statement
- 1.3 Justification
- 1.4 Objectives
  - 1.4.1 Main Objective
  - 1.4.2 Specific Objectives
- 1.5 Scope of Study

**CHAPTER TWO: LITERATURE REVIEW**
- 2.1 Introduction
- 2.2 Advanced Metering Infrastructure (AMI) Overview
- 2.3 Evolution of Prepaid Metering Systems
  - 2.3.1 Traditional Prepaid Systems
  - 2.3.2 GSM-Based Prepaid Meters
  - 2.3.3 IoT-Based Smart Meters
- 2.4 Mobile Money in Kenya and Sub-Saharan Africa
- 2.5 Global Smart Metering Initiatives
- 2.6 Previous Works and Case Studies
  - 2.6.1 Smart Metering in Kenya
  - 2.6.2 Sub-Saharan Africa Implementations
  - 2.6.3 Global Best Practices
- 2.7 Research Gap
- 2.8 Summary of Literature Review

**CHAPTER THREE: METHODOLOGY**
- 3.1 Design and Development of ESP32-Based Smart Meter Prototype
  - 3.1.1 Hardware Design and Component Selection
  - 3.1.2 ESP32 Firmware Development
- 3.2 Development of Cloud Backend and M-Pesa Integration
  - 3.2.1 Cloud Backend Architecture
  - 3.2.2 M-Pesa Daraja API Integration
  - 3.2.3 Firebase Database Implementation
- 3.3 Frontend Dashboard Development
  - 3.3.1 User Interface Design
  - 3.3.2 Real-time Data Visualization
- 3.4 System Integration and Communication Protocol
  - 3.4.1 MQTT Communication Implementation
  - 3.4.2 HTTPS API Integration
- 3.5 System Validation and Testing
  - 3.5.1 Integration Testing
  - 3.5.2 Performance Testing
  - 3.5.3 Security Testing

**CHAPTER FOUR: RESULTS AND DISCUSSION**
- 4.1 ESP32-Based Smart Meter Prototype Results
- 4.2 Cloud Backend and M-Pesa Integration Results
- 4.3 Frontend Dashboard Implementation Results
- 4.4 System Performance Analysis
- 4.5 Discussion of Findings

**CHAPTER FIVE: CONCLUSION AND RECOMMENDATIONS**
- 5.1 Conclusion
- 5.2 Recommendations
- 5.3 Future Work

**REFERENCES**

**APPENDICES**
- Appendix A: Project Budget and Bill of Materials
- Appendix B: ESP32 Firmware Code
- Appendix C: Backend Server Code
- Appendix D: System Architecture Diagrams

---

# LIST OF ABBREVIATIONS

| Abbreviation | Meaning |
|---|---|
| AMI | Advanced Metering Infrastructure |
| API | Application Programming Interface |
| AWS | Amazon Web Services |
| CIU | Customer Interface Unit |
| ESP32 | Espressif Systems 32-bit Microcontroller |
| GPRS | General Packet Radio Service |
| GSM | Global System for Mobile Communications |
| HTTPS | Hypertext Transfer Protocol Secure |
| IoT | Internet of Things |
| KPLC | Kenya Power and Lighting Company |
| LCD | Liquid Crystal Display |
| LED | Light Emitting Diode |
| LTE | Long-Term Evolution |
| MDMS | Meter Data Management System |
| MQTT | Message Queuing Telemetry Transport |
| OLED | Organic Light Emitting Diode |
| PLC | Power Line Carrier |
| REST | Representational State Transfer |
| SIM | Subscriber Identity Module |
| SMS | Short Message Service |
| SSL/TLS | Secure Sockets Layer/Transport Layer Security |
| STK | SIM Toolkit |
| UI/UX | User Interface/User Experience |
| VSC | Voltage Source Converter |
| Wi-Fi | Wireless Fidelity |

---
