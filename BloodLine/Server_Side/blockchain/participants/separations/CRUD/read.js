'use strict';

let tracing = require(__dirname+'/../../../../tools/traces/trace.js');
let participants = require(__dirname+'/../../participants_info.js');

let read = function(req, res)
{
    tracing.create('ENTER', 'GET blockchain/participants/separations', {});

    if(!participants.hasOwnProperty('separations'))
	{
        res.status(404);
        let error = {};
        error.message = 'Unable to retrieve separations';
        error.error = true;
        tracing.create('ERROR', 'GET blockchain/participants/separations', error);
        res.send(error);
    }
    else
	{
        tracing.create('EXIT', 'GET blockchain/participants/separations', {'result':participants.separations});
        res.send({'result':participants.separations});
    }
};
exports.read = read;
