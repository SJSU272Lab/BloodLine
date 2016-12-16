'use strict';
let request = require('request');
let configFile = require(__dirname+'/../../../../../configurations/configuration.js');
let tracing = require(__dirname+'/../../../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../../../tools/map_ID/map_ID.js');
let Util = require(__dirname+'/../../../../../tools/utils/util');

let user_id;
let securityContext;
let user;

let update = function(req, res, next, usersToSecurityContext)
{
    if(typeof req.cookies.user !== 'undefined')
    {
        req.session.user = req.cookies.user;
        req.session.identity = map_ID.user_to_id(req.cookies.user);
    }

    user_id = req.session.identity;

    let bloodID = req.params.bloodID;

    tracing.create('ENTER', 'DELETE blockchain/assets/samples/sample/'+bloodID+'/consume', {});

    res.write('{"message":"Formatting request"}&&');

    let securityContext = usersToSecurityContext[user_id];

    return Util.invokeChaincode(securityContext, 'consume_sample', [ bloodID ])
    .then(function(data) {
        tracing.create('INFO', 'DELETE blockchain/assets/samples/sample/'+bloodID+'/consume', 'Achieving consensus');
        res.write('{"message":"Achieving consensus"}&&');
        let result = {};
        result.message = 'Sample updated';
        tracing.create('EXIT', 'DELETE blockchain/assets/samples/sample/'+bloodID+'/consume', result);
        res.end(JSON.stringify(result));
    })
    .catch(function(err) {
        res.status(400);
        tracing.create('ERROR', 'DELETE blockchain/assets/samples/sample/'+bloodID+'/consume', 'Unable to update consume. bloodID: '+ bloodID);
        let error = {};
        error.error = true;
        error.message = 'Unable to update sample. ' + err;
        error.bloodID = bloodID;
        tracing.create('ERROR', 'DELETE blockchain/assets/samples/sample/'+bloodID+'/consume', error);
        res.end(JSON.stringify(error));
    });
};
exports.delete = update;
