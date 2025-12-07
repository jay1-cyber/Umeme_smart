### **DEDAN KIMATHI UNIVERSITY OF TECHNOLOGY**

**DEPARTMENT OF ELECTRICAL & ELECTRONIC ENGINEERING**


**FINAL YEAR PROJECT REPORT**


**PROJECT TITLE:**


**MONITORING AND CONTROL SYSTEM OF A POWER TRANSMISSION**


**NETWORK USING STATCOM**

|Registration No<br>.|Name|Signature|
|---|---|---|
|E021-01-0726/2019|Delphine Chepngeno||
|E021-01-0725/2019|Dennis Kimutai||
|E021-01-0724/2019|Langat Kipchumba||



**SUPERVISOR: MS. SUSAN KISENGEU**


A project submitted to the Department of Electrical and Electronic Engineering in partial


fulfillment of the Award of Degree of Bachelor of Science in Electrical and Electronics


Engineering.


**NOVEMBER 2023**


# **DECLARATION.**

This project is our original work, except where due acknowledgement is made in the text, and to


the best of our knowledge has not been previously submitted to Dedan Kimathi University of


Technology or any other institution for award of degree or diploma.


NAME: DELPHINE CHEPNGENO REG NO: E021-01-0726/2019


SIGNATURE: ……………………………. DATE: …………………………………….


NAME: DENNIS KIMUTAI REG NO: E021-01-0725/2019


SIGNATURE: ……………………………. DATE: …………………………………….


NAME: LANGAT KIPCHUMBA REG NO: E021-01-0724/2019


SIGNATURE: ……………………………. DATE: …………………………………….


**SUPERVISOR’S CONFIRMATION**


This project has been submitted to the department of Electrical and Electronics Engineering,


Dedan Kimathi University of Technology with my approval as the university supervisor.


**NAME** : MS. SUSAN KISENGEU


**SIGNATURE** : ……………………………. **DATE** : ……………………………………


ii


# **ACKNOWLEDGEMENT**

We greatly appreciate our supervisor, Ms. Susan Kisengeu for her continued guidance and helpful


insights. Her commitment to the success of this project is our greatest motivation. We are also


grateful to the Electrical and Electronic Engineering department, DeKUT, for providing us with


enough resources to do our final year project.


iii


## Contents

DECLARATION. ....................................................................................................................... ii


ACKNOWLEDGEMENT ......................................................................................................... iii


ABSTRACT ............................................................................................................................... ix


CHAPTER ONE: INTRODUCTION ......................................................................................... 1


1.1 BACKGROUND STUDY ............................................................................................... 1


1.2 PROBLEM STATEMENT .............................................................................................. 2


1.3 JUSTIFICATION ............................................................................................................. 2


1.4 OBJECTIVES .................................................................................................................. 3


1.4.1 MAIN OBJECTIVE .................................................................................................. 3


1.4.2 SPECIFIC OBJECTIVES ......................................................................................... 3


1.5 SCOPE OF STUDY ......................................................................................................... 3


CHAPTER TWO: LITERATURE REVIEW ............................................................................. 4


2.1  INTRODUCTION ............................................................................................................... 4


2.2  POWER TRANSMISSION NETWORKS ......................................................................... 4


2.3  REACTIVE POWER COMPENSATION .......................................................................... 5


2.4  STATCOM WORKING PRINCIPLE ................................................................................ 7


2.5  PREVIOUS WORKS .......................................................................................................... 9


CHAPTER THREE: METHODOLOGY .................................................................................. 12


3.1 SYSTEM MODELING ....................................................................................................... 12


3.2 ANALYZING THE PERFORMANCE OF THE MODIFIED IEEE BUS SYSTEM ....... 15


3.3 VALIDATING THE PERFORMANCE OF THE MODIFIED MODEL .......................... 16


3.3.1 FLOWCHART ............................................................................................................. 17


3.3.2 STATCOM OPERATION ........................................................................................... 18


3.3.3 SYSTEM CONSTRAINTS .......................................................................................... 20


CHAPTER FOUR: RESULTS AND DISCUSSION ............................................................... 22


4.1 INTEGRATION OF A STATCOM IN AN IEEE 9-BUS SYSTEM ................................. 23


4.2 ANALYSIS OF THE PERFORMANCE OF THE MODIFIED IEEE 9-BUS

TRANSMISSION SYSTEM WITH AND WITHOUT FAULTS ............................................ 23


4.3 VALIDATING THE PERFORMANCE OF THE MODEL ON A FAULTED IEEE 9-BUS

POWER TRANSMISSION SYSTEM ..................................................................................... 25


CHAPTER FIVE: CONCLUSION AND RECOMMENDATION .......................................... 28


iv


5.1 CONCLUSION ................................................................................................................... 28


5.2 RECOMMENDATION ...................................................................................................... 28


REFERENCES .......................................................................................................................... 29


v


**LIST OF ABBREVIATIONS**


