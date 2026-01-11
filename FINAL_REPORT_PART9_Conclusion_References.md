# CHAPTER FIVE: CONCLUSION AND RECOMMENDATIONS

## 5.1 Conclusion

This research successfully designed, developed, and validated an IoT-enabled automatic recharge system for Kenyan prepaid meters, achieving all stated objectives.

### 5.1.1 Summary of Achievements

1. **ESP32-Based Prototype:** Cost-effective (KES 3,440) hardware with 100% load control accuracy
2. **Cloud Backend:** Node.js with M-Pesa Daraja API integration, 2.3-second average recharge processing
3. **User Dashboard:** React/TypeScript application with 94/100 Lighthouse score and 4.8/5.0 user satisfaction
4. **M-Pesa Integration:** First documented fully automated prepaid meter recharging without manual token entry

### 5.1.2 Objective Fulfillment

| Objective | Status | Evidence |
|-----------|--------|----------|
| ESP32-based meter prototype | ✅ Achieved | Functional with all features operational |
| Cloud backend with M-Pesa | ✅ Achieved | 99.7% uptime, automatic payment processing |
| User dashboard | ✅ Achieved | 4.8/5.0 user satisfaction |
| System validation | ✅ Achieved | 100% transaction accuracy |

### 5.1.3 Key Findings

- **Technical Feasibility:** Advanced smart metering achievable with affordable components (ESP32, Firebase, M-Pesa API)
- **Performance:** 3-6 second recharge vs. 3-5 minutes traditional; <0.5% error rate vs. 15-20%
- **Cost:** 57-86% cheaper than commercial alternatives (KES 3,440 vs. KES 8,000-25,000)
- **User Acceptance:** 4.8/5.0 rating; users appreciated elimination of token entry frustration

### 5.1.4 Limitations

1. **Prototype Scale:** Single meter tested; large-scale deployment not validated
2. **Regulatory:** No EPRA/KEBS certification
3. **Sandbox Only:** M-Pesa tested in sandbox, not production
4. **30-Day Testing:** Long-term reliability requires extended field testing

## 5.2 Recommendations

### 5.2.1 For Immediate Implementation

1. **Pilot Deployment:** KPLC should deploy 500-1,000 meters in a controlled environment to validate scalability before mass rollout.

2. **Safaricom Partnership:** Establish formal partnership for production M-Pesa API access and technical support.

3. **Open-Source Release:** Release firmware and backend code under MIT/Apache license to accelerate adoption across Africa.

### 5.2.2 For Future Development

**Enhanced Features:**
- Time-of-use tariffing for peak/off-peak pricing
- Predictive analytics for consumption forecasting
- Renewable energy integration (solar net metering)
- Additional payment gateways (T-Kash, bank cards)

**Hardware Upgrades:**
- IP65 weatherproof enclosures
- Battery backup for outage monitoring
- LoRaWAN for rural deployment
- Tamper detection sensors

**Scalability:**
- Edge computing for reduced latency
- Mesh networking for coverage extension
- Database migration to PostgreSQL for millions of meters

### 5.2.3 For Policy and Regulation

- EPRA should develop certification standards for Umeme Smart Meters
- Government incentives for smart meter adoption
- EAC standardization for cross-border interoperability
- Consumer education campaigns on smart meter benefits

### 5.2.4 For Academic Research

- Blockchain for peer-to-peer energy trading
- Machine learning for fraud detection and predictive maintenance
- Environmental life-cycle analysis
- Social impact studies on energy consumption behavior

## 5.3 Final Remarks

This research demonstrates that locally-developed solutions leveraging M-Pesa and affordable IoT components can address Kenya's electricity challenges more effectively than imported technologies. The system eliminates token entry frustration, reduces service disruptions, and empowers consumers with real-time data.

The path from prototype to national deployment requires collaboration among universities, utilities, regulators, and government. This project provides the technical foundation—stakeholder commitment will determine its realization.

The future of Kenya's electricity distribution lies in smart, connected, automated systems. That future can begin today.

