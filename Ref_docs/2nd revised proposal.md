> ![](media/image1.jpeg){width="2.396456692913386in"
> height="1.095275590551181in"}
>
> **DEDAN KIMATHI UNIVERSITY OF TECHNOLOGY**
>
> **SCHOOL OF ENGINEERING**
>
> **DEPARTMENT OF ELECTRICAL & ELECTRONIC ENGINEERING**
>
> **COURSE:**

**IoT-Enabled Automatic Recharge System for Kenyan Prepaid Meters Based
on Advanced Metering Infrastructure**

**Supervisor:**

Mr. NDEGWA

**Presented by:**

**NAME:** MOSES MAINGI **REG NO:** E021-01-1297/2021

**NAME:** Kelvin Limo **REG NO:** E021-01-1302/2021

**NAME:** DANIEL KIMOI **REG NO:** E021-01-1318/2021

A project proposal submitted in partial fulfillment of the requirement
for the award of the

Degree of Bachelor of Science in Electrical and Electronic Engineering
in the Dedan Kimathi University of Technology

> **JULY 2025**

**DECLARATION**

This research proposal is my (our) original work, except where due
acknowledgment is made in the text, and to the best of my (our)
knowledge has not been previously submitted to Dedan Kimathi University
of Technology or any other institution for the award of a degree or
diploma.

  --------------------------------------------------------------------------------------------------------------------------
  Name: Moses Maingi                                                    Reg No: E021-01-1297/2021
  -------------------------------------------------------------- ------ ----------------------------------------------------
  Signature:                                                            Date:
  \...\...\...\...\...\...\...\...\...\...\...\...\...\.....            \...\...\...\...\...\...\...\...\...\...\...\.....

  Name: Kelvin Limo                                                     Reg No: E021-01-1302/2021

  Signature:                                                            Date:
  \...\...\...\...\...\...\...\...\...\...\...\...\...\...\...          \...\...\...\...\...\...\...\...\...\...\...\.....

  Name: Daniel Kimoi                                                    Reg No: E021-01-1318/2021

  Signature:                                                            Date:
  \...\...\...\...\...\...\...\...\...\...\...\...\...\...\...          \...\...\...\...\...\...\...\...\...\...\...\.....

                                                                        
  --------------------------------------------------------------------------------------------------------------------------

**SUPERVISOR CONFIRMATION**

This research proposal has been submitted to the Department of
Electrical and Electronic

Engineering, Dedan Kimathi University of Technology, with my approval as
the supervisor:

Name: Mr. Ndegwa

Signature: \...\...\...\...\...\...\...\...\...\...\...\...\... Date:
\...\...\...\...\...\...\...\...\...\...\...\.....

# **Table of Contents** {#table-of-contents .TOC-Heading .unnumbered}