STATCOM         Static Compensator


DVR               Dynamic Voltage Restorer


FACTS             Flexible Alternating Current Transmission System


PCC               Point of Common Coupling


ZSI                Impedance Source Inverter


VSC               Voltage Source Converter


MPPT              Minimum Power Point Tracking


MMC              Modular Multilevel Converters


UC                Ultra Capacitor


VSI                Voltage Source Inverter


ANN               Artificial Neural Network


vi


**LIST OF FIGURES**


Figure 2. 1: Single Line diagram of a typical Power System ......................................................... 5
Figure 2. 2: The power Triangle ..................................................................................................... 6
Figure 2. 3: STATCOM-UC System ............................................................................................ 10
Figure 2. 4: STATCOM with VSI ................................................................................................ 10
Figure 3. 1: STATCOM System Block Diagram .......................................................................... 12
Figure 3. 2: Complete IEEE-9 bus system. ................................................................................... 15
Figure 3. 3: Data Acquisition System ........................................................................................... 16
Figure 3. 4: Components of Data Acquisition System ................................................................. 16
Figure 3. 5: System Flowchart ...................................................................................................... 17
Figure 3. 6: STATCOM Transmission Line Structure ................................................................. 18
Figure 3. 7: Schematic Diagram of a Transmission Line including STATCOM ......................... 19
Figure 4. 1: IEEE 9-Bus Model with an integrated STATCOM .................................................. 23
Figure 4. 2: Normally operating system ....................................................................................... 24
Figure 4. 3: System with line-ground fault ................................................................................... 24
Figure 4. 4:System with line-line fault ......................................................................................... 25
Figure 4. 5: System with variable load ......................................................................................... 25
Figure 4. 6: STATCOM voltage and current correction ............................................................... 26
Figure 4. 7: STATCOM voltage correction .................................................................................. 26
Figure 4. 8: STATCOM current correction .................................................................................. 26
Figure 4. 9: STATCOM reference current comparison ................................................................ 27
Figure 4. 10: STATCOM PQ correction ....................................................................................... 27


vii


**LIST OF TABLES**


Table 3.1: System Parameters ....................................................................................................... 13
Table 3.2: IEEE 9-Bus Voltage and Data ..................................................................................... 14
Table 3.3: IEEE 9-Bus Generator Data ......................................................................................... 14


viii


# **ABSTRACT**

Power transmission networks in the world are continuously being monitored to ensure efficient


- peration and control. In recent times, researchers have done distributed and decentralized voltage


control of smart transmission networks and innovative models for transmission network planning,


- peration, reconfiguration, and energy resources management in the smart grid paradigm. Industry


specialists propose the use of reactive power compensation to improve energy efficiency by


reducing the power consumption. Therefore, the cost is reduced, enabling optimum use of


installations by preventing them from being oversized, and more generally improving the quality


- f energy systems. This project aims to present an efficient and effective way of mitigating the


challenges associated with power quality. The project entails the design and simulation of


impedance source inverter (ZSI) based Static Compensator (STATCOM). The system will analyze


the power quality challenges, such as transients in power systems, harmonics and voltage sags


with the application of STATCOM and the Dynamic Voltage Restorer (DVR). The model aims at


maintaining the voltage stability of the system by either absorbing or generating reactive power.


The STATCOM will be shunt connected to the system at the point of common coupling (PCC).


The test model will be an IEEE 9-bus system owing to its relatively small size, which makes it


more manageable for analysis and research purposes. The validation of the same will be achieved


by use of a MATLAB Simulink model. Hence proving how a STATCOM compensates reactive


power.


ix


# **CHAPTER ONE: INTRODUCTION**

### **1.1  BACKGROUND STUDY**

Electrical power is generated by different types of power plants located in different areas. The


power plants may be geothermal, solar, wind and hydro generated. The electrical power generated


is then injected into the grid after being stepped up. The power is then transmitted to distribution


centers then to the end consumers and various load centers through various distribution systems.


The ultimate goal in power generation, transmission and distribution is the development of a well

coordinated system between the power grids and the distribution systems [1].


Generally, it is not feasible to design a power system network that prevents the occurrence of


faults. Therefore, it is important to reduce the risk of voltage collapse and blackout while avoiding


deterioration of the power quality due to its multilevel configuration. To realize maximization of


returns in electrical power transmission and ensuring guaranteed customer satisfaction, the power


systems must operate in a safe manner [2]. Variation in power consumption and demand mainly


affects the power generation, transmission and distribution. The electrical power demands by the


loads make it necessary to develop a framework for control and monitoring of the power


transmission network to enhance the quality of power. It is, however, difficult to come up with


informed prediction and the control of the total power generated in the grid [2]. In practice, there


has been incorporation of different devices to enhance the compensation on the challenges that are


related to the varying load demands. These devices include; the capacitor bank, voltage regulators


and on-load tap changers. The incorporation of these devices in a power transmission system aims


at meeting the objective of power loss reduction.


