# CHAPTER TWO: LITERATURE REVIEW

## 2.1 Introduction

This chapter examines the state of prepaid metering and smart grid technologies, focusing on Advanced Metering Infrastructure (AMI), mobile money platforms, and the research gaps that this project addresses.

## 2.2 Advanced Metering Infrastructure (AMI) Overview

AMI represents a shift from one-way metering to bi-directional communication between utilities and consumers, enabling real-time monitoring, remote control, and grid management [1].

### 2.2.1 Core Components

- **Smart Meters:** Measure consumption at high temporal resolution and transmit data automatically [2]
- **Communication Networks:** PLC, cellular (GSM/LTE), RF mesh, Wi-Fi, or LoRaWAN [3][4][5][6]
- **Meter Data Management System (MDMS):** Central repository for meter data with analytics capabilities [7]
- **Head-End System (HES):** Manages bidirectional communication with meters [8]

### 2.2.2 Benefits of AMI

- **Operational Efficiency:** Reduces meter reading labor costs by 60-80%, improves data accuracy to >99.5% [9][10]
- **Revenue Protection:** Reduces non-technical losses by 15-25% through tamper detection [11]
- **Demand-Side Management:** Enables time-of-use tariffing; consumers reduce peak demand by 10-20% [12]
- **Consumer Empowerment:** Real-time consumption data enables 5-15% energy conservation [13][14]

### 2.2.3 AMI Deployment Challenges

- **High Costs:** Smart meters cost 3-5x more than conventional meters [15]
- **Interoperability:** Lack of standardization across manufacturers [16]
- **Cybersecurity:** New attack surfaces require robust security measures [17]
- **Skills Gap:** IT and data analytics expertise requirements [18][19]

AMI penetration in Africa remains below 5%, compared to >60% in Europe and North America [20].

## 2.3 Evolution of Prepaid Metering Systems

### 2.3.1 Traditional Prepaid Systems

First-generation prepaid meters (1980s) relied on physical tokens or smart cards purchased from vending points [21]. Limitations included inconvenience, token loss risk, and no remote management.

### 2.3.2 GSM-Based Prepaid Meters

GSM integration in the 2000s enabled SMS-based token delivery [22]. However, problems persist:

- **SMS Reliability:** 8% of tokens experience delays >30 minutes; 2% fail completely [23]
- **Manual Token Entry:** 15-20% of first-time entries fail due to human error [24]
- **CIU Failures:** Up to 30% of CIUs are non-functional in informal settlements [25]

### 2.3.3 IoT-Based Smart Meters

Current IoT meters use affordable microcontrollers (ESP32), cloud platforms, and MQTT communication [26][27]. Academic prototypes include:

- Kumar et al. (2020): NodeMCU-based meter with web dashboard [28]
- Okonkwo et al. (2021): ESP32 system with SMS alerts in Nigeria [29]
- Githae et al. (2022): LoRaWAN meter for rural Kenya [30]

**Critical Gap:** Existing IoT prototypes track consumption automatically, but recharge still requires manual token entry. This project addresses this gap by integrating M-Pesa Daraja API for fully automated payment-to-balance-update without manual intervention.

## 2.4 Mobile Money in Kenya and Sub-Saharan Africa

### 2.4.1 M-Pesa in Kenya

M-Pesa (launched 2007) has over 32 million active users in Kenya (>85% of adult population), processing KES 500 billion monthly [31][32]. Over 75% of prepaid electricity purchases are made via M-Pesa [33].

**Daraja API:** Safaricom's developer platform enables M-Pesa integration through STK Push (payment prompts), C2B (business payments), and transaction queries [34]. This creates opportunities for automating utility payments—an opportunity largely untapped in current implementations.

### 2.4.2 Mobile Money Across Africa

Sub-Saharan Africa accounts for nearly half of global mobile money transaction values [39]. Mobile money penetration exceeds 60% in Kenya, Uganda, Tanzania, Ghana, and Rwanda [40]. However, utility integrations remain superficial—payments trigger SMS tokens rather than fully automated service delivery.

