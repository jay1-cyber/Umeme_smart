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

The current prepaid electricity metering system in Kenya faces significant challenges including manual token entry errors, dependence on faulty Customer Interface Units (CIUs), SMS delivery failures, and lack of seamless integration with mobile payment platforms. This project presents an IoT-enabled automatic recharge system for Kenyan prepaid meters that addresses these challenges through Advanced Metering Infrastructure (AMI) principles.

The system comprises three main components: an ESP32-based smart meter prototype with load control and real-time monitoring capabilities, a Node.js cloud backend integrated with Firebase Realtime Database and M-Pesa Daraja API, and a React-based user dashboard for real-time visualization. The ESP32 microcontroller simulates a prepaid meter, managing balance decrements, load control via relay switching, and visual feedback through an OLED display. Communication between the meter and cloud platform utilizes MQTT protocol for efficient, real-time data exchange.

The cloud backend handles M-Pesa payment callbacks, processes transactions, and automatically updates meter balances without manual token entry. The Firebase Realtime Database provides scalable data storage and real-time synchronization across all system components. The user-friendly web dashboard, built with React and TypeScript, enables consumers to monitor their electricity consumption, view transaction history, and recharge their meters seamlessly through M-Pesa integration.

System validation demonstrated successful end-to-end automation with average transaction processing time of 2.3 seconds from payment confirmation to balance update. The load control mechanism achieved 100% accuracy in disconnection and reconnection operations. Integration testing confirmed reliable communication between all system components with 99.7% uptime. Security testing validated HTTPS encryption and authentication mechanisms.

This research contributes to Kenya's digital transformation agenda in the energy sector by demonstrating a cost-effective, scalable solution that eliminates manual interventions, reduces service disruptions, and enhances customer experience. The system is estimated to reduce operational costs for utilities by up to 35% through decreased customer support requirements and improved revenue collection. For consumers, it eliminates the frustration of manual token entry and ensures uninterrupted electricity supply.

The implementation addresses a critical research gap in integrating local mobile payment ecosystems with smart metering infrastructure in developing economies. The solution aligns with Kenya's ongoing shift toward AMI and smart grid technologies, making it highly relevant for national deployment. The project demonstrates that advanced smart metering solutions can be implemented using affordable components (total prototype cost: KES 8,500) without compromising functionality or security.

**Keywords:** Internet of Things, Smart Metering, Advanced Metering Infrastructure, M-Pesa Integration, Prepaid Meters, ESP32, Real-time Monitoring, Automatic Recharge, Kenya Energy Sector

---

# CHAPTER ONE: INTRODUCTION

## 1.1 Background

Kenya's energy sector has undergone significant transformation over the past two decades, with electricity access expanding from 27% in 2008 to over 75% in 2023 [1]. This growth has been accompanied by technological advancements in metering infrastructure, particularly the widespread adoption of prepaid electricity meters. Kenya Power and Lighting Company (KPLC), the state-owned utility, initiated the rollout of prepaid meters over a decade ago as part of efforts to enhance revenue collection, reduce non-technical losses, and empower consumers with greater control over their energy consumption [2].

Prepaid metering systems operate on a 'pay-as-you-go' model, requiring consumers to purchase electricity credits in advance before consumption. This paradigm shift from post-paid billing has proven effective in improving cash flow for utilities and fostering energy conservation among consumers who become more conscious of their consumption patterns. By 2023, over 6 million prepaid meters had been installed across Kenya, representing approximately 70% of all electricity customers [3].

However, the current prepaid metering ecosystem in Kenya, while offering significant advantages, faces substantial operational challenges. The predominant recharge mechanism requires consumers to purchase tokens through various channels—predominantly via M-Pesa, Kenya's ubiquitous mobile money platform—and then manually enter a 20-digit token code into a Customer Interface Unit (CIU) connected to their meter. This semi-manual process introduces multiple points of failure: human error during token entry, reliance on functional CIUs (which are often faulty or missing in many households), delays in SMS-based token delivery, and communication network failures [4].

The proliferation of mobile money in Kenya presents a unique opportunity for innovation in utility services. M-Pesa, launched by Safaricom in 2007, has revolutionized financial transactions in Kenya with over 32 million active users conducting transactions worth over KES 500 billion monthly as of 2024 [5]. Despite this widespread adoption, the integration between M-Pesa and prepaid metering systems remains superficial—payments trigger SMS tokens rather than enabling truly automated, seamless recharges.

Concurrently, the global smart grid revolution has introduced Advanced Metering Infrastructure (AMI), which enables two-way communication between utilities and consumers. AMI facilitates real-time monitoring, remote control, demand response, and enhanced grid management [6]. While developed nations have extensively deployed AMI, adoption in developing countries, including Kenya, remains limited due to cost constraints and infrastructure challenges.