Power transmission systems suffer from the power quality problems that are related to both voltage


and current being distributed. These challenges include voltage disturbances, poor power factor


and distorted current [3]. Power quality in power transmission refers to maintaining of sinusoidal


waveform of the bus voltage at the rated voltage frequency. STATCOM [4] is a power electronic


converter-based device that used to protect transmission networks from voltage imbalances. This


device is connected in shunt to the power transmission network to enhance the monitoring and


control aspect of the network. With a view of enhancing power quality in a transmission network,


a practical model is considered for analyzing of power quality issues such as voltage sags,


1


harmonics and transients and with STATCOM and combine application of DVR and STATCOM


compensation devices and are presented by MATLAB Simulink.

### **1.2  PROBLEM STATEMENT**


The efficiency and reliable supply of electric energy in the transmission network is of great


importance considering the fact that electricity has been incorporated in most of the daily human


activities. Monitoring the power transmission system is a big concern in ensuring an interruption

free power supply and that those human activities relying on the electric power are uninterrupted.


Power quality is guaranteed by developing of frameworks to mitigate the power transmission


challenges that include the transient in power system, over voltages and under voltages, harmonics


and poor power factor. The existing ways of ensuring power quality in a transmission network


have their own shortcomings. For instance, the use of shunt capacitors and adjustable speed motors


increases the harmonic level of the power system. It is therefore important to develop an effective


monitoring and control system for power transmission networks hence preventing short circuit


faults, keeping the tract of available generation and enable effective and efficient load management


[2]. The system is cost effective and more efficient as compared to the other methods of enhancing


power quality.

### **1.3  JUSTIFICATION**


Reliable transmission of electrical power requires continuous monitoring of the transmission


network by enhancing real time analysis of the system parameters such as voltage, current and


power factor. There is a need to track the variation in these system parameters in order to control


system operation and stability. To satisfy this need, a monitoring and control system has to been


developed for electrical power transmission networks to improve its efficiency and mitigate the


challenges related to faults. This system will contribute to the reliability and efficiency in power


transmission and fault correction. Coming up with a system that guarantees real time monitoring


and control in electrical transmission network is important as it improves power quality and


2


enhances the reliability of power system for those industrial application that require continuous


power supply.

### **1.4  OBJECTIVES**


**1.4.1** **MAIN OBJECTIVE**


To monitor and control a power transmission network using a Static Compensator (STATCOM).


**1.4.2** **SPECIFIC OBJECTIVES**


i. To size and integrate a conventional STATCOM in an IEEE 9 bus test system.


ii. To analyze the performance of the modified IEEE 9 bus power transmission system with


and without faults.


iii. To validate the performance of the model on a faulted IEEE 9 bus power transmission


system.

### **1.5 SCOPE OF STUDY**


This project includes the design of a monitoring and control scheme for an IEEE test system. It


provides monitoring services on the line to mitigate the effects of faults including over-voltages,


under-voltages, PQ problems, harmonics, load balancing and power-voltage regulation problems.


The system also seeks to provide control measures to counter the identified problems. This


monitoring and control scheme is developed for IEEE 9 bus three-phase transmission network.


The operation of the system is analyzed under normal condition and compared with the operation


- f the same system under fault. The challenges related to the fault mitigated by applying the


STATCOM control system.


3


# **CHAPTER TWO: LITERATURE REVIEW**

### **2.1  INTRODUCTION**

The continuous development of technology and growth of the industrial sector has led to increase


in the demand for electrical power. This means that more power has to be generated and hence


transmitted. With the move to meet the demands of the customers, electrical utility companies


need to ensure the continuity of power generation and supply to the customers. This has called for


development of integrated systems that controls and monitor the performance of the electrical


power transmission systems. This has been made possible by the advancement of power electronic


devices in the recent years. Because of the development and advancement, mitigation of the power


transmission challenges has been made easy and thus improving the power quality supplied to the


consumers by the utility companies [5]. Power losses in the electrical power distribution systems


are also reduced. STATCOM is an efficient member of the distributed Flexible AC transmission


systems where it can regulate the bus voltages by injection or absorption the reactive power.


STATCOM is a voltage source converter (VSC) tied to DC bus which is joined by a coupling


transformer and an along with a harmonic filter [6].

### **2.2  POWER TRANSMISSION NETWORKS**


Power transmission is the process by which large amounts of electricity produced at power plants


(such as hydro, geothermal, thermal and wind), is transported over long distances for eventual use


by consumers [2]. Due to the large amount of power involved, and the properties of electricity,


transmission normally takes place at high voltage (132-kilovolt or above) to reduce losses that


- ccur over long distances.


Power is usually transmitted to a substation near a populated area. At the substation, the high


voltage electricity is converted to lower voltages suitable for consumer use, and then transmitted


to end users through relatively low-voltage electricity distribution lines that are owned and


- perated by the national electricity utility.


4


