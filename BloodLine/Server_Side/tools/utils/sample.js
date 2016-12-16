'use strict';

const Util = require('./util.js');
const hfc = require('hfc');

class Sample {

    constructor(usersToSecurityContext) {
        this.usersToSecurityContext = usersToSecurityContext;
        this.chain = hfc.getChain('myChain'); //TODO: Make this a config param?
    }

    create(userId) {
        let securityContext = this.usersToSecurityContext[userId];
        let bloodID = Sample.newbloodID();

        return this.doesbloodIDExist(userId, bloodID)
        .then(function() {
            return Util.invokeChaincode(securityContext, 'create_sample', [ bloodID ])
            .then(function() {
                return bloodID;
            });
        });
    }

    transfer(userId, buyer, functionName, bloodID) {
        return this.updateAttribute(userId, functionName , buyer, bloodID);
    }

    updateAttribute(userId, functionName, value, bloodID) {
        let securityContext = this.usersToSecurityContext[userId];
        return Util.invokeChaincode(securityContext, functionName, [ value, bloodID ]);
    }

    doesbloodIDExist(userId, bloodID) {
        let securityContext = this.usersToSecurityContext[userId];
        return Util.queryChaincode(securityContext, 'check_unique_v5c', [ bloodID ]);
    }

    static newbloodID() {
        let numbers = '1234567890';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let bloodID = '';
        for(let i = 0; i < 7; i++)
            {
            bloodID += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        bloodID = characters.charAt(Math.floor(Math.random() * characters.length)) + bloodID;
        bloodID = characters.charAt(Math.floor(Math.random() * characters.length)) + bloodID;
        return bloodID;
    }
}

module.exports = Sample;