## 2.5 Global Smart Metering Initiatives

### 2.5.1 Developed Nations

- **Europe:** EU mandates 80% smart meter penetration by 2025. Italy deployed 35 million meters with 15% energy savings [41][42][43][44]
- **North America:** US has >100 million smart meters (60% penetration) [45][46]
- **Asia-Pacific:** China leads with 600 million meters; Singapore achieved 100% coverage by 2024 [47][48][49]

**Success Factors:** Regulatory mandates, government investment, consumer education, and open standards [41].

### 2.5.2 Developing Economies

- **India:** Targets 250 million meters by 2025; faces cost and infrastructure challenges [50]
- **Philippines (Meralco):** Deployed 1 million prepaid smart meters with mobile money—closest global example to this project's approach [52]
- **South Africa:** Eskom program achieved only 20% of targets due to financial constraints [53]

**Key Lessons:** Leverage existing infrastructure (cellular networks, mobile money), use low-cost hardware (ESP32), and focus on prepaid models familiar to consumers [51].

## 2.6 Previous Works and Case Studies

### 2.6.1 Smart Metering in Kenya

KPLC deployed approximately 200,000 smart meters in pilots (2018), but the program stalled due to high costs (USD 80-120 vs USD 25-30 for conventional meters) [54].

**Relevant Academic Research:**
- Mwangi & Karanja (2020): 78% consumer acceptance of smart meters [55]
- Ochieng et al. (2021): LoRa-based meter with 10km range, but no payment integration [56]
- Njoroge & Wekesa (2022): Smart meters reduced non-technical losses by 22% [57]
- Kariuki et al. (2023): Blockchain energy trading with M-Pesa—scalability challenges [58]

Off-grid solar companies (M-KOPA, d.light) have pioneered pay-as-you-go systems with M-Pesa integration, demonstrating consumer acceptance [59].

### 2.6.2 Sub-Saharan Africa Implementations

- **Tanzania (TANESCO):** 500,000 smart meters deployed, but still uses SMS tokens [60]
- **Uganda (UMEME):** Yaka meters with mobile money, but centralized token generation causes delays [61]
- **Rwanda (REG):** 72% smart meter penetration—highest in Africa [62]

**Common Theme:** While prepaid metering is widespread, automatic recharge integrated with mobile money remains rare.

### 2.6.3 Global Best Practices

**Philippines (Meralco):** Prepaid system with mobile wallet integration for instant, automatic recharge—95% customer satisfaction [65]. This closely resembles our proposed approach.

**Critical Success Factors:**
- Seamless integration with local payment preferences (mobile money)
- Affordable hardware (<USD 30 per meter)
- Real-time notifications for balance updates [66][67][68]

## 2.7 Research Gap

Despite extensive literature on smart metering and mobile money, significant gaps exist:

1. **No Seamless Mobile Money Integration:** Utilities accept mobile money payments, but few have eliminated manual token entry. This project implements end-to-end automation.

2. **Incomplete System Architectures:** Most prototypes focus on hardware without complete cloud backend, database, and UI integration. This project documents a full system.

3. **Limited User Experience Focus:** Academic literature emphasizes technical metrics over dashboard usability. This project prioritizes consumer-facing UX.

4. **Cost Analysis for African Markets:** Most research assumes developed-nation budgets. This project achieves functionality at <KES 10,000 (USD 75).

5. **Local Context:** Solutions designed for reliable grids may not translate to Kenyan conditions (intermittent internet, CIU issues). This project addresses local challenges.

## 2.8 Summary

The literature review establishes that:
- AMI offers substantial benefits but faces cost barriers in developing economies
- Prepaid metering in Africa has evolved minimally from SMS token systems
- M-Pesa is ubiquitous but underutilized for automated utility service delivery
- Existing IoT meter research lacks mobile money integration and complete system design

This project addresses these gaps with a holistic, context-appropriate solution that eliminates manual token entry through M-Pesa automation.