#### **_Secondary Transmission System_** **_Distribution Sub-Station_** **_Primary Distribution_** **_System_** **_Main Laterals_** **_Distribution Transformer_** **_Service Main_**

_Figure 2. 1: Single Line diagram of a typical Power System_


IEEE has developed several test systems for transmission networks. These test systems are used


to verify models and methodologies regarding reconfiguration and operation of transmission


networks.

### **2.3  REACTIVE POWER COMPENSATION**


Electrical power is defined as the rate at which electrical energy is transformed by an electric


circuit. For a simple DC circuit, its defined as the product of voltage times current.


Mathematically: V = IR.


5


For AC circuits, we have three types of powers:


Real or Active Power: This is the actual power that is supplied from load to the source. Its unit is


watts


Reactive Power: This is the power that continuously bounces back and forth between source and


load. Reactive power is measured in volt-amperes reactive, 1var = 1V * 1A


Apparent power: this is the product of the r.m.s voltage and the r.m.s current. It is denoted


by (S) and measured in units of Volt-amp (VA).


The power triangle below shows the relationship between the three powers. Where the power


factor is the ratio between active power and reactive power.


_Figure 2. 2: The power Triangle_


The frequency of a system is dependent on active power balance between generation and demand.


A change in active power demand at one point is reflected throughout the system by a change in


frequency. Reactive power on the other hand is required to maintain the voltage to deliver active


power through transmission lines, when there is not enough reactive power, the voltage sags down


and it is not possible to push the power demanded by loads through the lines [7].


To attain voltage control, reactive power compensation is necessary. This is the process of adding


- r injecting positive and/or negative VAr’s to a power system network. Some of the components


used to achieve this include three phase capacitors, capacity duty contactors, power factor


controlers, and three-phase harmonic filters.


6


The major reasons for the need to do reactive power compensation in AC transmission systems


are:


i. The voltage regulation.


ii. Increased system stability.


iii. Better utilization of machines connected to the system.


iv. Reducing losses associated with the system.


v. To prevent voltage collapse as well as voltage sag.


The STATCOM is mainly used to compensate the power quality problems [4]; i.e volatage dips,


current quality, harmonic distortion and unbalanced load problems: current reactive component,


unbalanced and neutral current at the point of common coupling (PCC).

### **2.4  STATCOM WORKING PRINCIPLE**


STATCOM is a converter based shunt connected device used to regulate the bus voltage by either


absorbing or generating reactive power. It incorporates the following parts;


  - DC capacitor


  - Voltage Source Inverter.


  - Coupling Transformer


  - Reactor


It operates by compensating either bus voltage or line current. Accordingly, it works on two modes;


a) Voltage mode operation


In this mode, the bus voltage connected to device is made sinusoidal irrespective of the harmonics


in the supply voltage.


b) Current mode operation


Irrespective of the load current distortions, STATOM forces the source current connected to it to


be a balanced sinusoid.


7


The working principle of a STATCOM in voltage sag mitigation is to regulate the bus voltage by


generating or absorbing the reactive power. Thus, the STATCOM operates as an inductor or as a


capacitor depending on the magnitude of the connected bus voltage [4].


**CONTROL AND COMPENSATION STRATEGIES**


a) Voltage control strategies


A voltage control strategy that uses multiple STATCOMs is applied to a low voltage network in


- rder to anticipate voltage support. The multiple STATCOMs share the required reactive power.


For low voltage distribution grids, a voltage regulator using STATCOM is used [4]. The low pass


filter (second order) is used to connect the STATCOM. Its control structure provides active


damping with the help of the two dc bus loops and three output voltage loops. The STATCOM is


forced to operate with minimum power due to introduction of new idea to bring no compensation


in certain conditions or in other words Minimum Power Point Tracking (MPPT). These three


- utput voltage loop reduces apparent power processed by converter to nearly about 32 % and with


the use of light load (95 %). A three phase STATCOM which is based on modular multilevel


converters (MMC), uses voltage control strategy.


b) Current Control Strategies


STATCOM compensates load functions. In order to regulate time varying active and reactive


power control, an extra current control loop system is used under the fluctuations of load.


Synchronous detection method is used to analyze the shunt compensator characteristics.


c)  Inverter Technologies for STATCOM


High voltage and low voltage transmission system using single dc capacitor are not capable of


providing full compensation with three phase and three legs VSI. This drawback is overcome by


using neutrally clamped DC capacitor topology. It still suffers from unbalanced capacitor that


brings the requirement of an extra circuit for balancing and affects the overall cost of compensator


cost. An alternative solution to the problem is using three single phase inverter which are


independent along with single DC capacitor.


d) Voltage and current control strategies


8


Compensation of parameters like elimination of harmonics, correction of power factor, and


regulation of voltage, is achieved by using adaptive theory for hardware implementation of three


phase STATCOM. Digital signal processor is used to compare performance analysis of


STATCOM model. The STATCOM with both PCC and DC bus voltages are regulated while using


