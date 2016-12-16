/*eslint-env node */
var create = require(__dirname+'/CRUD/create.js');
exports.create = create.create;

var read = require(__dirname+'/CRUD/read.js');
exports.read = read.read;

var regulatorsFile = require(__dirname+'/regulators/regulators.js');
var regulators = {};
regulators.read = regulatorsFile.read;
exports.regulators = regulators;

var campsFile = require(__dirname+'/camps/camps.js');
var camps = {};
camps.read = campsFile.read;
exports.camps = camps;

var testsFile = require(__dirname+'/tests/tests.js');
var tests = {};
tests.read = testsFile.read;
exports.tests = tests;

var separationsFile = require(__dirname+'/separations/separations.js');
var separations = {};
separations.read = separationsFile.read;
exports.separations = separations;

var blood_banksFile = require(__dirname+'/blood_banks/blood_banks.js');
var blood_banks = {};
blood_banks.read = blood_banksFile.read;
exports.blood_banks = blood_banks;

var hospitalsFile = require(__dirname+'/hospitals/hospitals.js');
var hospitals = {};
hospitals.read = hospitalsFile.read;
exports.hospitals = hospitals;