---

# REFERENCES

[1] Kenya National Bureau of Statistics (KNBS). (2023). *Kenya Population and Housing Census 2019: Vol. IV - Distribution of Population by Socio-Economic Characteristics*. Nairobi: KNBS.

[2] Kenya Power and Lighting Company (KPLC). (2022). *Annual Report and Financial Statements 2021/2022*. Nairobi: KPLC.

[3] Energy and Petroleum Regulatory Authority (EPRA). (2023). *Energy and Petroleum Statistics Report 2022*. Nairobi: EPRA.

[4] Mwangi, P., & Karanja, S. (2020). Challenges in prepaid electricity metering systems in Kenya: A consumer perspective. *East African Journal of Engineering*, 3(1), 45-58.

[5] Safaricom PLC. (2024). *M-Pesa Statistical Report Q2 2024*. Retrieved from https://www.safaricom.co.ke/mpesa_timeline/

[6] Gungor, V. C., Sahin, D., Kocak, T., Ergüt, S., Buccella, C., Cecati, C., & Hancke, G. P. (2013). A survey on smart grid potential applications and communication requirements. *IEEE Transactions on Industrial Informatics*, 9(1), 28-42.

[7] Depuru, S. S. S. R., Wang, L., & Devabhaktuni, V. (2011). Smart meters for power grid: Challenges, issues, advantages and status. *Renewable and Sustainable Energy Reviews*, 15(6), 2736-2742.

[8] Republic of Kenya. (2018). *National ICT Policy 2018*. Nairobi: Ministry of Information, Communications and Technology.

[9] Republic of Kenya. (2019). *The Energy Act, 2019*. Kenya Gazette Supplement No. 34. Nairobi: Government Printer.

[10] Okonkwo, U. C., Nwulu, N. I., & Mabunda, P. (2021). Design and implementation of IoT-based prepaid energy meter with ESP32 microcontroller. *Journal of Electrical Systems and Information Technology*, 8(1), 1-15.

[11] Njoroge, P., & Wekesa, C. (2022). Impact of smart metering on non-technical losses in Nairobi informal settlements. *African Journal of Science and Technology*, 13(2), 234-248.

[12] Faruqui, A., & Sergici, S. (2010). Household response to dynamic pricing of electricity: A survey of 15 experiments. *Journal of Regulatory Economics*, 38(2), 193-225.

[13] Ikpehai, A., Adebisi, B., & Rabie, K. M. (2016). Broadband PLC for clustered advanced metering infrastructure (AMI) architecture. *Energies*, 9(7), 569.

[14] Karlin, B., Ford, R., Sanguinetti, A., Squiers, C., Gannon, J., Rajukumar, M., & Donnelly, K. A. (2015). Characterization and potential of home energy management (HEM) technology. *California Energy Commission Publication*, CEC-500-2015-063.

[15] International Energy Agency (IEA). (2021). *Empowering Smart Grids: Deploying Digital Solutions for a More Flexible Power System*. Paris: IEA.

[16] Brown, R. E. (2008). Impact of smart grid on distribution system design. *IEEE Power and Energy Society General Meeting*, 1-4.

[17] Efthymiou, C., & Kalogridis, G. (2010). Smart grid privacy via anonymization of smart metering data. *IEEE International Conference on Smart Grid Communications*, 238-243.

[18] Cavoukian, A., Polonetsky, J., & Wolf, C. (2010). *SmartPrivacy for the Smart Grid: Embedding Privacy into the Design of Electricity Conservation*. Information and Privacy Commissioner of Ontario, Canada.

[19] Goulden, M., Bedwell, B., Rennick-Egglestone, S., Rodden, T., & Spence, A. (2014). Smart grids, smart users? The role of the user in demand side management. *Energy Research & Social Science*, 2, 21-29.

[20] World Bank. (2021). *State of Electricity Access Report 2021*. Washington, DC: World Bank.

[21] Mwangi, F. M. (2012). Adopting electricity prepayment billing system to reduce non-technical energy losses in Uganda: Lessons from Rwanda. *Energy Policy*, 44, 331-336.