unbalanced loads [4].


e)  Artificial Neural Networks


Power factor and reduction in line current harmonics of the network is reduced using a hybrid


controller. To push the source current into a sinusoidal one and tries to be in phase with line voltage


the controller is used in the network. It provides two controls estimation of weighting factor of


three phase load current and hysteresis switching algorithm for driving the VSC of STATCOM.


The compensator is optimized using an ANN with suitable learning rate [6].

### **2.5  PREVIOUS WORKS**


There are approaches that have been used to mitigate power quality challenges in power


transmission networks. Various solutions, proposing the application of FACTS systems have been


presented in different papers.


In [8], the power system stability and oscillation monitoring and control is achieved by improving


the response of the STATCOM by including a relatively fast-acting energy storage systems in the


control systems. This project proposes the use of ultra capacitor besides the STATCOM in the case


- f three phase fault occurring in power transmission systems. The system is modeled, describing


the terminal behavior of Electric double layer capacitor units over a range of frequency, from DC


to several thousands of Hertz. It consist of voltage source inverter (VSI), coupling step up


transformer, line filter, DC bus capacitor, bulk boost converter and the bank of Ultra-capacitor.


STATCOM coupled with an Ultra capacitor acts as a synchronous three phase machine which can


generate AC voltage with controllable amplitude and phase angle at its terminal. This system’s


response is almost instantaneous since it has no inertia. STATCOM injects reactive power to the


transmission grid in order to control the frequency and voltage of the system to minimize


- scillations and stability characteristics after the occurrence of faults. It is, however, presented in


9


[9] that there are limitations of using Ultra capacitors in controlling the power systems parameters.


Based on the experimental results and various derivations, it is revealed that there are limitations


- n the use of Ultra capacitor (UC) in power systems. The upper limit of SC voltage imposes certain


limits on power and energy capabilities of the power systems. It concluded that some of the


performance figures used in datasheets are strictly theoretical and cannot be achieved in practice.


_Figure 2. 3: STATCOM-UC System_


According to [10], power quality improvement can be enhanced by VSI based STATCOM. The


system is developed as follows,


_Figure 2. 4: STATCOM with VSI_


10


The comparison of the system operation with that of the Z-source inverter based control system


and the analysis of the power systems under the control of the same checked for both power factor


and the operation on load balancing. STATCOM can be used in the power transmission systems


with inductive loads to improve power factor. From the results of the operation of VSI based


STATCOM control, it is noted that the power factor of the system is improved from about 0.9506


for a system without STATCOM to about 0.9567 for a system with VSI based


STATCOM control system. It is therefore important to note that VSI based STATCOM enhances


the improvement of the power factor in power transmission systems. However, the improvement


- f power factor for the VSI based STATCOM controlled power system is lower as compares to


that of Z-Source Inverter (ZSI) STATCOM.


11


# **CHAPTER THREE: METHODOLOGY**

This chapter gives a vivid discussion on the actual steps that we will follow to help in realization


- f the project. The presentation of the steps followed to come up with the designed system to


monitor and control power transmission networks and mitigate the challenges associated with the


power transmission networks. The ZSI based STATCOM system that incorporates the DVR will


be used to enhance an efficient monitoring and control process on power transmission systems.


With the simulation of the system done on MATLAB SIMULINK and various tests cases


conducted on IEEE nine-bus system in order to appreciate its importance on the power


transmission networks and the operation of the electric power circuits that incorporate the system


developed. Among the parameters to be monitored by the system are voltage stability in power


systems, load balancing and frequency waveforms of the system.

### **3.1 SYSTEM MODELING**









_Figure 3. 1:STATCOM System Block Diagram_


The system is composed of a three phase source that supplies electrical power. The electrical power


supplied from the source is transmitted to the load end through the transmission lines. The


12


transmission line is fitted with the STATCOM modelled controlled system. STATCOM is shunt


connected to the transmission system through a coupling transformer as shown in the block


diagram.

# **Sizing and integration of a STATCOM in an IEEE bus** **model**


An IEEE 9 bus system was considered in evaluating the performace of the STATCOM monitoring


and control system. The following data being used in in evaluating the system;


_Table 3.1: System Parameters_



|Bus No<br>.<br>From|Bus No<br>.<br>To|(Ohms/km)<br>[r1r0]|(H/km)<br>[1110]|(F/km)<br>[c1c0]|LineLength<br>(km)|
|---|---|---|---|---|---|
|7 <br>8 <br>7 <br>9 <br>5 <br>4 <br>2 <br>9 <br>1|8 <br>9 <br>5 <br>6 <br>4 <br>6 <br>7 <br>3 <br>4|0.044965 0.11241<br>0.054 0.163<br>0.095 0.287<br>0.105 0.315<br>0.054 0.162<br>0.093 0.281<br>0.000 0.000<br>0.000 0.000<br>0.000 0.000|1.225e-3 4.287e-3<br>0.0012 0.0036<br>0.0012 0.0038<br>0.0012 6.0036<br>0.0012 0.0036<br>0.0013 0.0040<br>0.000 0.000<br>0.000 0.000<br>0.000 0.000|9.010e-9 2.574e-9<br>9.073e-9 2.721e-8<br>8.687e-9 2.606e-8<br>9.144e-9 2.743e-8<br>9.06e-9 2.720e-8<br>8.257e-9 2.477e-8<br>0.000 0.000<br>0.000 0.000<br>0.000 0.000|98.95<br>115.56<br>176.71<br>196.41<br>97.38<br>95.99<br>0.000<br>0.000<br>0.000|


