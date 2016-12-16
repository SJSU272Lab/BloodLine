
var remove = require(__dirname+'/CRUD/delete.js');
exports.delete = remove.delete;

var read = require(__dirname+'/CRUD/read.js');
exports.read = read.read;


var typeFile = require(__dirname+'/type/type.js');
var type = {};
type.update = typeFile.update;
type.read = typeFile.read;
exports.type = type;

var nameFile = require(__dirname+'/name/name.js');
var name = {};
name.update = nameFile.update;
name.read = nameFile.read;
exports.name = name;

var dateFile = require(__dirname+'/date/date.js');
var date = {};
date.update = dateFile.update;
date.read = dateFile.read;
exports.date = date;

var HIVFile = require(__dirname+'/HIV/HIV.js');
var HIV = {};
HIV.update = HIVFile.update;
HIV.read = HIVFile.read;
exports.HIV = HIV;

var consumedFile = require(__dirname+'/consumed/consumed.js');
var consumed = {};
consumed.read = consumedFile.read;
exports.consumed = consumed;

var BINFile = require(__dirname+'/BIN/BIN.js');
var BIN = {};
BIN.update = BINFile.update;
BIN.read = BINFile.read;
exports.BIN = BIN;

var ownerFile = require(__dirname+'/owner/owner.js');
var owner = {};
owner.update = ownerFile.update;
owner.read = ownerFile.read;
exports.owner = owner;