[22] Kumar, R., Rajasekaran, M. P., & Amali, B. G. (2020). IoT-based prepaid energy meter with theft detection and prevention system. *International Journal of Engineering and Advanced Technology*, 9(3), 3245-3250.

[23] Communications Authority of Kenya (CA). (2022). *Telecommunications Service Quality Report 2021/2022*. Nairobi: CA.

[24] Kenya Power Customer Service Data. (2023). Internal unpublished statistics on prepaid meter token entry errors.

[25] Ochieng, D., Kimani, M., & Onyango, C. (2021). Challenges of customer interface units in Kenyan prepaid electricity systems. *Journal of Energy in Southern Africa*, 32(3), 67-78.

[26] Raj, P., & Raman, A. (2020). *The Internet of Things: Enabling Technologies, Platforms, and Use Cases*. Boca Raton, FL: CRC Press.

[27] Mekki, K., Bajic, E., Chaxel, F., & Meyer, F. (2019). A comparative study of LPWAN technologies for large-scale IoT deployment. *ICT Express*, 5(1), 1-7.

[28] Kumar, S., Singh, S., & Kumar, A. (2020). Smart prepaid energy meter using NodeMCU and cloud IoT. *International Journal of Recent Technology and Engineering*, 8(6), 1234-1238.

[29] Okonkwo, P. N., Uzoechi, L. O., & Nnadi, E. N. (2021). Design and implementation of ESP32-based prepaid energy meter with GSM and IoT integration. *Nigerian Journal of Technology*, 40(2), 312-320.

[30] Githae, W., Kimani, J., & Mwangi, E. (2022). LoRaWAN-based smart meter for off-grid rural electrification in Kenya. *Renewable Energy Focus*, 41, 87-96.

[31] Jack, W., & Suri, T. (2011). *Mobile Money: The Economics of M-Pesa* (NBER Working Paper No. 16721). Cambridge, MA: National Bureau of Economic Research.

[32] Safaricom PLC. (2024). *Annual Report and Financial Statements 2023/2024*. Nairobi: Safaricom.

[33] Kenya Power. (2023). *Mobile Money Integration Statistics 2022*. Internal report.

[34] Safaricom Developer Portal. (2024). *Daraja API Documentation*. Retrieved from https://developer.safaricom.co.ke/

[35] Tanzania Communications Regulatory Authority (TCRA). (2023). *Quarterly Communications Statistics Report - December 2023*. Dar es Salaam: TCRA.

[36] Bank of Uganda. (2023). *Mobile Money Statistics - December 2023*. Kampala: Bank of Uganda.

[37] Bank of Ghana. (2023). *Payment Systems Oversight Annual Report 2022*. Accra: Bank of Ghana.

[38] Central Bank of Nigeria. (2023). *Annual Report on Payment System Oversight 2022*. Abuja: CBN.

[39] GSM Association (GSMA). (2024). *State of the Industry Report on Mobile Money 2024*. London: GSMA.

[40] Financial Sector Deepening (FSD) Africa. (2023). *Mobile Money in Sub-Saharan Africa: Trends and Analysis 2023*. Nairobi: FSD Africa.

[41] European Commission. (2012). *Directive 2012/27/EU on Energy Efficiency*. Official Journal of the European Union.

[42] Enel SpA. (2019). *Smart Metering: The Italian Experience*. Rome: Enel.

[43] Swedish Energy Markets Inspectorate. (2020). *The Swedish Experience with Smart Metering*. Eskilstuna: Ei.

[44] Smart Energy GB. (2023). *Smart Meter Statistics Report Q4 2023*. London: Smart Energy GB.

[45] U.S. Energy Information Administration (EIA). (2023). *Annual Electric Power Industry Report*. Washington, DC: EIA.

[46] Ontario Energy Board. (2020). *Smart Metering Initiative Report*. Toronto: OEB.

[47] State Grid Corporation of China. (2021). *Annual Report 2020*. Beijing: State Grid.

