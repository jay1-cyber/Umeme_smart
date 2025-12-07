**Group Members**

**NAME REG NO**

1.  Moses Maingi E021-01-1271/2021

2.  Kelvin Limo E021-01-1302/2021

3.  Daniel Kimoi E021-01-1318/2021

**Project Proposal: IoT-Enabled Automatic Recharge System for Kenyan
Prepaid Meters Based on Advanced Metering Infrastructure**

**Concept Note**

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

**Key Justifications**

-   **Shortage of CIUs in Residential Areas**: Many homes lack a
    Customer Interface Unit (CIU), making it difficult for users to
    manually load tokens. This system removes the need for a CIU by
    delivering tokens automatically.

-   **Reduce Downtime Due to Input Error**: Manual token entry often
    leads to errors, which delay recharging. Automation ensures tokens
    are applied correctly without user input.

-   **Reduce Downtime Due to Message Delays**: Users may experience SMS
    delays or failed deliveries. This system uses direct digital
    delivery, ensuring faster and more reliable token transmission.

-   **Improved Customer Experience**: Users no longer need to handle
    codes or worry about balance running out. They enjoy uninterrupted
    power and a smoother, stress-free process.

-   **Eliminates Service Disruption**: By automatically recharging the
    meter, the system prevents unexpected power cuts due to low credit
    or forgotten recharges.

-   **Cuts Costs**: Reduces reliance on support staff, physical CIUs,
    and in-person service. It also minimizes errors that lead to
    customer complaints or field visits.

-   **Highly Scalable and Industry-Relevant**: The system can be
    deployed widely with minimal changes. It fits into existing smart
    grid and AMI infrastructure, making it suitable for national
    rollout.

-   **Power Loss Disables CIU Use**: When electricity runs out, CIUs
    become unusable because they require power to function---forcing
    users to visit neighbors\' homes to recharge. This system allows
    remote recharging even when local power is off.

**\
**

**Project Budget**

  ---------------------------------------------------------------------------------
  **Item**            **Purpose**                 **Qty**   **Unit Cost **Total
                                                            (KES)**     (KES)**
  ------------------- --------------------------- --------- ----------- -----------
  ESP32 Dev Board     Main controller: payment    1         1,600       1,600
                      logic + meter simulation                          

  Relay Module        Simulate power              1         250         250
  (1-channel) 5V/10A  disconnection (load                               
                      control)                                          

  16x2 I2C LCD        Display balance             1         350         350
  Display or OLED                                                       

  LED + Resistors     Simulate powered device     1         30          30
  (load indicator)    (e.g., bulb)                                      

  Buzzer              Alert on low balance or     1         50          50
                      recharge success                                  

  Breadboard + Jumper Circuit assembly            1         700         700
  Wires                                                                 

  Enclosure Box       Final presentation casing   1         500         500

  USB Cable           Programming + power         1         200         200

  Power Supply Module Standalone power supply     1         300         300
  (5V/3.3V)                                                             

                                                                        

                                                            **TOTAL**   **3,980**
  ---------------------------------------------------------------------------------