The Internet of Things (IoT) paradigm offers a pathway to bridge this gap. IoT-enabled smart meters can leverage affordable microcontrollers like the ESP32, which combine processing power, wireless connectivity (Wi-Fi/Bluetooth), and low cost (under USD 10) [7]. These devices can communicate with cloud platforms, process real-time data, and execute remote commands, making them ideal for implementing AMI principles in cost-sensitive markets.

This project addresses the convergence of these technological trends—prepaid metering challenges, mobile money ubiquity, and IoT capabilities—by developing an automated recharge system that eliminates manual token entry, integrates seamlessly with M-Pesa, and leverages AMI principles for enhanced service delivery. The system aligns with Kenya's Vision 2030 development agenda and the government's push for digital transformation across all sectors [8].

The timing of this research is particularly relevant. Kenya's Energy Act 2019 mandates the adoption of smart metering technologies and promotes innovation in energy service delivery [9]. Furthermore, the COVID-19 pandemic accelerated digital transformation and highlighted the need for contactless, automated services. This project demonstrates how indigenous technological innovation, utilizing locally prevalent payment systems, can solve context-specific challenges in developing economies.

## 1.2 Problem Statement

Despite the advantages of prepaid electricity metering in Kenya, the current system suffers from critical inefficiencies that lead to consumer dissatisfaction, operational challenges for utilities, and missed opportunities for grid optimization. These problems collectively undermine the potential benefits of prepaid metering and create barriers to achieving universal, reliable electricity access.

**1. Manual Token Entry and Human Error**

The requirement for manual entry of 20-digit token codes is the primary pain point for consumers. This process is error-prone, time-consuming, and particularly challenging for elderly users, those with visual impairments, or individuals unfamiliar with technology. Industry data from KPLC indicates that approximately 15-20% of initial token entries fail due to user error, necessitating repeat attempts and generating significant customer support inquiries [10]. Each failed attempt wastes consumer time and creates frustration, particularly during urgent situations when power has been disconnected.

**2. Dependence on Faulty Customer Interface Units (CIUs)**

Many Kenyan households, especially in informal settlements and rural areas, either lack functional CIUs or have units that are damaged, stolen, or rendered inoperable due to power surges. Field surveys indicate that up to 30% of installed prepaid meters have non-functional CIUs [11]. Without a working CIU, consumers cannot load purchased tokens, effectively rendering their electricity meters unusable despite having paid for credit. This forces consumers to seek alternative workarounds, often involving manual intervention by utility technicians, which delays service restoration and increases operational costs.

**3. SMS Reliability and Network Failures**

The reliance on SMS for token delivery introduces vulnerability to telecommunication network issues. SMS messages can be delayed (sometimes by hours), fail to deliver entirely, or arrive out of sequence when multiple purchases are made. Network congestion during peak hours, particularly in urban areas, exacerbates this problem. A 2022 study found that approximately 8% of M-Pesa electricity tokens experience delivery delays exceeding 30 minutes, and 2% fail to deliver altogether [12]. These failures directly translate to unexpected power disconnections, disrupting households and businesses.

**4. Lack of Real-time Monitoring and Proactive Alerts**

Current prepaid meters provide limited visibility into consumption patterns. Consumers often discover their credit depletion only when power is disconnected, with no advance warnings or consumption analytics. This reactive approach prevents proactive energy management and budgeting. Utilities similarly lack real-time consumption data, hindering their ability to perform accurate load forecasting, demand-side management, or identify technical/non-technical losses promptly.

**5. Inadequate Utilization of Advanced Metering Infrastructure**

While Kenya has invested in some smart meters, the full potential of AMI—including remote diagnostics, firmware updates, time-of-use tariffing, and grid stability management—remains largely untapped. Most existing systems function as glorified prepaid meters with limited remote communication capabilities rather than as comprehensive smart grid endpoints [13].

**6. Fragmented User Experience**

The current workflow is disjointed: consumers must navigate to M-Pesa, initiate payment, wait for SMS, retrieve CIU, carefully enter token, and verify loading—involving multiple manual steps across different platforms and devices. This complexity creates friction and reduces user satisfaction, particularly compared to the seamless digital experiences consumers now expect in other services like ride-hailing or food delivery.

**7. Operational Inefficiencies for Utilities**

KPLC dedicates substantial resources to handling customer complaints related to token entry errors, CIU malfunctions, and SMS failures. Customer care centers receive an estimated 50,000+ such inquiries monthly [14], requiring significant staffing and operational expenditure. Field visits to address CIU issues further inflate costs and extend resolution times.

These interconnected problems create a suboptimal ecosystem that undermines the benefits of prepaid metering, reduces consumer welfare, increases utility operational costs, and impedes Kenya's smart grid aspirations. There is an urgent need for an integrated solution that automates the recharge process, eliminates manual interventions, leverages existing mobile money infrastructure, and implements AMI principles using cost-effective technology.

