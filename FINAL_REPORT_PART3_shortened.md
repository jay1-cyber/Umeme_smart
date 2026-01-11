# 1.4 Objectives

## 1.4.1 Main Objective

To design, develop, and evaluate an IoT-enabled automatic recharge system for Kenyan prepaid meters that eliminates manual token entry through seamless M-Pesa integration and Advanced Metering Infrastructure (AMI) principles.

## 1.4.2 Specific Objectives

1. **Design and prototype an ESP32-based smart meter simulation** .with real-time balance monitoring (OLED display), LED-based load control simulation, visual/audible alerts, Wi-Fi connectivity, and MQTT communication

2. **Develop a cloud backend integrated with M-Pesa Daraja API** that processes payment callbacks, manages user accounts in Firebase, and automatically transmits recharge commands to meters without manual intervention.

3. **Create a responsive web dashboard** using React/TypeScript for real-time balance monitoring, transaction history, consumption visualization, and M-Pesa recharge initiation.

4. **Validate system performance** through integration testing (end-to-end transaction flow), performance testing (latency measurements), reliability testing (uptime and fault tolerance), and security testing (encryption validation).

## 1.5 Scope of Study

This research project focuses on developing a complete proof-of-concept system for automated prepaid meter recharging in the Kenyan context. The scope encompasses both the technical implementation and the validation of the system's effectiveness in addressing identified problems.

### Included in Scope

**1. Hardware Prototype Development**
- Design and assembly of ESP32-based smart meter simulator
- Integration of peripherals: SIM800L GSM module, 0.96-inch I2C OLED display, active buzzer, status LEDs (Blue/Green/Red), 5V power supply
- Circuit design with proper power management and component interfacing
- LED-based load control simulation for safe laboratory environment
- Comprehensive documentation of hardware specifications and assembly procedures

**2. Firmware Development**
- ESP32 firmware programming using Arduino IDE and ESP-IDF framework
- Implementation of Wi-Fi connectivity and network management
- SIM800L GSM integration for hybrid connectivity and SMS alerts
- MQTT client implementation for real-time communication
- Balance simulation logic with configurable consumption rates
- Load control algorithms for LED indicator switching (simulates relay operation)
- OLED display driver and user interface rendering
- Alert management system (buzzer and multi-LED status indicators)
- Over-the-air (OTA) firmware update capability (optional enhancement)

**3. Cloud Backend Development**
- Node.js/Express server implementation
- Firebase Realtime Database schema design and integration
- M-Pesa Daraja API integration (both sandbox and simulation environments)
- RESTful API development with endpoints for:
  - ESP32 data reporting and command reception
  - M-Pesa payment callback handling
  - User account management
  - Transaction query and reporting
- Secure authentication and authorization mechanisms
- Webhook handling and asynchronous task processing
- Error handling, logging, and monitoring infrastructure

**4. Database Architecture**
- Firebase Realtime Database structure design optimized for:
  - User profile management (meter numbers, contact information, account details)
  - Real-time balance tracking with timestamp precision
  - Transaction history with complete audit trails
  - System status and health metrics
- Data validation rules and security policies
- Indexing strategies for efficient query performance

**5. Frontend Dashboard Development**
- Responsive web application using React and TypeScript
- Modern UI implementation with shadcn/ui components and Tailwind CSS
- Real-time data synchronization with Firebase
- Interactive data visualization (charts, graphs, consumption trends)
- User authentication and session management
- Mobile-responsive design for cross-device compatibility

**6. Communication Protocols**
- MQTT implementation for ESP32-to-cloud messaging
- Topic structure design (meter status, balance updates, commands, alerts)
- Quality of Service (QoS) level selection for reliable delivery
- HTTPS API communication with proper error handling
- Webhook implementation for M-Pesa callbacks

**7. M-Pesa Integration**
- Daraja API integration for Lipa na M-Pesa Online (STK Push)
- Customer-to-Business (C2B) payment simulation
- Callback URL configuration and payment verification
- Transaction reconciliation logic
- Fallback mechanisms for API failures

**8. Testing and Validation**
- Development of comprehensive test suites for all system components
- End-to-end workflow testing (payment → balance update → load control)
- Performance benchmarking under various load conditions
- Security vulnerability assessment
- User acceptance testing with simulated consumer scenarios
- Documentation of test results, metrics, and observations

