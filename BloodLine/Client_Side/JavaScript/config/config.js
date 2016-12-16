$(document).ready(function(){
    loadLogo(pgNm);
});



let config = {};

/******* Images *******/

// Variable Setup
config.logo = {};
config.logo.main = {};
config.logo.regulator = {};
config.logo.camp = {};
config.logo.test = {};
config.logo.separation = {};
config.logo.bank = {};
config.logo.hospital = {};

// Logo size
config.logo.width = '4em';
config.logo.height = '4em';

//Main Logo
config.logo.main.src = 'Icons/logo.jpeg';

// Regulator Logo
config.logo.regulator.src = 'Icons/Regulator/logo.jpeg';

// Manufacturer Logo
config.logo.camp.src = 'Icons/Camp/logo.jpeg';

// Dealership Logo
config.logo.test.src = 'Icons/Test/logo.jpeg';

// Lease Company Logo
config.logo.separation.src = 'Icons/Separation/logo.jpeg';

// Leasee Logo
config.logo.bank.src = 'Icons/Bank/logo.jpeg';

// Scrap Merchant Logo
config.logo.hospital.src = 'Icons/Hospital/logo.jpeg';

/******* Participants *******/
//This is where we define the details of the users for each company (name and password)

// Variable Setup
config.participants = {};
config.participants.users = {};
config.participants.users.regulators = [];
config.participants.users.camps = [];
config.participants.users.tests = [];
config.participants.users.separations = [];
config.participants.users.banks = [];
config.participants.users.hospitals = [];
config.participants.regulator = {};
config.participants.camp = {};
config.participants.test = {};
config.participants.separation = {};
config.participants.bank = {};
config.participants.hospital = {};

// Regulators
config.participants.users.regulators[0]= {};
config.participants.users.regulators[0].company = 'BA';
config.participants.users.regulators[0].type = 'Regulator';
config.participants.users.regulators[0].user = 'ARegulator';

// Manufacturers
config.participants.users.camps[0] = {};
config.participants.users.camps[0].company = 'BCamp1';
config.participants.users.camps[0].type = 'Camp';
config.participants.users.camps[0].user = 'Camp1';

config.participants.users.camps[1] = {};
config.participants.users.camps[1].company = 'BCamp2';
config.participants.users.camps[1].type = 'Camp';
config.participants.users.camps[1].user = 'Camp2';

config.participants.users.camps[2] = {};
config.participants.users.camps[2].company = 'BCamp3';
config.participants.users.camps[2].type = 'Camp';
config.participants.users.camps[2].user = 'Camp3';

// Dealerships
config.participants.users.tests[0] = {};
config.participants.users.tests[0].company = 'Test1';
config.participants.users.tests[0].type = 'Test';
config.participants.users.tests[0].user = 'Tester1';

config.participants.users.tests[1] = {};
config.participants.users.tests[1].company = 'Test2';
config.participants.users.tests[1].type = 'Test';
config.participants.users.tests[1].user = 'Tester2';

config.participants.users.tests[2] = {};
config.participants.users.tests[2].company = 'Test3';
config.participants.users.tests[2].type = 'Test';
config.participants.users.tests[2].user = 'Tester3';

// Lease Companies
config.participants.users.separations[0] = {};
config.participants.users.separations[0].company = 'Separation1';
config.participants.users.separations[0].type = 'Separation';
config.participants.users.separations[0].user = 'Separator1';

config.participants.users.separations[1] = {};
config.participants.users.separations[1].company = 'Separation2';
config.participants.users.separations[1].type = 'Separation';
config.participants.users.separations[1].user = 'Separator2';

config.participants.users.separations[2] = {};
config.participants.users.separations[2].company = 'Separation3';
config.participants.users.separations[2].type = 'Separation';
config.participants.users.separations[2].user = 'Separator3';

// Leasees
config.participants.users.banks[0] = {};
config.participants.users.banks[0].company = 'Red Cross';
config.participants.users.banks[0].type = 'Blood Bank';
config.participants.users.banks[0].user = 'Gagan';

config.participants.users.banks[1] = {};
config.participants.users.banks[1].company = 'AmericanBlood';
config.participants.users.banks[1].type = 'Blood Bank';
config.participants.users.banks[1].user = 'Aditya';

config.participants.users.banks[2] = {};
config.participants.users.banks[2].company = 'San Jose Blood Bank';
config.participants.users.banks[2].type = 'Blood Bank';
config.participants.users.banks[2].user = 'Apoorva';

// Scrap Merchants
config.participants.users.hospitals[0] = {};
config.participants.users.hospitals[0].company = 'Hospital1';
config.participants.users.hospitals[0].type = 'Hospital';
config.participants.users.hospitals[0].user = 'Sam';

config.participants.users.hospitals[1] = {};
config.participants.users.hospitals[1].company = 'Hospital2';
config.participants.users.hospitals[1].type = 'Hospital';
config.participants.users.hospitals[1].user = 'Miley';

config.participants.users.hospitals[2] = {};
config.participants.users.hospitals[2].company = 'Hospital3';
config.participants.users.hospitals[2].type = 'Hospital';
config.participants.users.hospitals[2].user = 'Justin';


/******* Used Particpants *******/
//This is where we select which participants will be used for the pages

// Regulator
config.participants.regulator = config.participants.users.regulators[0];

// Manufacturer
config.participants.camp = config.participants.users.camps[0];

// Dealership
config.participants.test = config.participants.users.tests[0];

// Lease Company
config.participants.separation = config.participants.users.separations[0];

// Leasee
config.participants.bank = config.participants.users.banks[0];

// Scrap Merchant
config.participants.hospital = config.participants.users.hospitals[0];

function loadLogo(pageType)
{
    $('#logo').attr('src', config.logo[pageType.toLowerCase()].src);
    $('#logo').css('width', config.logo.width);
    $('#logo').css('height', config.logo.height);
}

function loadParticipant(pageType)
{
    $('#username').html(config.participants[pageType].user);
    $('#company').html(config.participants[pageType].company);
}
