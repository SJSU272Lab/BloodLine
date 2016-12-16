'use strict';

let tracing = require(__dirname+'/../../../../tools/traces/trace.js');
let participants = require(__dirname+'/../../participants_info.js');

let read = function(req, res)
{
    tracing.create('ENTER', 'GET blockchain/participants/hospitals', {});

    if(!participants.hasOwnProperty('hospitals'))
	{
        res.status(404);
        let error = {};
        error.message = 'Unable to retrieve hospitals';
        error.error = true;
        tracing.create('ERROR', 'GET blockchain/participants/hospitals', error);
        res.send(error);
    }
    else
	{
        tracing.create('EXIT', 'GET blockchain/participants/hospitals', {'result':participants.hospitals});
        res.send({'result':participants.hospitals});
    }
};
exports.read = read;
