'use strict';

let tracing = require(__dirname+'/../../../../tools/traces/trace.js');
let participants = require(__dirname+'/../../participants_info.js');

let read = function(req, res)
{
    tracing.create('ENTER', 'GET blockchain/participants/camps', {});

    if(!participants.hasOwnProperty('camps'))
    {
        res.status(404);
        let error = {};
        error.message = 'Unable to retrieve blood camps';
        error.error = true;
        tracing.create('ERROR', 'GET blockchain/participants/camps', error);
        res.send(error);
    }
    else
    {
        tracing.create('EXIT', 'GET blockchain/participants/camps', {'result':participants.camps});
        res.send({'result':participants.camps});
    }

};
exports.read = read;