[Chapter 1 : Introduction [1](#_Toc202891352)](#_Toc202891352)

[1.1 Background [1](#background)](#background)

[1.2 Problem Statement [1](#problem-statement)](#problem-statement)

[1.3 Justification [2](#justification)](#justification)

[1.4 Objectives [3](#objectives)](#objectives)

[1.4.1 Main Objective [3](#main-objective)](#main-objective)

[1.4.2 Specific Objective [3](#specific-objective)](#specific-objective)

[1.5 Scope of Study [3](#scope-of-study)](#scope-of-study)

[Chapter 2 : Literature Review
[5](#literature-review)](#literature-review)

[2.1 Introduction [5](#introduction-2)](#introduction-2)

[2.2 Advanced Metering Infrastructure (AMI) Overview
[6](#advanced-metering-infrastructure-ami-overview)](#advanced-metering-infrastructure-ami-overview)

[2.3 Background of Prepaid Metering in Kenya
[8](#background-of-prepaid-metering-in-kenya)](#background-of-prepaid-metering-in-kenya)

[2.4 Evolution of Prepaid Metering Systems
[8](#evolution-of-prepaid-metering-systems)](#evolution-of-prepaid-metering-systems)

[2.4.1 Traditional Prepaid Systems
[8](#traditional-prepaid-systems)](#traditional-prepaid-systems)

[2.4.2 GSM-Based Prepaid Meters
[8](#gsm-based-prepaid-meters)](#gsm-based-prepaid-meters)

[2.4.3 Early IoT-Based Prototypes and Smart Meters
[9](#early-iot-based-prototypes-and-smart-meters)](#early-iot-based-prototypes-and-smart-meters)

[2.5 The Role of Mobile Money in Kenya (M-Pesa)
[10](#the-role-of-mobile-money-in-kenya-m-pesa)](#the-role-of-mobile-money-in-kenya-m-pesa)

[Chapter 3 : Methodology [11](#methodology)](#methodology)

[3.1 Design and Prototyping of ESP32-Based Prepaid Meter
[11](#_Toc202891370)](#_Toc202891370)

[3.1.1 Circuit Design and Component Assembly
[11](#circuit-design-and-component-assembly)](#circuit-design-and-component-assembly)

[3.1.2 ESP32 Firmware Development
[12](#esp32-firmware-development-1)](#esp32-firmware-development-1)

[3.2 Development of Cloud Backend and M-Pesa Simulation
[13](#development-of-cloud-backend-and-m-pesa-simulation)](#development-of-cloud-backend-and-m-pesa-simulation)

[3.2.1 Cloud Backend Design [13](#_Toc202891374)](#_Toc202891374)

[3.2.2 M-Pesa Daraja API Simulation
[14](#m-pesa-daraja-api-simulation)](#m-pesa-daraja-api-simulation)

[3.3 System Validation and Testing
[15](#system-validation-and-testing)](#system-validation-and-testing)

[3.3.1 Integration Testing
[15](#integration-testing)](#integration-testing)

[3.3.2 Performance and Security Testing
[16](#performance-and-security-testing)](#performance-and-security-testing)

[Chapter 4 : Expected Outcomes and Contributions
[18](#_Toc202891379)](#_Toc202891379)

[**Contributions to Knowledge and Practice
[18](#contributions-to-knowledge-and-practice)**](#contributions-to-knowledge-and-practice)

[Significance of the Study
[19](#significance-of-the-study)](#significance-of-the-study)

[References [21](#_Toc202891382)](#_Toc202891382)

[APPENDICES [22](#_Toc202891383)](#_Toc202891383)

[Project Timeline (Preliminary) [22](#_Toc202891384)](#_Toc202891384)

**List of Figures**

Figure 1: Understanding Advanced Metering Infrastructure (AMI)
[11](#_Toc202890081)

Figure 2: Communication Workflow in an Advanced Metering Infrastructure
(AMI) System [11](#_Toc202890082)

Figure 3: Functional Block Diagram of the ESP32-Based Control System
[16](#esp32-firmware-development)

Figure 4: Cloud-Based Token Purchase and M-Pesa Simulation Architecture
[18](#_Toc202890084)

Figure 5: Block Diagram of the ESP32-Based Smart Metering System
[21](#_Toc202890085)

**Abstract**

The project titled \"IoT-Enabled Automatic Recharge System for Kenyan
Prepaid Meters Based on Advanced Metering Infrastructure\" aims to
modernize the electricity top-up process by eliminating the need for
manual token entry. In many Kenyan homes, especially in residential
areas, Customer Interface Units (CIUs) are either missing or faulty,
making it difficult for users to recharge their meters. Manual input is
also prone to errors and delays---causing unnecessary downtime and
service interruptions. This system automatically processes simulated
mobile payments and delivers recharge tokens directly to a smart meter,
improving speed, accuracy, and user experience. It ensures uninterrupted
electricity by preventing credit depletion and enables real-time,
digital communication that bypasses SMS-related failures. Additionally,
the solution reduces support and infrastructure costs, enhances customer
satisfaction, and is scalable across Kenya's existing smart grid setup.
Its design aligns with the country's shift toward Advanced Metering
Infrastructure (AMI), making it both highly relevant and nationally
deployable.

# Introduction {#introduction-1}

## Background

Kenya's energy sector has seen significant advancements, particularly
with the adoption of prepaid electricity meters. These meters empower
consumers by allowing them to manage their electricity consumption and
expenditure more effectively. However, the current prepaid metering
system, while beneficial, presents several challenges, especially
concerning the manual recharge process. Consumers often face
inconveniences such as the need for manual token entry, which can be
prone to errors and delays. Furthermore, the reliance on Customer
Interface Units (CIUs) and SMS-based token delivery introduces
vulnerabilities like device unavailability, power outages affecting CIU
functionality, and message delivery delays.

This research proposes the development of an IoT-enabled automatic
recharge system for Kenyan prepaid meters, leveraging Advanced Metering
Infrastructure (AMI). The proposed system aims to address the existing
limitations by providing a seamless, automated, and efficient solution
for electricity top-ups. By integrating with Kenya's dominant mobile
payment platform, M-Pesa, and employing real-time communication
capabilities of AMI, this system will eliminate manual interventions,
reduce service disruptions, and enhance the overall customer experience.
This initiative aligns with the national digital transformation agenda
and the ongoing shift towards smarter grid technologies, promising a
more reliable and user-friendly energy management ecosystem for Kenyan
households.

## Problem Statement

The current prepaid electricity metering system in Kenya, despite its
advantages in promoting energy management, is plagued by several
critical issues that lead to consumer dissatisfaction and operational
inefficiencies. These problems primarily stem from the manual and often
unreliable methods of recharging and token management:

1.  **Dependence on Manual Token Entry and Faulty CIUs**: Many Kenyan
    households, particularly in residential areas, either lack
    functional Customer Interface Units (CIUs) or find them difficult to
    use. This necessitates manual input of long token codes, a process
    that is not only cumbersome but also highly susceptible to human
    error, leading to failed recharges and prolonged power outages.

```{=html}
<!-- -->
```
1.  **Lack of Seamless Integration with Dominant Mobile Payment
    Platforms**: While mobile money platforms like M-Pesa are widely
    used for various transactions in Kenya, existing prepaid meter
    systems, especially older GSM-based ones, do not offer direct,
    automated integration for recharges. This forces users to manually
    initiate payments and then separately enter tokens, creating a
    disjointed and inefficient user experience.

2.  **Vulnerability to Communication Delays and Failures**: The reliance
    on SMS for token delivery introduces significant vulnerabilities.
    Users frequently experience delays in receiving tokens or, in some
    cases, complete message delivery failures. Such communication
    breakdowns directly translate to unexpected power disconnections and
    considerable inconvenience.

3.  **Absence of Advanced Metering Infrastructure (AMI) Utilization**:
    Most existing systems do not fully leverage the capabilities of
    Advanced Metering Infrastructure (AMI). AMI enables two-way
    communication between the utility and the meter, facilitating
    real-time monitoring, remote control, and automated data exchange.
    The lack of AMI integration in current systems limits efficient load
    control, real-time balance monitoring, and proactive service
    management.

4.  **Cost and Complexity Barriers**: Many proposed or existing
    IoT-based prototypes are often complex and expensive to implement,
    hindering their widespread adoption and scalability in a
    cost-sensitive market like Kenya. There is a need for an affordable
    and robust solution that can be easily deployed across a large
    consumer base.

These challenges collectively result in frequent service interruptions,
increased operational costs for utility providers due to support
inquiries and field visits, and a diminished quality of service for
consumers. There is a clear and urgent need for an innovative solution
that automates the recharge process, integrates seamlessly with local
payment ecosystems, utilizes advanced metering technologies, and remains
cost-effective for national deployment.

## Justification 

The project is justified on **technological, economic, social, and
environmental** grounds. It addresses the pressing challenges in Kenya's
current prepaid electricity system by proposing an **IoT-enabled
automatic recharge solution**.

-   **Technologically**, it uses cost-effective components like the
    ESP32 and integrates with a simulated M-Pesa API to demonstrate
    advanced smart metering and automation within an IoT ecosystem.

-   **Economically**, it lowers hidden consumer costs (e.g., time,
    service disruptions) and helps KPLC reduce operational expenses,
    making it a financially attractive and scalable solution.

-   **Socially**, it improves the quality of life by ensuring reliable
    electricity access, especially for households and small businesses,
    and enhances consumer control over energy use.

-   **Environmentally**, it supports energy conservation through
    real-time usage feedback and reduces reliance on paper-based or
    manual processes.

## Objectives

### Main Objective

-   To design, develop, and evaluate an IoT-enabled automatic recharge
    > system for Kenyan prepaid meters based on Advanced Metering
    > Infrastructure (AMI) principles.

### Specific Objective

-   To design and prototype a simulated prepaid meter using the ESP32
    microcontroller, including load control, balance monitoring, and
    display modules.

-   To develop and integrate a cloud-based backend and M-Pesa Daraja API
    simulation for automated recharge processing and communication with
    the ESP32 prototype.

-   To validate the functionality and performance of the integrated
    system through comprehensive testing, including recharge automation,
    load control, and security measures.

## Scope of Study 

This research project focuses on the development of a proof-of-concept
prototype for an IoT-enabled automatic recharge system for Kenyan
prepaid meters. The scope of the project is defined by the following key
aspects:

-   **Meter Simulation**: The project will utilize an ESP32
    microcontroller to simulate the functionality of a prepaid
    electricity meter, including energy consumption, balance decrement,
    and token application. This simulation will allow for comprehensive
    testing of the automatic recharge logic without requiring access to
    actual KPLC meters.

-   **M-Pesa Daraja API Simulation**: To facilitate testing of the
    payment integration, a simulated M-Pesa Daraja API will be
    developed. This simulation will mimic the behavior of the actual
    Daraja API, specifically its C2B (Customer to Business) payment
    functionalities and callback mechanisms, enabling the system to
    receive simulated payment confirmations and trigger recharges.

-   **Automatic Recharge Mechanism**: The core functionality of the
    system will be the automated processing of simulated M-Pesa payments
    and the subsequent application of recharge tokens to the simulated
    meter balance, eliminating the need for manual token entry.

-   **Real-time Balance Monitoring and Load Control**: The system will
    implement real-time monitoring of the simulated meter balance and
    will incorporate a load control mechanism (using a relay) to
    simulate power disconnection upon zero balance and reconnection upon
    successful recharge.

-   **Hardware Prototype**: A physical prototype will be constructed
    using an ESP32 development board and essential peripherals (relay,
    LCD/OLED, LEDs, buzzer) to demonstrate the system's functionality.

-   **Cloud-based Backend**: A cloud platform will be set up to manage
    data flow, process recharge requests, and serve as the central
    communication hub between the simulated meter and the payment
    gateway.

-   **Focus on Technical Feasibility**: The primary focus of this
    research is to demonstrate the technical feasibility and
    effectiveness of the proposed automated recharge solution. While
    scalability and cost-effectiveness will be considered in the design,
    a full-scale commercial deployment and regulatory compliance are
    beyond the immediate scope of this prototype project.

**Exclusions**: This project will *not* involve direct integration with
KPLC's live metering infrastructure or actual M-Pesa transactions. The
system will operate in a simulated environment for testing and
demonstration purposes. Furthermore, detailed analysis of specific
security vulnerabilities beyond standard best practices for IoT
communication will be considered for future work.

# Literature Review

## Introduction {#introduction-2}

The concept of prepaid metering has evolved significantly, moving from
traditional mechanical meters to advanced smart meters with integrated
communication capabilities. Early prepaid systems often relied on
physical tokens or smart cards, which, while offering some control to
consumers, still required manual intervention for recharges \[1\]. The
advent of GSM-based prepaid meters marked a step forward by enabling
remote token delivery via SMS. However, as highlighted in the problem
statement, these systems often lack seamless integration with modern
mobile payment platforms and are susceptible to communication delays and
failures inherent in SMS-based systems.

Recent advancements in the Internet of Things (IoT) have paved the way
for more sophisticated prepaid metering solutions. IoT-enabled smart
meters offer real-time data collection, remote monitoring, and control
capabilities. Several research papers and prototypes have explored the
use of IoT for energy management, including prepaid metering \[6\]. For
instance, studies have demonstrated IoT-based systems that monitor
energy consumption and provide alerts for low balances, with some even
incorporating basic online recharge functionalities. These systems often
utilize microcontrollers like ESP32 or NodeMCU for connectivity and data
transmission over Wi-Fi or other wireless protocols \[4\].

However, a critical gap exists in the comprehensive integration of these
IoT capabilities with local mobile payment ecosystems, particularly in
regions like Kenya where mobile money platforms like M-Pesa are dominant
\[5\]. While some systems propose online payment integration, they often
do not detail direct, automated recharge mechanisms that bypass manual
token entry. Furthermore, many existing IoT solutions, while technically
sound, may not be cost-effective or scalable for widespread deployment
in developing economies. The complexity of integrating various
components and the cost of specialized hardware can be significant
barriers.

Moreover, the full potential of Advanced Metering Infrastructure (AMI)
is often underutilized in existing prepaid meter implementations. AMI
facilitates two-way communication, enabling not just data collection
from the meter but also remote commands to the meter, such as load
control and firmware updates. This two-way communication is crucial for
efficient grid management and enhanced customer service. Many current
systems, even those with IoT capabilities, primarily focus on one-way
data transmission, limiting their ability to provide real-time load
control or proactive service management.

In the Kenyan context, while there are various types of electricity
meters, including some smart meters, the specific challenge of
integrating automatic M-Pesa recharges and fully leveraging AMI for
seamless, manual-input-free operation remains largely unaddressed by
existing commercial solutions. The proposed system aims to bridge these
gaps by developing a cost-effective, ESP32-based solution that not only
integrates seamlessly with M-Pesa for automated recharges but also fully
utilizes AMI principles for real-time monitoring and load control,
offering a truly advanced and user-centric prepaid metering experience.

## Advanced Metering Infrastructure (AMI) Overview

Advanced Metering Infrastructure (AMI) represents a significant
evolution from traditional one-way metering systems to a comprehensive,
two-way communication network between utility providers and their
customers \[2\]. Unlike Automatic Meter Reading (AMR) systems, which
primarily focus on automated data collection, AMI enables a
bidirectional flow of information, facilitating real-time monitoring,
remote control, and enhanced grid management capabilities. The core
components of an AMI system typically include:

1.  **Smart Meters**: These are advanced electronic meters installed at
    customer premises that accurately measure electricity consumption
    (and sometimes generation). Beyond basic measurement, smart meters
    are equipped with communication modules that allow them to send
    consumption data to the utility and receive commands from the
    utility in return. They can store data, detect outages, and in some
    cases, support remote connect/disconnect functionalities.

```{=html}
<!-- -->
```
1.  **Communication Network**: This is the backbone of the AMI system,
    enabling data exchange between smart meters and the utility's
    central system. Various communication technologies can be employed,
    including Power Line Carrier (PLC), cellular (GSM/GPRS/LTE), Wi-Fi,
    Radio Frequency (RF) mesh networks, and fiber optics. The choice of
    technology depends on factors such as geographical coverage, data
    rates, reliability, and cost. For a system like the proposed one,
    cellular communication (e.g., GPRS/LTE via an ESP32 with a SIM
    module) would be highly relevant for widespread deployment in Kenya
    \[3\].

```{=html}
<!-- -->
```
1.  **Data Concentrators/Collectors**: These devices act as
    intermediaries in the communication network, collecting data from a
    group of smart meters and forwarding it to the Meter Data Management
    System (MDMS). They can also receive commands from the MDMS and
    relay them to individual meters. Concentrators are crucial for
    aggregating data, reducing network traffic, and ensuring efficient
    data flow.

```{=html}
<!-- -->
```
1.  **Meter Data Management System (MDMS)**: This is the central
    repository and processing unit for all meter data collected from the
    AMI network. The MDMS validates, cleans, and stores the vast amounts
    of data received from smart meters. It provides analytical
    capabilities, generates reports, and integrates with other utility
    systems such as billing, customer information systems (CIS), and
    outage management systems (OMS). The MDMS is essential for
    transforming raw meter data into actionable insights for utility
    operations and customer service.

```{=html}
<!-- -->
```
1.  **Head-End System (HES)**: The HES is the software application that
    manages the communication with the smart meters and data
    concentrators. It initiates data requests, sends commands to meters
    (e.g., remote connect/disconnect, tariff changes), and handles the
    initial processing of meter data before it is passed to the MDMS.
    The HES acts as the primary interface between the utility's
    operational systems and the AMI network.

```{=html}
<!-- -->
```
1.  **Customer Portal/Interfaces**: AMI systems often include
    customer-facing platforms that allow consumers to access their
    energy consumption data, view billing information, and manage their
    accounts. These interfaces can be web-based portals or mobile
    applications, empowering customers with greater control and
    transparency over their energy usage.

The proposed IoT-enabled automatic recharge system will integrate
seamlessly within this AMI framework. While existing prepaid meters in
Kenya may not fully utilize all AMI capabilities, our system will
simulate and leverage key aspects, particularly the two-way
communication for real-time balance monitoring and remote load control,
and integrate with the payment gateway that would typically interact
with the MDMS. ![Advance Metering
Infrastructure](media/image3.png){width="4.717952755905512in"
height="3.4930555555555554in"}

[]{#_Toc202890081 .anchor}Figure : Understanding Advanced Metering
Infrastructure (AMI)

![](media/image4.png){width="6.239583333333333in"
height="3.046527777777778in"}

##  Background of Prepaid Metering in Kenya

Kenya, like many developing nations, has increasingly adopted prepaid
electricity metering systems as a strategic move to enhance revenue
collection, reduce non-technical losses, and empower consumers with
greater control over their energy consumption. The state-owned utility,
Kenya Power and Lighting Company (KPLC), initiated the rollout of
prepaid meters over a decade ago, gradually replacing the traditional
post-paid billing system \[1\]. This transition was driven by several
factors, including the need to address issues such as accumulating
consumer debts, meter tampering, and the inefficiencies associated with
manual meter reading and billing cycles. Prepaid meters operate on a
'pay-as-you-go' model, requiring consumers to purchase electricity
tokens in advance, which are then loaded onto their meters. This system
has proven effective in improving cash flow for the utility and
fostering energy conservation among consumers, as they become more
conscious of their daily consumption habits.

However, the existing prepaid metering ecosystem in Kenya, while
offering significant advantages, is not without its limitations. The
primary method of recharging involves consumers purchasing tokens
through various channels, predominantly mobile money platforms like
M-Pesa, and then manually entering a 20-digit token code into a Customer
Interface Unit (CIU) connected to their meter. While M-Pesa has
revolutionized financial transactions in Kenya, its integration with the
prepaid metering system often remains a semi-manual process. This manual
intervention introduces several points of failure and inconvenience,
ranging from human error during token entry to delays in token delivery
via SMS, and the operational challenges posed by faulty or missing CIUs
in many households. These issues frequently lead to unexpected power
disconnections, consumer frustration, and increased demand on KPLC's
customer support services.

###  {#section .unnumbered}

##  Evolution of Prepaid Metering Systems

Prepaid metering systems have undergone a significant evolution, driven
by the need for more efficient revenue collection, reduced operational
costs for utilities, and greater control for consumers over their energy
consumption. Understanding this evolution is crucial for contextualizing
the proposed IoT-enabled system.

### Traditional Prepaid Systems

Early prepaid metering systems were often mechanical or
electro-mechanical, relying on physical tokens or smart cards. In these
systems, consumers would purchase a physical token or load credit onto a
smart card, which then had to be physically inserted into or swiped at
the meter to transfer the purchased energy units. While these systems
introduced the concept of pre-payment, they were cumbersome, prone to
physical damage or loss of tokens/cards, and required consumers to
physically visit vending points. They lacked any form of remote
communication, making real-time monitoring or remote management
impossible.

### GSM-Based Prepaid Meters

The introduction of Global System for Mobile Communications (GSM)
technology marked a significant leap forward in prepaid metering.
GSM-based meters allowed for remote communication, primarily for token
delivery and sometimes for basic meter readings. Consumers could
purchase electricity tokens via mobile money platforms or other
electronic payment channels, and a unique token code would be sent to
their mobile phones via SMS. This 20-digit (or similar length) code then
had to be manually entered into a Customer Interface Unit (CIU)
connected to the meter. This eliminated the need for physical tokens and
vending points, offering greater convenience. However, as noted in the
problem statement, these systems still suffer from several drawbacks
\[6\]:

-   **Manual Token Entry**: The requirement for manual input of long
    token codes is a major source of human error, leading to failed
    recharges and frustration.

```{=html}
<!-- -->
```
-   **CIU Dependency**: The reliance on a functional CIU means that if
    the CIU is faulty, missing, or lacks power (e.g., during an outage),
    the consumer cannot recharge their meter.

```{=html}
<!-- -->
```
-   **SMS Reliability Issues**: SMS delivery can be subject to network
    delays, congestion, or even complete failure, leading to delayed or
    lost tokens and unexpected power disconnections.

```{=html}
<!-- -->
```
-   **Limited Bidirectional Communication**: While some GSM meters can
    send basic consumption data, they typically lack the robust two-way
    communication capabilities necessary for real-time load control,
    remote diagnostics, or advanced grid management features.

```{=html}
<!-- -->
```
-   **Lack of Direct Payment Integration**: The payment process is often
    decoupled from the token application process. Consumers pay, receive
    an SMS, and then manually apply the token, rather than having a
    seamless, automated recharge.

### Early IoT-Based Prototypes and Smart Meters

More recently, the integration of IoT technologies has led to the
development of smarter prepaid meters. These systems leverage internet
connectivity (Wi-Fi, GPRS, LoRaWAN, NB-IoT) to enable real-time data
transmission from the meter to a central server. Many academic
prototypes have demonstrated IoT-based prepaid meters capable of:

-   **Remote Monitoring**: Sending consumption data, balance levels, and
    meter status to a cloud platform for remote viewing.

```{=html}
<!-- -->
```
-   **Automated Alerts**: Notifying users or utilities of low balance or
    tampering attempts.

```{=html}
<!-- -->
```
-   **Basic Remote Control**: Some prototypes include rudimentary remote
    connect/disconnect features.

However, a common limitation of many of these early IoT prototypes,
especially in the context of developing economies, is the lack of deep
integration with local payment ecosystems. While they may support online
payments, the automation of the entire recharge process, from payment
confirmation to automatic token application without any manual
intervention, is often not fully realized. Furthermore, the focus is
often on the technical feasibility of IoT connectivity rather than the
practical aspects of cost-effectiveness and scalability for mass
deployment. Many also do not fully embrace the comprehensive
capabilities of AMI, often acting as advanced data loggers rather than
interactive grid components \[6\].

## The Role of Mobile Money in Kenya (M-Pesa)

M-Pesa, launched by Safaricom in 2007, has become an indispensable part
of Kenya's financial landscape. It is a mobile phone-based money
transfer service, payments, and micro-financing service. Its widespread
adoption has transformed how Kenyans conduct financial transactions,
from sending money to family members to paying for goods and services,
and utility bills. The ubiquity of M-Pesa presents a unique opportunity
for integrating payment solutions directly into smart metering systems
\[5\].

Safaricom's Daraja API is the developer platform that allows businesses
and developers to integrate their systems with M-Pesa. It provides
various API endpoints for different transaction types, including
Customer to Business (C2B) payments (e.g., Lipa na M-Pesa, M-Pesa
Express) and Business to Customer (B2C) payments \[8\]. Leveraging the
Daraja API, or a simulation thereof for prototyping, is critical for
developing a system that can seamlessly process M-Pesa payments and
trigger automated recharges. The ability to receive real-time payment
confirmations via the Daraja API's callback mechanisms is fundamental to
achieving the automated, manual-token-entry-free recharge process
envisioned by this project.

Existing prepaid meter systems in Kenya often use M-Pesa as a payment
channel, but the integration is typically at a superficial level where
the payment merely triggers an SMS with a token. The proposed system
aims for a deeper integration, where the payment directly communicates
with the meter management system (or its simulation) to automatically
update the meter's balance, thus eliminating the need for manual token
entry altogether. This level of integration is a key differentiator and
a significant improvement over current practice.

# Methodology

This chapter details the comprehensive methodology employed for the
design, development, and validation of the IoT-enabled automatic
recharge system for Kenyan prepaid meters. The approach will be
iterative, involving design, development, testing, and refinement
phases. The core of the system will revolve around an ESP32
microcontroller, chosen for its integrated Wi-Fi and Bluetooth
capabilities, cost-effectiveness, and suitability for IoT applications.
The methodology will cover system architecture, hardware components,
software design, and integration with simulated M-Pesa Daraja API.

## Design and Prototyping of ESP32-Based Prepaid Meter

### Circuit Design and Component Assembly

The circuit design for the ESP32-based prepaid meter focuses on
integrating essential components that simulate the functionalities of a
real-world prepaid meter. The selection of components is driven by their
availability, cost-effectiveness, and their ability to demonstrate key
features such as load control, visual feedback, and audible alerts. The
primary components include a relay for load control, an OLED display for
user feedback, a buzzer for audible alerts, LEDs for status indication,
and a stable power supply setup.

**Relay Module (1-channel, 5V/10A)** is crucial for simulating the
disconnection and reconnection of the electrical load. This component
acts as a switch, controlled by the ESP32, to cut off power when the
simulated meter balance reaches zero and to restore it upon successful
recharge.

**OLED display** (e.g., 0.96-inch I2C OLED) is chosen for its low power
consumption and clear visual output, providing real-time feedback on the
current meter balance, status messages, and recharge notifications.

**Buzzer** is incorporated to provide audible alerts for critical
events, such as low balance warnings or successful recharge
confirmations, enhancing the user experience by providing immediate
auditory feedback.

**LEDs** are used as visual indicators, with one LED simulating an
active electrical load (turning off when power is disconnected and on
when reconnected) and others potentially indicating Wi-Fi connectivity
or system status.

**Power Supply Module (5V/3.3V)** ensures stable power delivery to the
ESP32 and all connected peripherals, enabling standalone operation of
the prototype.

Initial assembly and testing of the circuit components will be performed
on a **breadboard** using **jumper wires**.

![](media/image5.jpeg){width="3.6625in"
height="3.232638888888889in"}[]{#esp32-firmware-development .anchor}

Figure : Functional Block Diagram of the ESP32-Based Control System

### ESP32 Firmware Development {#esp32-firmware-development-1}

The ESP32 firmware will be developed using the Arduino IDE, leveraging
the ESP-IDF framework for advanced functionalities. Key modules of the
firmware will include:

-   **Wi-Fi Connectivity Module**: Responsible for connecting the ESP32
    to the internet and maintaining a stable connection to the cloud
    platform.

-   **Meter Simulation Logic**: This module will manage the simulated
    meter balance. It will periodically decrement the balance based on a
    configurable consumption rate (e.g., units per second/minute) and
    trigger load control actions when the balance reaches zero. It will
    also handle the reception and application of recharge tokens.

-   **Load Control Module**: Interfacing with the relay module, this
    module will switch the simulated load (LED) on or off based on the
    meter balance status.

-   **Display and Alert Module**: Managing the LCD/OLED display to show
    real-time balance and status messages. It will also control the
    buzzer and load indicator LED for alerts.

-   **Cloud Communication Module**: Securely sending meter data (current
    balance, status) to the cloud platform and receiving commands
    (recharge, remote connect/disconnect) from it. MQTT or HTTPS will be
    considered for secure and efficient communication.

## Development of Cloud Backend and M-Pesa Simulation

This section outlines the development of the cloud backend and M-Pesa
Daraja API simulation, which enable automated payments, meter data
management, and communication with the ESP32-based meter. The cloud
system acts as the core, handling data processing, transactions, and
communication protocols

[]{#_Toc202891374 .anchor}3.2.1 Cloud Backend Design

The cloud backend will be developed using a suitable web framework
(e.g., Python with Flask/Django, Node.js with Express) and deployed on a
cloud provider (e.g., AWS, Google Cloud, Azure). Its design prioritizes
scalability, security, and efficient data handling to support a large
number of simulated meters and transactions. The core functionalities
include a robust REST API, a secure database, and efficient
communication mechanisms.

-   **API Endpoints**: Secure RESTful APIs for the ESP32 to send data
    and receive commands, and for the M-Pesa Daraja API simulation to
    send payment notifications.

-   **Database Management**: Storing meter data, user information,
    transaction logs, and system configurations. A NoSQL database (e.g.,
    MongoDB) or a relational database (e.g., PostgreSQL) will be
    considered based on scalability and data structure requirements.

-   **Recharge Processing Logic**: Upon receiving a payment confirmation
    from the M-Pesa Daraja API simulation, this logic will validate the
    transaction, update the corresponding meter's balance in the
    database, and send a recharge command to the ESP32.

-   **Monitoring and Analytics**: Collecting and visualizing meter data
    for system health monitoring and potential future analytics on
    consumption patterns.

> ![](media/image6.png){width="2.763888888888889in"
> height="4.145833333333333in"}

[]{#_Toc202890084 .anchor}Figure : Cloud-Based Token Purchase and M-Pesa
Simulation Architecture \[8\]

[]{#m-pesa-daraja-api-simulation .anchor}3.2.2 M-Pesa Daraja API
Simulation

To facilitate comprehensive testing of the automated recharge system
without relying on actual financial transactions, a dedicated
application will be developed to simulate the M-Pesa Daraja API. This
simulation will mimic the essential functionalities of the real Daraja
API, focusing on payment initiation and confirmation mechanisms. This
approach allows for a controlled and repeatable testing environment,
ensuring the robustness of the system's payment integration logic.

-   **C2B (Customer to Business) Payments**: Simulating a customer
    initiating a payment to the utility's M-Pesa till number. The
    simulation will generate a callback to the cloud platform, mimicking
    a successful payment notification.

-   **STK Push (Sim Tool Kit Push)**: Simulating the initiation of a
    payment prompt on the customer's M-Pesa enabled phone, and
    subsequently sending a payment confirmation to the cloud platform
    upon successful (simulated) completion.

This simulation will allow for thorough testing of the end-to-end
automatic recharge process without relying on actual M-Pesa transactions
during the development and testing phases. It will mimic the structure
and expected responses of the actual Daraja API to ensure compatibility.

**Payment verification and recharge token generation**

Upon receiving a simulated payment callback from the M-Pesa Daraja API
mock, the cloud backend will initiate the **payment verification and
recharge token generation** process. The payment verification step
involves cross-referencing the received transaction details (e.g.,
amount, sender, transaction ID) with internal records or expected
payment parameters to confirm the legitimacy and correctness of the
payment. This step is crucial for preventing fraudulent recharges and
ensuring that the correct amount has been paid. Once the payment is
verified, the system will proceed to **recharge token generation**.

Although the ESP32-based meter does not use a literal 20-digit token,
the concept of a 'recharge token' here refers to the command or data
packet sent to the ESP32 to update its simulated balance. This command
will contain the amount to be added to the meter's balance and a unique
transaction identifier. The backend will then push this 'recharge token'
(command) to the ESP32 via the established MQTT or HTTPS communication
channel, triggering the balance update on the simulated meter. This
entire process, from payment initiation to balance update, will be
automated, eliminating any manual intervention.

## System Validation and Testing

System validation and testing are crucial phases in the development
cycle, ensuring that the integrated system functions as intended, meets
performance requirements, and adheres to security considerations. This
phase will involve a combination of integration testing, performance
testing, and basic security testing to verify the end-to-end
functionality and robustness of the IoT-enabled automatic recharge
system.

### Integration Testing

**Integration testing** will focus on verifying the seamless
communication and interaction between the various components of the
system. This type of testing is essential to identify and resolve issues
that arise when different modules are combined, ensuring that data flows
correctly and functionalities are triggered as expected across the
entire architecture.

ESP32 ↔ Cloud ↔ M-Pesa simulation communication

This sub-section of integration testing will specifically validate the
communication pathways and data exchange between the **ESP32-based
simulated meter, the Cloud Backend, and the M-Pesa Daraja API
simulation**. Tests will be designed to confirm that:

-   The ESP32 can reliably connect to the cloud backend via Wi-Fi and
    MQTT/HTTPS.

-   Meter data (e.g., balance updates, status) is accurately transmitted
    from the ESP32 to the cloud.

-   The cloud backend correctly receives and processes payment
    notifications from the M-Pesa Daraja API simulation.

-   Recharge commands and other control signals are successfully sent
    from the cloud backend to the ESP32.

-   The M-Pesa Daraja API simulation accurately mimics real-world
    payment scenarios and sends appropriate callbacks to the cloud
    backend.

Test cases will involve simulating various scenarios, such as successful
payments, failed payments, network interruptions, and delayed responses,
to ensure the system's resilience and error-handling capabilities across
all communication links.

**Testing automated recharge flow end-to-end**

This critical aspect of integration testing will involve **testing the
automated recharge flow end-to-end**. The objective is to verify that a
simulated payment initiated through the M-Pesa Daraja API simulation
correctly triggers a balance update on the ESP32-based meter without any
manual intervention. Test scenarios will cover:

-   Initiating a simulated payment via the M-Pesa Daraja API simulation.

-   Verifying that the cloud backend receives and processes the payment
    callback.

-   Confirming that the cloud backend sends the appropriate recharge
    command to the ESP32.

-   Observing that the ESP32 updates its simulated balance and reflects
    the change on the OLED display.

-   Validating that the load control mechanism (relay) correctly
    reconnects power if it was previously disconnected due to zero
    balance.

This end-to-end testing will ensure that the entire chain of events,
from payment initiation to meter recharge, functions autonomously and
reliably, fulfilling the core objective of the project.

### Performance and Security Testing

-   **Token Application Speed** -- Measures how quickly the meter
    updates after payment confirmation, ensuring minimal delay in
    electricity restoration by testing under different network and
    processing conditions.

-   **Load Cut-Off/Reconnect Accuracy** -- Assesses how precisely and
    reliably the meter disconnects power at zero balance and reconnects
    it after recharge, including edge-case testing for low balances and
    quick recharges.

-   **Basic Data Encryption & HTTPS Validation** -- Verifies secure
    communication via TLS/SSL between system components, ensures server
    certificate validation by the ESP32, and checks authentication
    enforcement on API endpoints.

**System Flow Diagram**

![](media/image7.jpeg){width="1.5729166666666667in"
height="5.114583333333333in"}The following diagram illustrates the
overall system flow, from the user's interaction with the M-Pesa API
simulation to the final output from the ESP32-based meter.\

# Expected Outcomes and Contributions {#expected-outcomes-and-contributions-1}

This research project is anticipated to yield several significant
outcomes and make valuable contributions to the field of IoT, smart
metering, and energy management in Kenya. The successful completion of
this project will demonstrate the feasibility and benefits of an
automated prepaid metering system, paving the way for future
advancements and deployments.

Upon the successful completion of this project, the following outcomes
are expected:

1.  **A Functional Prototype of an IoT-Enabled Automatic Recharge
    System**: The primary outcome will be a working hardware and
    software prototype that demonstrates the end-to-end functionality of
    the proposed system. This prototype will include an ESP32-based
    simulated meter, a cloud-based backend, and a simulated M-Pesa
    Daraja API integration, all communicating seamlessly to facilitate
    automated recharges.

```{=html}
<!-- -->
```
1.  **Validated System Architecture and Design**: The project will
    result in a thoroughly tested and validated system architecture that
    can serve as a blueprint for future development and
    commercialization. This includes detailed designs for hardware
    integration, firmware logic, cloud infrastructure, and API
    interactions.

```{=html}
<!-- -->
```
1.  **Proof of Concept for Seamless M-Pesa Integration**: The project
    will provide a concrete proof of concept for integrating M-Pesa
    payments directly with a smart metering system to trigger automated
    recharges, eliminating the need for manual token entry. This will
    demonstrate a significant improvement over current semi-manual
    process.

```{=html}
<!-- -->
```
1.  **Demonstration of Real-time Balance Monitoring and Load Control**:
    The prototype will effectively showcase the ability to monitor meter
    balance in real-time and perform remote load control (power
    disconnection/reconnection) based on predefined thresholds,
    leveraging AMI principles.

```{=html}
<!-- -->
```
1.  **Comprehensive Documentation**: A detailed research proposal and a
    final project report will be produced, outlining the problem,
    literature review, methodology, design, implementation details,
    testing results, and conclusions. This documentation will be a
    valuable resource for future research and development in this
    domain.

### **Contributions to Knowledge and Practice** {#contributions-to-knowledge-and-practice .unnumbered}

This research is expected to make the following contributions:

1.  **Addressing a Critical Gap in Kenyan Prepaid Metering**: By
    focusing on the specific challenges faced by Kenyan consumers
    (manual token entry, CIU issues, M-Pesa integration), this project
    directly addresses a significant gap in the existing prepaid
    metering landscape. It offers a practical solution to enhance user
    experience and operational efficiency.

```{=html}
<!-- -->
```
1.  **Advancing IoT Applications in Energy Management**: The project
    will contribute to the growing body of knowledge on applying IoT
    technologies for smart energy management, particularly in the
    context of developing countries. It will showcase how readily
    available and cost-effective hardware (ESP32) can be leveraged for
    complex smart grid functionalities.

```{=html}
<!-- -->
```
1.  **Demonstrating Practical AMI Implementation**: While a prototype,
    the system will practically demonstrate key principles of Advanced
    Metering Infrastructure, such as two-way communication and remote
    control, in a tangible and accessible manner. This can serve as an
    educational tool and a stepping stone for broader AMI adoption.

```{=html}
<!-- -->
```
1.  **Promoting Digital Transformation in the Energy Sector**: By
    proposing a fully automated and digitally integrated recharge
    system, the project supports the broader agenda of digital
    transformation within Kenya's energy sector. It highlights how
    technology can improve service delivery, reduce operational costs,
    and enhance customer satisfaction.

```{=html}
<!-- -->
```
1.  **Foundation for Future Research and Development**: The developed
    prototype and comprehensive documentation will serve as a strong
    foundation for future research. This could include exploring
    advanced features like predictive analytics for consumption,
    integration with renewable energy sources, enhanced security
    measures, and scaling the solution for commercial deployment.

```{=html}
<!-- -->
```
1.  **Cost-Effective Solution Design**: The emphasis on using affordable
    components like the ESP32 demonstrates a viable path towards
    developing cost-effective smart metering solutions that are suitable
    for mass deployment in emerging markets, where budget constraints
    are often a significant factor.

## Significance of the Study {#significance-of-the-study .unnumbered}

This research holds significant importance for various stakeholders
within the Kenyan energy sector and beyond. Its findings and the
developed prototype are poised to contribute meaningfully to both
academic understanding and practical application.

i.  For Consumers

For the end-users of electricity, the proposed system offers a
substantial improvement in convenience and reliability. The elimination
of manual token entry means an end to the frustration of incorrect
inputs and the inconvenience of searching for a functional CIU.
Automated recharges will significantly reduce instances of unexpected
power disconnections due to forgotten top-ups or delayed token delivery,
ensuring a more consistent and reliable electricity supply. This leads
to an improved overall customer experience, reducing stress and
enhancing the quality of life, particularly in households where
electricity is critical for daily activities, education, and small
businesses.

ii. For Kenya Power and Lighting Company (KPLC)

KPLC stands to benefit significantly from the adoption of such a system.
Firstly, it will lead to **enhanced operational efficiency**. By
automating the recharge process, the need for customer support related
to token entry errors, CIU issues, and SMS delays will drastically
decrease, freeing up resources for other critical operations. Secondly,
the system will contribute to **improved revenue assurance**. Automated
and seamless recharges can lead to more consistent and timely payments,
reducing instances of credit depletion and subsequent non-payment.
Thirdly, the integration with AMI principles will provide KPLC with
**more granular and real-time data** on consumption patterns, enabling
better load forecasting, demand-side management, and more efficient grid
planning. This can also aid in quicker identification and resolution of
outages and potentially reduce non-technical losses by providing better
oversight of meter status.

iii. For the Energy Sector and National Development

At a broader level, this research contributes to the modernization of
Kenya's energy infrastructure. By demonstrating a practical and
cost-effective application of IoT and AMI, it supports the national
agenda for digital transformation and the development of smart cities. A
more efficient and reliable electricity supply is fundamental to
economic growth, supporting industries, businesses, and households. The
project also serves as a model for how local technological innovation,
leveraging prevalent mobile payment systems, can address unique
challenges in developing economies. It can inspire further research and
development in smart grid technologies tailored to the African context,
fostering local expertise and reducing reliance on imported solutions.

iv. For Academia and Future Research

Academically, this study provides a valuable case study on the practical
implementation of IoT and AMI in a real-world utility context. It
contributes to the body of knowledge by detailing a specific solution
that integrates hardware, software, and payment gateway simulations to
solve a pertinent problem. The methodology and findings can serve as a
reference for students and researchers interested in smart metering, IoT
applications, embedded systems, and mobile payment integration.
Furthermore, the identified limitations and future work suggestions will
open avenues for subsequent research, encouraging continuous innovation
in the field.

###  {#section-1 .unnumbered}

# References {#references-1 .unnumbered}

  -------------------------------------------------------------------------------
  \[1\]   F. M. Mwaura, \" Adopting electricity prepayment billing system to
          reduce non-technical energy losses in Uganda: Lessons from Rwanda,\"
          *Energy Policy,* vol. 44, pp. 331-336, 2012.
  ------- -----------------------------------------------------------------------
  \[2\]   A. Ikpehai, B. Adebisi and K. M. Rabie, \"Broadband PLC for Clustered
          Advanced Metering Infrastructure(AMI) Architecture,\" *Energies,* vol.
          9, no. 7, p. Article 569, 2016.

  \[3\]   V. C. Gungor, D. Sahin, T. Kocak, S. Ergüt, C. Buccella, C. Cecati and
          G. P. Hancke, \"A Survey on Smart Grid Potential Applications and
          Communication Requirements,\" *IEEE Transactions on Industrial
          Informatics,* vol. 9, no. 1, pp. 28-42, 2013.

  \[4\]   P. Raj and A. Raman, The Internet of Things: Enabling Technologies,
          Platforms, and Use Cases, Boca Raton,Florida, USA: CRC Press, 2020.

  \[5\]   W. Jack and T. Suri, \"Mobile money: The economics of M-Pesa,\"
          National Bureau of Economic Research(Working Paper No 16721),
          Massachusetts, 2011.

  \[6\]   S. S. S. R. Depuru, L. Wang and V. Devabhaktuni, \"Smart meters for
          power grid: Challenges, issues, advantages and status,\" *Renewable &
          Sustainable Energy Reviews,* vol. 15, no. 6, pp. 2736- 2742, 2011.

  \[7\]   C. O. Munda and A. Oduor, \"Smart Grid Initiatives in Kenya: A
          Review,\" *International Journal of Engineering Research & Technology
          (IJERT),* vol. 6, no. 12, pp. 1-4, 2017.

  \[8\]   S. PLC, \"Daraja API Documentation,\" 2023. \[Online\]. Available:
          https://developer.safaricom.co.ke/daraja/apis/post/safaricom-sandbox.
  -------------------------------------------------------------------------------
