

## GUIDELINES FOR EEE4299 FINAL
## YEAR PROJECT
## Electrical & Electronic Engineering Department

## ERSI
## IVT
Dedan KimathiUniversity
of Technology
## ROAD SURFACE MONITORING AND COLLISION
## ALERT SYSTEM USING MACHINE LEARNING
Registration No.Name
## E021-01-2264/2019RUTH MUTIO MUTUNE
## E021-01-1452/2019PETER BARAKA KIOKO
## E021-01-1590/2019VICTOR WAMBUA MUTIE
Supervisor: Dr. JOSEPH MUGURO
## Friday, 24
th
## November 2023

Background of Study
•Roads are critical for transportation
worldwide, including in Kenya.
•Roads can deteriorate to the level where they
become dangerous. This includes potholes,
uneven road surfaces, broken concrete,
exposed rebar, sinkholes, and road cracks.
•Kenya recorded 4,579 fatalities as a result of
road traffic crashes in 2021, with tens of
thousands more people seriously injured.

## Problem Statement & Justification
## Problem Statement:
•Kenya's road infrastructure faces high
roughness levels.
•Absence of real-time road surface monitoring.
•Lack of an efficient and on time accident alert
system.
## Justification:
•Implementation of a tailored road surface
monitoring and accident alert system is
necessary to address these issues effectively.
•Visual inspections and eyewitness reports
hinder proactive maintenance and accurate
accident reporting.
•Existing systems are costly and inaccessible,
requiring a cost-effective solution using
affordable sensors and microcontrollers.

## Objectives
## Main Objective
•To develop a reliable and efficient system that
monitors the conditions of a road and alerts the
emergency contacts in an occurrence of an
accident.
## Specific Objectives
•Collection of road surface data using Arduino-
based sensors placed in vehicles
•Analyzing the collected data and develop machine
learning algorithm for road categorization.
•Deploying the system for real-time road surface
monitoring and collision alerting.

## Literature Review
•Crowdsourcing-based road pavement monitoring
is a new computing paradigm, where some
drivers detect road surface information.
•Smart Accident Detection And Alert System.
•Road condition monitoring using on-boards
Three-axis Accelerometer and GPS Sensor.

Methodology (Block Diagram)
## Environment
## Data Acquisition
## (DAQ)
AnalysisIOT Cloud

## Methodology
•Install Arduino based MPU-6050 IMU sensor in
vehicles to collect real-time data.
•Process and analyze the collected data using
statistical analysis.
•Train model.
•Deploy the model.
•Develop Collision Alert Algorithm.
•IOT Cloud.

Methodology (Training Curves)
## Loss Curve
•The loss curve indicates how effectively the model
predicts output from input data.
•The model performs better with smaller loss.
•The loss curve decreases as the number of training
iterations increases.This means that the model is
learning and improving over time.
## Accuracy Curve
•The accuracy curve displays how often the model
reliably predicts output from input data.
•High precision improves model performance.
•The accuracy curve increases as the number of
training iterations increases.This means that the
model is becoming more accurate over time.

## Results
•The decision tree method
outperformed other models with 95%
accuracy.
•The random forest classifier
performed moderately with 37%
accuracy.
•SVM classification accuracy was 67%.
•The CNN technique may not work
well on structured,non-image data.Its
accuracy was 50%.

## Results
•Aside is the Realtime data being
visualized in the IOT Cloud.
•Field 1, 2, and 3 shows the
processed data for x, y, and z-
axis.
•Field 4 chart shows the
predicted class of the road in
real-time.

## Results
•Aside is the Realtime data being
visualized in the IOT Cloud.
•The first three fields show the
numeric display for the
predicted class of road, the IRI,
and the RQI.
•Field 4 shows the RQI gauge
whereby when the gauge is at
the red color, a location
message will be sent.

## Results
•Aside is the collision results.
•When the magnitude exceeds and the RQI
is below a certain value, a text message
will be sent showing the location of the
vehicle.

## Codes Snippets
RQI and IRI Calculation CodeCode for sending Data to Cloud

## Conclusion
•The project created a reliable and efficient road condition monitoring system that
alerts emergency contacts in case of an accident.
•Road surface condition data was collected using Arduino-based MPU6050 sensors.
•The data was analyzed and developed using machine learning,particularly the
decision tree technique,to accurately classify road surfaces.
•A real-time road surface monitoring and accident/collision notification system was
launched.
•The algorithm accurately predicted the road surface type,calculated the RQI and
IRI,and warned of a collision when acceleration exceeded 10.
•The system could also display real-time data in raw format and after three-axis
processing.
•RQI,IRI,and expected road type were also displayed.
•Real-time road conditions and accident alerts from this system could significantly
improve road safety.

## Recommendations
•Continue to improve the accuracy of the system by collecting more data and refining the
machine learning model
•Develop a mobile application to provide users with real-time information about road
conditions and alerts
•Integrate the system with existing traffic management systems to improve overall traffic flow
and safety
•Explore the use of cameras to visualize the type of road, complementing the sensor data and
providing a more comprehensive understanding of road conditions.

## References
•J. Padilla and O. dela Cruz, "Methods on Calculating the International Roughness Index," A Literature Review.
Sustainable Development Approaches: Selected Papers of AUA and ICSGS, 2022.
•S. Ben Abderrahim, A. Belhaj, M. Bellali, O. Hmandi, M. Gharbaoui, H. Harzallah and M. Allouche, "Patterns of
unnatural deaths among children and adolescents," Pediatric and developmental pathology, 2022.
•B. D. Setiawan, V. V. Kryssanov, U. Serdult, A. Loshchilov, W. F. Mahmudy and H. Nurwasito, "CEUR workshop
Proceedungs," in CEUR-WS, 2020, March.
•X. Chen, S. Yomgchareon and M. Knoche, "A review on computer vision and machine learning techniques for
automated road surface defect and distress detection," Journal of Smart Cities and Society, pp. 1-17, 2023.
•E. Ranyal and K. Jain, "Sensors," 2022.
•K. Chen, M. Lu, X. Fan, M. Wei and J. Wu, "CHINACOM," in 6th International ICST conference, 2011.

## THANKYOU
## ERSI
## IVT
Dedan KimathiUniversity
of Technology
Private Bag-Dedan kimathi, Nyeri-Mweigaroad
## Telephone: +254-0612050000
Email: vc@dkut.ac.ke
## Website:www.dkut.ac.ke