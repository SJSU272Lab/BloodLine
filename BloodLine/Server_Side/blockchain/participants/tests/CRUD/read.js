'use strict';

let tracing = require(__dirname+'/../../../../tools/traces/trace.js');
let participants = require(__dirname+'/../../participants_info.js');

let read = function(req, res)
{
    tracing.create('ENTER', 'GET blockchain/participants/tests', {});

    if(!participants.hasOwnProperty('tests'))
    {
        res.status(404);
        let error = {};
        error.message = 'Unable to retrieve blood test centers';
        error.error = true;
        tracing.create('ERROR', 'GET blockchain/participants/tests', error);
        res.send(error);
    }
    else
    {
        tracing.create('EXIT', 'GET blockchain/participants/tests', {'result':participants.tests});
        res.send({'result':participants.tests});
    }
};
exports.read = read;