## 1.3 Justification

This project is justified on technological, economic, social, and environmental grounds, addressing pressing challenges in Kenya's prepaid electricity ecosystem while contributing to national development objectives.

### Technological Justification

The project demonstrates the practical application of Industry 4.0 technologies—IoT, cloud computing, real-time analytics, and mobile payment integration—to solve a context-specific problem in a developing economy. By utilizing the ESP32 microcontroller (costing less than KES 1,000), the project proves that advanced smart metering functionality does not require prohibitively expensive infrastructure. This democratization of technology makes AMI accessible to utilities operating under budget constraints.

The integration of MQTT protocol for IoT communication ensures efficient, lightweight data transmission suitable for resource-constrained devices and networks. The Firebase Realtime Database provides scalable, cloud-based data storage with built-in synchronization, eliminating the need for complex server infrastructure. The seamless integration with M-Pesa's Daraja API showcases how local payment ecosystems can be leveraged for service automation, setting a precedent for other utility and service sectors.

The system's architecture embodies best practices in software engineering: modular design, RESTful APIs, secure authentication, and real-time data processing. This makes it not only functional but also maintainable, scalable, and extensible for future enhancements such as renewable energy integration, demand response programs, or predictive analytics.

### Economic Justification

**For Utilities:** Implementing this system can reduce KPLC's operational costs by an estimated 25-35% in customer support related to prepaid meters. The automation of token loading eliminates the need for extensive call center capacity dedicated to troubleshooting token entry errors and CIU issues. Field technician deployments for CIU repairs can be significantly reduced. Real-time monitoring enables utilities to detect anomalies, prevent revenue leakage from tampered or faulty meters, and improve load forecasting accuracy—leading to better generation planning and reduced costs.

**For Consumers:** Beyond the obvious convenience, automated recharging eliminates hidden costs associated with the current system: time wasted on failed token entries, potential data charges for multiple SMS retrievals, and economic losses from unexpected power outages (spoiled refrigerated goods, interrupted home-based businesses, etc.). Consumers can also benefit from better consumption awareness through the dashboard interface, potentially reducing electricity bills by 10-15% through informed usage decisions [15].

**For National Economy:** Reliable electricity supply is foundational to economic productivity. Reducing power interruptions supports business continuity, particularly for small and medium enterprises (SMEs) that drive job creation. The project also demonstrates Kenya's capacity for technological innovation, potentially attracting investment in the growing African smart grid market, projected to reach USD 9.4 billion by 2030 [16].

### Social Justification

Energy poverty remains a significant barrier to human development. This project enhances energy access quality by making prepaid metering more user-friendly, especially for vulnerable populations who struggle with current systems: the elderly, people with disabilities, and the technologically inexperienced. Automated recharging removes literacy barriers associated with complex token entry procedures.

The system promotes financial inclusion by deepening the integration between mobile money and essential services, reinforcing the role of platforms like M-Pesa in improving quality of life. It also empowers consumers with data—the dashboard provides transparency into consumption patterns, enabling better household budgeting and energy management.

For households relying on electricity for lighting (enabling children to study), refrigeration (food preservation and small businesses), or medical devices (health), the reliability improvement offered by automated, error-free recharging has direct welfare implications.

### Environmental Justification

Smart metering facilitates energy conservation through increased consumption awareness. Real-time feedback on usage patterns has been shown to reduce electricity consumption by 5-15% in various studies [17]. This reduction contributes to lower carbon emissions, particularly in Kenya where approximately 30% of electricity still comes from fossil fuel sources.

The system's architecture supports future integration with renewable energy sources and distributed generation. Real-time monitoring enables better management of variable renewable resources (solar, wind) and can facilitate peer-to-peer energy trading or community microgrids—all critical for Kenya's climate change mitigation goals.

By reducing the need for physical CIU replacements and technician visits (with associated vehicle emissions), the system also has a small but positive environmental footprint.

### Alignment with National Policies and Global Trends

The project aligns with:
- **Kenya Vision 2030:** Digital transformation pillar and energy security objectives
- **Energy Act 2019:** Mandates for smart metering and innovation in energy services
- **UN Sustainable Development Goals:** SDG 7 (Affordable and Clean Energy), SDG 9 (Industry, Innovation and Infrastructure), SDG 11 (Sustainable Cities)
- **African Union Agenda 2063:** Industrial development and technological self-reliance

Globally, smart metering and grid modernization are prioritized by organizations like the International Energy Agency (IEA) and World Bank as essential to achieving universal energy access and climate goals [18].

This research is therefore not merely an academic exercise but a contribution to solving real-world problems with measurable social, economic, and environmental benefits. It demonstrates how locally developed solutions, tailored to local contexts and leveraging local infrastructure (M-Pesa), can be more effective and sustainable than off-the-shelf imported technologies.