13












_Table 3.2: IEEE 9-Bus Voltage and Data_






|Bus No<br>.|Bus Type|Bus Voltage<br>(kV)|AngleDegree|Load[P(MW)<br>,<br>Q(Mvar)]|
|---|---|---|---|---|
|1|Slack|16.5|0|0|
|2|Voltage|18|0|0|
|3|Voltage|13.8|0|0|
|4|Load|25|0|0|
|5|Load|25|0|1|
|6|Load|25|0|0.5|
|7|Load|25|0|0|
|8|Load|25|0|0.6|
|9|Load|25|0|0|




[11]



_Table 3.3: IEEE 9-Bus Generator Data_



|Generator|Voltage(kV)|ActivePowerCapability(MW)|Reactive Power Capability<br>(kVAR)|
|---|---|---|---|
|G1|16.5|71.6|27|
|G2|18|163|6.7|
|G3|13.8|85|-10.9|


14


_Figure 3. 2: Complete IEEE-9 bus system._

### **3.2 ANALYZING THE PERFORMANCE OF THE MODIFIED IEEE BUS** **SYSTEM**


The data acquired from the controlled system are presented in three scopes.


15


_Figure 3. 3: Data Acquisition System_


The Data acquisition model is as shown in the figure below. It shows the way the data is


acquired from the interconnected buses and the same presented in the three scopes.


_Figure 3. 4: Components of Data Acquisition System_

### **3.3 VALIDATING THE PERFORMANCE OF THE MODIFIED MODEL**


16


**3.3.1 FLOWCHART**











_Figure 3. 5: System Flowchart_


17


The figure above shows the workflow of the monitoring and control system developed. The


designed STATCOM monitoring and control system is connected to the faulted IEEE 9 bus system


whose operation has been analyzed. The operation of the system both with fault and without fault


is presented in the scopes and the variation of the system’s operations is analyzed. The corrective


measure is applied by the connection of the designed model to the system to mitigate the challenges


related to power transmission problems resulting from the fault. The outcome of connection of the


control system is analyzed based on the results of the different scopes. The process is then


terminated.


**3.3.2 STATCOM OPERATION**


_Figure 3. 6: STATCOM Transmission Line Structure_


STATCOM is shunt connected with the load while the rest of the system is simplified as an
infinite utility voltage source with source impedance, STATCOM eliminates or mitigates
the unwanted effects such as reactive power, harmonics, and unbalance in the load currents. The
STATCOM supplies the unbalanced currents to compensate for the unbalance load. This results
in balanced currents being drawn from the utility, improving the power quality and thereby not
affecting other loads connected to the system.


1. DC bus voltage (Vdc)


The minimum dc bus voltage of VSC should be greater than twice the peak of the phase voltage


- f the system.


18


Where m=modulation voltage of STATCOM


index (here m=1), VLL=ac line


2. Interfacing Inductor (Li):


The selection of interfacing inductor Li of VSC depends on the current ripple (Icr (p-p)), switching


frequency (Fs) and DC bus voltage (Vdc).


√3𝑚𝑉"#
𝐿! =
12𝑎𝐹$𝑖#%('(')


Where a=overloading factor


3. DC bus capacitor (Cdc)


The value of DC capacitor (Cdc) for VSC depends upon the instantaneous energy available to


STATCOM during transient.


Where Vdc1=minimum voltage level of DC bus, V=phase voltage, I=phase current.


IV.


_Figure 3. 7:Schematic Diagram of a Transmission Line including STATCOM_


19


/



𝑃*+, = 𝑃* −𝑃-,*+, −𝑅*,*+,
/ [𝑃][*]



/
+ 𝑗𝑄*



/

+ 𝑗𝑄*

|𝑉*| [/] 4



/
+ 𝑗𝑄*



𝑄*+, = 𝑄* −𝑄-,*+, −𝑋*,*+,
/ [𝑃][*]



/

+ 𝑗𝑄*

|𝑉*| [/] 4 + 𝑄01232



/



Where, 𝑋*,*+, and 𝑅*,*+,are reactance and resistances of the line between buses n and k+1,


respectively and 𝑃* and 𝑄* are the real and reactive powers flows respectively. Active power loses


and reactive power loses are given as follows.



/
+ 𝑗𝑄*