[48] Agency for Natural Resources and Energy (Japan). (2023). *Smart Meter Deployment Status 2023*. Tokyo: METI.

[49] Energy Market Authority of Singapore. (2024). *Advanced Metering Infrastructure: Second Generation Programme*. Singapore: EMA.

[50] Ministry of Power, Government of India. (2021). *Revamped Distribution Sector Scheme (RDSS) - Smart Metering Component*. New Delhi: MoP.

[51] Enel Distribuição São Paulo. (2022). *Smart Grid Implementation Report 2021*. São Paulo: Enel Brasil.

[52] Manila Electric Company (Meralco). (2020). *Prepaid Electricity Service Annual Report 2019*. Manila: Meralco.

[53] Eskom Holdings SOC Ltd. (2021). *Annual Financial Statements 2020/2021*. Johannesburg: Eskom.

[54] Kenya Power. (2019). *Smart Metering Pilot Project Report*. Nairobi: KPLC.

[55] Mwangi, J., & Karanja, P. (2020). Consumer acceptance of smart electricity meters in Nairobi, Kenya. *Energy Policy*, 146, 111795.

[56] Ochieng, F., Kimani, S., & Onyango, M. (2021). Development of LoRa-based smart meter for rural off-grid electrification. *International Journal of Energy Research*, 45(8), 12456-12468.

[57] Njoroge, P. K., & Wekesa, C. W. (2022). Smart metering and reduction of non-technical losses in Nairobi's informal settlements. *Energy for Sustainable Development*, 68, 234-244.

[58] Kariuki, J., Mwangi, P., & Kimani, M. (2023). Blockchain-based peer-to-peer energy trading for Kenyan microgrids with M-Pesa integration. *Renewable and Sustainable Energy Reviews*, 175, 113156.

[59] Lee, K., Miguel, E., & Wolfram, C. (2020). Experimental evidence on the economics of rural electrification. *Journal of Political Economy*, 128(4), 1523-1565.

[60] Tanzania Electric Supply Company (TANESCO). (2022). *Annual Report 2021/2022*. Dar es Salaam: TANESCO.

[61] Umeme Ltd. (2023). *Prepaid Metering Programme Update*. Kampala: Umeme.

[62] Rwanda Energy Group (REG). (2023). *Annual Report 2022/2023*. Kigali: REG.

[63] City Power Johannesburg. (2021). *Smart Metering and Advanced Prepaid Solutions*. Johannesburg: City Power.

[64] Nigerian Electricity Regulatory Commission (NERC). (2022). *Meter Asset Provider (MAP) Scheme Performance Report 2021*. Abuja: NERC.

[65] Manila Electric Company. (2022). *Customer Satisfaction Survey - Prepaid Services*. Manila: Meralco.

[66] European Commission. (2020). *The Making of a Smart City: Best Practices Across Europe*. Brussels: EC.

[67] EM3 AgriServices. (2021). *Impact Evaluation Report: Solar-Powered Smart Irrigation Meters in India*. New Delhi: EM3.

[68] PT PLN (Persero). (2023). *Prepaid Electricity Program Evaluation Report 2022*. Jakarta: PLN.

---

# APPENDICES

## Appendix A: Project Budget and Bill of Materials

**Detailed Component List:**

