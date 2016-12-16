'use strict';
let tracing = require(__dirname+'/../../../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../../../tools/map_ID/map_ID.js');
let Util = require(__dirname+'/../../../../../tools/utils/util');
let Sample = require(__dirname+'/../../../../../tools/utils/sample');

let user_id;

let vehicleData;

let update = function(req, res, next, usersToSecurityContext, property)
{
    vehicleData = new Sample(usersToSecurityContext);

    let newValue = req.body.value;
    let functionName = req.body.function_name;
    functionName = (functionName) ? functionName : 'update_'+property.toLowerCase();
    let bloodID = req.params.bloodID;

    if(typeof req.cookies.user !== 'undefined')
    {
        req.session.user = req.cookies.user;
        req.session.identity = map_ID.user_to_id(req.cookies.user);
    }
    user_id = req.session.identity;

    tracing.create('ENTER', 'PUT blockchain/assets/samples/'+bloodID+'/' + property, req.body);

    tracing.create('INFO', 'PUT blockchain/assets/samples/'+bloodID+'/' + property, 'Formatting request');
    res.write('{"message":"Formatting request"}&&');

    return vehicleData.updateAttribute(user_id, functionName, newValue, bloodID)
    .then(function(data) {
        tracing.create('ENTER SUCCESS', 'PUT blockchain/assets/samples/'+bloodID+'/' + property);

        tracing.create('INFO', 'PUT blockchain/assets/samples/'+bloodID+'/' + property, 'Updating '+property+' value');
        res.write('{"message":"Updating owner value"}&&');
        tracing.create('INFO', 'PUT blockchain/assets/samples/'+bloodID+'/' + property, 'Achieving Consensus');
        res.write('{"message":"Achieving Consensus"}&&');
        let result = {};
        result.message = property + ' updated';
        tracing.create('EXIT', 'PUT blockchain/assets/samples/'+bloodID+'/' + property, data);
        res.end(JSON.stringify(result));
    })
    .catch(function(err) {
        res.status(400);
        let error = {};
        error.error  = true;
        error.message = err;
        tracing.create('ERROR', 'PUT blockchain/assets/samples/'+bloodID+'/' + property, JSON.parse(err));
        res.end(JSON.stringify(err));
    });

    // return Util.invokeChaincode(securityContext, functionName, [ newValue, bloodID ])
    //     .then(function(data) {
    //         tracing.create('ENTER SUCCESS', 'PUT blockchain/assets/vehicles/'+bloodID+'/' + property);
    //
    //         tracing.create('INFO', 'PUT blockchain/assets/vehicles/'+bloodID+'/' + property, 'Updating '+property+' value');
    //         res.write('{"message":"Updating owner value"}&&');
    //         tracing.create('INFO', 'PUT blockchain/assets/vehicles/'+bloodID+'/' + property, 'Achieving Consensus');
    //         res.write('{"message":"Achieving Consensus"}&&');
    //         let result = {};
    //         result.message = property + ' updated';
    //         tracing.create('EXIT', 'PUT blockchain/assets/vehicles/'+bloodID+'/' + property, data);
    //         res.end(JSON.stringify(result));
    //     })
    //     .catch(function(err) {
    //         res.status(400);
    //         let error = {};
    //         error.error  = true;
    //         error.message = err;
    //         tracing.create('ERROR', 'PUT blockchain/assets/vehicles/'+bloodID+'/' + property, JSON.parse(err));
    //         res.end(JSON.stringify(err));
    //     });
};

module.exports = update;