𝑃45$$(*,*+,) = 𝑅*,*+,
~~/~~ [𝑃][*]


The voltage stability index is presented as follows,



/

+ 𝑗𝑄*

|𝑉*| [/] 4



/



〖VSI〗_((k+1))= |𝑉*| [/] - 4(𝑃6*+,𝑋* −𝑄*+,𝑅*) [/] - 4(𝑃6*+,𝑋* + 𝑄*+,𝑅*)|𝑉*| [/]


Where 𝑉𝑆𝐼(*+,) is the voltage stability index. The voltage deviation can be given as;


6
|𝑉6 −1|
𝑉𝐷= =78,


Where n is the number of system nodes.


STATCOM is minimizing the power loss, the system stability improvement and the voltage profile


enhancement [12].


**3.3.3 SYSTEM CONSTRAINTS**

Power system constraints can be categorized as follow;


**Equality constraints**


The equality constraints include the active and reactive powers flows in power systems and can be


given as;



6' 64

78,(𝑃0(h))+>78,(𝑃45$$(j))



6'
𝑃$ = > (𝑃0(h))



78,



20


6#


𝑄$ 01232
+ = 𝑄

!8,



6


0(ℎ) +
(𝑖) = = 𝑄

78,



64


45$$(𝑗)
= 𝑄

98,



Where 𝑃$ and 𝑄$are the supplied active power and the supplied reactive power in the bus. 𝑃0 and


𝑄0 are the active load and reactive load respectively. 𝑛𝑙 is the number of the transmission lines


and 𝑛𝑐 is the number of STATCOMs .


**Inequality constraints**


  - _Bust voltage limits_


Where, 𝑉;!6 and 𝑉;<= are the lower and upper voltage limits.


  - _Total injected reactive power limit_


The reactive power of the STATCOM should equal or less than the reactive load.


Where, 𝑄0is the reactive load and 𝑄01232is injected reactive power by STATCOM.


  - _Total injected active power limit_


The reactive power of the STATCOM should equal or less than the reactive load.


21


# **CHAPTER FOUR: RESULTS AND DISCUSSION**

This chapter presents the results of our project. The presentation of variations in power


transmission system performance, both when working normally and when the distortions are


introduced is done in this chapter. The solutions to the distortions are then met by applying our


monitoring and control system. The analyzed output of our modelled system on IEEE 9 Bus has


been well presented and explained. The application of STATCOM modelled to mitigate the


power transmission challenges and its applicability in ensuring that we get a more efficient


system is well presented in this chapter. The challenge that results from the variable load


connected to bus 6 affects the transmission system and the same has been mitigated by the


application of our STATCOM model. When the STATCOM model is connected, reactive power


is compensated and the voltage flickers are mitigated. STATCOM regulates and control voltage


in bus 6 by absorbing or injecting reactive power. When the STATCOM output voltage is lower


than that of Bus 6, the STATCOM absorbs reactive power from bus 6. In case the secondary


voltage is higher than that of Bus 6, the STATCOM compensates reactive power in the bus.


The simulation in our system was performed in three steps;


  - The analysis of the operation of IEEE 9 bus transmission system without three phase


distortion in any part of the system.


  - Introduction of distortions and checking the variation in the system operation.


  - Introduction of STATCOM monitoring and control system and analyzing its applicability


in mitigating the challenges as a result of the three-phase distortion.


22


### **4.1 INTEGRATION OF A STATCOM IN AN IEEE 9-BUS SYSTEM**

_Figure 4. 1: IEEE 9-Bus Model with an integrated STATCOM_

### **4.2 ANALYSIS OF THE PERFORMANCE OF THE MODIFIED IEEE 9-** **BUS TRANSMISSION SYSTEM WITH AND WITHOUT FAULTS**


The figure below presents the waveform of a normally operating system. A system operating


normally is stable and there is no variation in both voltage and current. It operates as per the


rated voltage and current in the system. The presentation of a normally operated systems is done


by the use of scopes. The scopes present sinusoidal waveforms for the system, the three phases


are equal in magnitude and are out of phase at an angle of 120⁰. This clearly presents the stability


- f the system.


23


_Figure 4. 2: Normally operating system_


FAULTED SYSTEM WITHOUT STATCOM


THREE PHASE FAULT


24


UNBALANCED LOAD



_Figure 4. 4:System with line-line fault_


_Figure 4. 5: System with variable load_



When the system is connected with the unbalanced load, the load draws changing current


continuously producing voltage flickers. Its apparent power varies continuously, making the


system unstable.

### **4.3 VALIDATING THE PERFORMANCE OF THE MODEL ON A** **FAULTED IEEE 9-BUS POWER TRANSMISSION SYSTEM**


FAULTED SYSTEM WITH STATCOM


25


_Figure 4. 6: STATCOM voltage and current correction_


_Figure 4. 7: STATCOM voltage correction_


_Figure 4. 8: STATCOM current correction_


To show the effectiveness of the STATCOM in harmonics and power factor compensation, the