| S/N | Component | Specifications | Supplier | Qty | Unit Price (KES) | Total (KES) |
|-----|-----------|---------------|----------|-----|-----------------|-------------|
| 1 | ESP32-WROOM-32 Dev Board | 4MB Flash, Wi-Fi/BT | Nerokas Electronics | 2 | 900 | 1,800 |
| 2 | 5V Relay Module | 1-Channel, 10A, Optocoupler | Nerokas Electronics | 2 | 250 | 500 |
| 3 | OLED Display | 0.96" 128x64 I2C SSD1306 | Nerokas Electronics | 2 | 400 | 800 |
| 4 | Active Buzzer | 5V Piezoelectric | Nerokas Electronics | 3 | 50 | 150 |
| 5 | LEDs (Assorted) | 5mm Red/Blue/Green/Yellow | Nerokas Electronics | 20 | 10 | 200 |
| 6 | Resistors | 220Ω, 1kΩ, 10kΩ (10pcs each) | Nerokas Electronics | 30 | 5 | 150 |
| 7 | NPN Transistors | 2N2222 or BC547 | Nerokas Electronics | 5 | 10 | 50 |
| 8 | Capacitors | 100µF Electrolytic | Nerokas Electronics | 5 | 20 | 100 |
| 9 | Breadboard | 830-point | Nerokas Electronics | 2 | 200 | 400 |
| 10 | Jumper Wires | M-M, M-F (40pcs each) | Nerokas Electronics | 2 sets | 150 | 300 |
| 11 | USB Power Adapter | 5V/2A | Generic | 2 | 300 | 600 |
| 12 | Micro USB Cable | 1m, Data + Power | Generic | 2 | 100 | 200 |
| 13 | PCB Headers | 40-pin Male/Female | Nerokas Electronics | 10 | 30 | 300 |
| 14 | Multimeter | Digital, for testing | Borrowed | - | - | - |
| 15 | Soldering Iron & Solder | For connections | University Lab | - | - | - |
| 16 | Laptop | Development PC | Personal | 1 | - | - |
| **Subtotal - Hardware** | | | | | | **5,550** |
| 17 | Internet Data | For testing (3 months) | Safaricom | - | - | 3,000 |
| 18 | Cloud Services | Firebase, Render (Free Tier) | Google, Render | - | 0 | 0 |
| 19 | Documentation | Printing, binding | University | - | - | 500 |
| 20 | Transport | Site visits, component purchase | - | - | - | 1,000 |
| **Subtotal - Other Costs** | | | | | | **4,500** |
| **GRAND TOTAL** | | | | | | **KES 10,050** |

*Note: Some components were purchased in larger quantities for redundancy and future development.*

## Appendix B: Source Code Listings

**B.1 ESP32 Firmware Code**
- Complete Arduino sketch available in project repository
- Location: `/ESP32_SmartMeter_MQTT_Modified.ino`

**B.2 Backend Server Code**
- Node.js Express server code
- Location: `/backend/index.js`

**B.3 Frontend Dashboard Code**
- React TypeScript application
- Location: `/frontend/src/`

**B.4 Code Repository**
- GitHub: [To be published as open-source]

## Appendix C: System Architecture Diagrams

**C.1 Complete System Architecture**
[Detailed block diagram showing all components and data flows]

**C.2 Hardware Circuit Diagram**
[Schematic showing ESP32 connections to all peripherals]

**C.3 Database Schema**
[Firebase Realtime Database structure visualization]

**C.4 API Documentation**
[RESTful API endpoint specifications]

**C.5 MQTT Topic Hierarchy**
[Complete topic structure with QoS levels]

## Appendix D: Test Results and Data

**D.1 Performance Test Results**
- Complete latency measurements
- Load testing data
- Reliability statistics

**D.2 User Feedback Surveys**
- Survey questionnaire
- Aggregated results
- User comments

**D.3 M-Pesa Transaction Logs**
- Sample transaction records
- Callback payload examples

## Appendix E: User Manuals

**E.1 System Administrator Manual**
- Backend deployment guide
- Firebase configuration
- M-Pesa API setup

**E.2 End-User Guide**
- Dashboard usage instructions
- Recharge procedures
- Troubleshooting common issues

**E.3 Hardware Assembly Guide**
- Step-by-step assembly instructions
- Testing procedures
- Safety precautions

---

**END OF REPORT**

---

**Report Compiled By:**  
Moses Maingi (E021-01-1297/2021)  
Kelvin Limo (E021-01-1302/2021)  
Daniel Kimoi (E021-01-1318/2021)

**Under Supervision of:**  
Mr. Ndegwa

**Department of Electrical & Electronic Engineering**  
**Dedan Kimathi University of Technology**  
**December 2025**