**9. Documentation**
- Complete project documentation including:
  - System architecture diagrams
  - API documentation with endpoint specifications
  - Database schema documentation
  - Hardware assembly guides
  - User manuals for dashboard operation
  - Deployment and maintenance procedures

### Excluded from Scope

**1. Actual KPLC Meter Integration**
- This project does not involve physical integration with Kenya Power's existing meter infrastructure
- No tampering or modification of installed KPLC meters
- The ESP32 prototype is a standalone simulation for proof-of-concept purposes

**2. Live M-Pesa Financial Transactions**
- Real money transactions are not conducted during testing
- Daraja API sandbox environment and simulations are used exclusively
- No consumer funds are at risk during development and testing phases

**3. Regulatory Compliance and Certification**
- Formal certification by Energy and Petroleum Regulatory Authority (EPRA) is not pursued
- Full regulatory compliance assessment is deferred to commercialization phase
- Legal frameworks for consumer data protection are acknowledged but not formally audited

**4. Commercial Deployment Infrastructure**
- Large-scale production hardware manufacturing
- Nationwide network infrastructure deployment
- Commercial customer onboarding systems
- 24/7 technical support infrastructure

**5. Advanced Features Beyond Core Functionality**
- Time-of-use tariffing and demand response programs
- Integration with renewable energy sources (solar panels, batteries)
- Peer-to-peer energy trading capabilities
- Predictive analytics and machine learning models for consumption forecasting
- Integration with other utility services (water, gas)

These advanced features, while valuable, are identified as future work to maintain project focus and feasibility within the academic timeframe.

**6. Extensive Market Research and Business Planning**
- Detailed market penetration strategies
- Comprehensive business model development
- Investor pitch materials and financial projections
- Partnership negotiations with KPLC or other stakeholders

While market viability is discussed in the literature review, extensive commercialization planning is beyond the scope of this academic research project.

**7. Large-Scale Security Audits**
- Penetration testing by certified security professionals
- Comprehensive compliance with international security standards (ISO 27001, etc.)
- Formal cryptographic protocol verification

Basic security best practices are implemented (HTTPS, authentication, data encryption), but formal security certification is left for future commercial development.

### Project Boundaries and Focus

The primary focus of this project is **technical feasibility demonstration**. The research answers the question: "Can an automated, IoT-enabled prepaid meter recharge system be built using affordable components and local payment infrastructure?" The successful completion of all specific objectives provides an affirmative answer with a working prototype as evidence.

The project is conducted within the following constraints:
- **Timeline:** Approximately 14 weeks from proposal approval to final presentation
- **Budget:** Limited to KES 25,000 for hardware components and cloud services
- **Team Capacity:** Three undergraduate students with faculty supervision
- **Laboratory Access:** DeKUT Electrical Engineering lab facilities and equipment
- **Connectivity:** Reliance on university and personal internet connections for cloud services

### Geographic and Demographic Context

While the solution is designed for Kenya, the technical approach is generalizable to other countries in Sub-Saharan Africa with similar challenges:
- High mobile money penetration
- Prepaid metering prevalence
- Limited smart grid infrastructure
- Cost-sensitive markets

The literature review and market analysis specifically address the Kenyan and East African context, but technical implementation principles are universally applicable.

### Success Criteria

The project is considered successful if all four specific objectives are achieved:
1. ✅ Functional ESP32 prototype demonstrating meter simulation and load control
2. ✅ Cloud backend successfully processing simulated M-Pesa payments and updating balances automatically
3. ✅ User dashboard displaying real-time data and enabling consumer interaction
4. ✅ Testing validating system performance, reliability, and security within acceptable parameters

Additional success indicators include:
- Complete, professional documentation suitable for academic evaluation and potential future development
- Demonstration of cost-effectiveness (total system cost significantly lower than commercial alternatives)
- Identification of clear pathways for future enhancement and commercial deployment
- Contribution to academic knowledge through potential publications or presentations

---

*This comprehensive scope ensures that the project delivers tangible, demonstrable value while remaining achievable within academic constraints. The balance between ambition and pragmatism is carefully maintained to produce a rigorous, high-quality final year project.*