power system performance was investigated under variable load condition. The fig shown above


shows the MATLAB simulation results before and after the STATCOM was connected. After


0.1 s the STATCOM was connected and was able to compensate and make the source current


26


and voltage sinusoidal. The total harmonic distortions are effectively reduced to restore the


system performance. As it can be seen from the figure, before the STATCOM is connected to the


system the source current and voltage were highly distorted with Total Harmonic Distortions.


When the STATCOM is enabled after 0.1s, it can be seen that the source current and voltage


become sinusoidal with less Total Harmonic Distortions.


_Figure 4. 9: STATCOM reference current comparison_


Before STATCOM is enabled, it can be seen that the harmornic distortion is present in the


current and system current is different from the reference current. Once STATCOM is enabled


and harmonic distortions reduced, the system current is corrected and becomes equal to the


reference current set. After the STATCOM is enabled at 0.1s, good tracking between


STATCOM measured and reference current is shown.


_Figure 4. 10: STATCOM PQ correction_


It can be seen that before the STATCOM is connected all the reactive power required by the load


is supplied by the source, and after STATCOM is enabled the source reactive power dropped to


zero and the STATCOM starts to provide the required VAR and harmonic compensation.


27


# **CHAPTER FIVE: CONCLUSION AND** **RECOMMENDATION**

### **5.1 CONCLUSION**

Our project has demonstrated the application of STATCOM monitoring and controlling of power


transmission systems. The modelled system presents the excellent performance of STATCOM


in improving power system stability in times of distortions in the power system. It is observed


that STATCOM compensate capacitive reactive power, mitigates the sags that results from the


connected unbalanced loads in the respective bus. STATCOM, mitigates the harmonic pollution


at the source, thus preventing the propagation of undesirable harmonics, which can disrupt the


smooth operation of other devices and can lead to overheating issues in lines and substation


transformer windings. Its efficiency in mitigating the power system challenges is high as it is


fast. Once enabled, it takes short time to restore the normal operation of the system. It is


therefore more reliable to use.

### **5.2 RECOMMENDATION**


Having presented the reliability of our system in mitigating the challenges affecting the power


system transmission network, we would like to recommend the use of STATCOMs in reactive


power compensation to absorb or generate reactive power in synchronization with the demand to


stabilize the voltage of the power network. This makes them particularly useful for managing the


reactive power in transmission lines.


We recommend that improvements of the system can be done in future to incorporate measures


- f detecting the specific location of faults.


28


# **REFERENCES**


[1] T. Short, Electric Power Distribution Handbook., Florida, USA: CRC Press., 2014.


[2] T. Gonen, Electrical Power Transmission System engineering: Analysis and Design ., vol.

2, CRC Press, 2014, pp. 116-129.


[3] M. Rahmani-Andebili, Power System Analysis, Cham: Springer, 2021.


[4] W. F. M. T. E. K. G. Gupta, "A comprehensive review of STATCOM: Control and

compensation strategies," _Int. J. Appl. Eng. Res,_ vol. 12, no. 12, p. 3387–3393, 2017.


[5] B. Singh, Power Quality; Problems and Mitigation Techniques, Hoboken: Wiley, 2015.


[6] A. K. P. S. K. S. a. M. M. T. Penthia, ANN controlled 4-leg VSC based STATCOM for

power quality enhancement,” 12th IEEE Int. Conf. Electron. Energy, Environ. Commun.
Comput. Control (E3-C3), INDICON 2015, pp. 17–22, 2016, doi:, Chicago: IEEE, 2015.


[7] W. Hofmann, Reactive Power Compensation: A Practical Guide,1st Edition, Hoboken:

Wiley, 2012.


[8] B. V. a. M. A. N. G. Khani, " “a New Approach To Improve Distribution Power Grids

Stability By Using Ultra Capacitor Beside,”," vol. 25, no. 1, p. 41–47, 2013.


[9] M. M. e. al, "“Performance and limitations of a constant power-fed supercapacitor,”," _IEEE_

_Trans. Energy Convers,_ vol. 29, no. 2, p. 445–452, 2014.


[10] R. P. K. a. P. Nijhawan, "“Performance Comparison of VSI Based STATCOM and ZSI

Based STATCOM in A Distribution System Network,”,," _IOSR J. Electr. Electron. Eng.,_
vol. 9, no. 6, pp. 30-35, 2014.


[11] M. E. a. S. K. A. Ramadan, "“Performance Assessment of a Realistic Egyptian Distribution

Network Including PV Penetration with STATCOM,”,," _Proc. 2019 Int. Conf. Innov._
_Trends Comput. Eng. ITCE 2019,_ p. 426–431, 2019.


[12] T. A. a. Z. S. Ahmed, "“Modeling and transient simulation of Unified Power Flow

Controllers (UPFC) in power system,”," _2015 4th Int. Conf. Electr. Eng. ICEE 2015,_ p.
333–338, 2016.


29


