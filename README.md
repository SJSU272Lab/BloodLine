# [Bloodline] (http://ec2-54-153-22-112.us-west-1.compute.amazonaws.com:8080)

<img src="https://github.com/SJSU272Lab/BloodLine/blob/master/BloodLine/Client_Side/logo.jpeg" height="16%" width="17%" align="left">

Blood is one of the most important essentials of human life. In near future, we might see artificial bloodsubstituting for human blood, but till then blood donors are the safest and most important source of blood. The journey of blood from a donor to a receiver is a complex landscape process. The blood after donated is tested, stored, transported and finally transfused. But when the blood is donated in many places the details of the sample are written using pen and paper. <br/><br/>
<img src="https://github.com/SJSU272Lab/BloodLine/blob/master/BloodLine/Client_Side/Images/Chain.png" height="100%" width="100%" > <br/>
##Proposed Solution 

<img src="http://www.realdolmen.com/sites/default/files/uploads/BlockChain-Animated-Proof.gif" height="100%" width="100%"> <br/> <br/>

Bloodline helps conquer this issue using blockchain technology. This helps is tracking the blood from the time it is donated, till it is transfused. When the blood is donated, the blood camp that takes the blood will create a new block that will store the blood.These details will be on the lines of the blood sample template create by the Regulating Agency. Now when the blood is sent from blood camp to blood test center and from test center to seperation and so on till it reached the one who receives blood, every transaction details are stored in the block chain which cannot be tampered.

##Application Use Cases

Who is BloodLine for?
Well, currently BloodLine is a demonstration of how the blood management system could be when blockchain technologies are employed. You can check out the Live Stats, open a block and see hash values. You can also check out the trace of the blood smaples right from it's template creation to it's consumption in a hospital.
Since all of that involves various entities, here is a list of User Stories that will shed some light on how can you use BloodLine.

<img src="https://github.com/SJSU272Lab/BloodLine/blob/master/BloodLine/Client_Side/Images/Screen%20Shot%202016-12-12%20at%2011.45.19%20PM.png" height="80%" width="80%" align="center"> <br/> <br/>

###As a Regulator at a Donation Camp:

--Create Blood Sample Template.
--Update Sample Template with details of the blood.
--Transfer amples to Blood Camps.

###As a Blood Camp representative:

--Receive the samples from the Blood Donation camps.
--Update sample template with details of the blood.
--Transfer the samples to the Blood Test Centres.

###As a Blood Test Centre representative:

--Receive blood from the Blood Camps.
--Update sample template with details of the blood.
--Transfer samples for Blood Separation.

###As a Blood Seperation representative:

--Receive blood from the Blood Test Centres.
--Separate the blood plasma from the blood.
--Transfer the samples to Blood Banks.

###As a Blood Bank representative:

--Receive blood from the Blood Test Centres.
--Transfer the samples to Hospitals.

###As a Hospital representative:

--Receive blood from the Blood Test Centres.
--Update that the blood sample is consumed.


##Expected Outcomes

The end users here are the Regulator,Blood Camp,Blood Test Center , Blood Seperation Centers,Blood Bank & Hospitals. So each of the user can only make an entry which will be stored on the block chain when they have the blood sample sent to them or else not.

            -->Regulator should be able to create a template for the blood donation.
            -->Blood Camps can take the details of the donor and commit a transaction.
            -->Blood Test Center can also edit the details as per the test and commit transaction.
            -->Once Blood is moved from Test Center to Test Seperation only then Blood Seperation center can commit and send it to the Blood Bank.
            -->Blood bank can commit to the Block chain when the send the blood to the hospital.
            -->Hospital when it has blood can add a transaction block when they give the blood to the receiver.
            -->A transaction once commited on block chain cannot be tampered.

##Deliverables

[Presentation](https://www.youtube.com/watch?v=w9AoPzP6nug) <br/>
[Project Report](https://github.com/SJSU272Lab/BloodLine/blob/master/Project%20Report_Team%2022.pdf)

