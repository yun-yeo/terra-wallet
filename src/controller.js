'use strict';

const errCode = require('../config/err-code');
const RpcRequestor = require('./modules/rpc-requestor');
const KeyManager = require('./modules/key-manager');
// const StateChecker = require('./modules/state-checker');
class Controller {

    constructor() {

        // this.db = DB.getInstance();
        this.rpc = new RpcRequestor(config.PROVIDER);
        this.km = new KeyManager(this.rpc);
        // this.stateChecker = new StateChecker(this.rpc, this.db);
        // this.stateChecker.registerScheduler();

    }

    static getInstance() {
        if (Controller.instance)
            return Controller.instance;

        Controller.instance = new Controller();
        return Controller.instance;
    }

    newAddress() {
        const inputs = [];

        return this.km.newAddress()
            .then(address => {
            	return Controller._(inputs, {address: address}, null);
            })
            .catch(err => {
                console.log('newAddress', inputs, err);
                return Controller._(inputs, null, errCode.SYSTEM_ERROR);
            })

    };

    addressList() {
        const inputs = [];

        return this.km.getAddresses()
            .then((list) => {
             	return Controller._(inputs, {list: list}, null);  
            })
            .catch(err => {
                console.log('addressList', inputs, err);
                return Controller._(inputs, null, errCode.SYSTEM_ERROR);
            })

    };

    static checkAddress(address) {
        const inputs = [address];
        try {
            return Controller._(inputs, {isValid: KeyManager.isAddress(address)}, null);
        } catch (err) {
            console.log('checkAddress', inputs, err);
            return Controller._(inputs, null, errCode.SYSTEM_ERROR);
        }
    };

    send(address, amount, memo, denom) {
        const inputs = [address, amount, memo, denom];

        if (denom && config.DENOM.indexOf(denom) === -1) {
            console.log('send', inputs, "DENOM NOT SUPPORTED");
            return Controller._(inputs, null, errCode.DENOM_NOT_SUPPORTED);
        }

        return this.rpc.transfer(address, {denom: denom || config.DEFAULT_DENOM, amount: amount}, memo)
        .then(res => {
            if (res["result"] && res["result"]["txhash"]) {
                return Controller._(inputs, {hash: res["result"]["txhash"]}, null);
            } else {
                return Controller._(inputs, null, errCode.TRANSACTION_ERROR);
            }
        }).catch(err => {
            console.log('send', inputs, err);
            return Controller._(inputs, null, errCode.TRANSACTION_ERROR);
        });
    };

    getLatestBlock() {
        const inputs = [];
        return Controller._(inputs, null, errCode.TRANSACTION_ERROR);
        return this.db.getBlock('latest')
            .then(block => {
                if (!block)
                    return Controller._(inputs, null, errCode.BLOCK_ERROR);

                return Controller._(inputs, block, null);
            })
            .catch(err => {
                console.log('getLatestBlock', inputs, err);
                return Controller._(inputs, null, errCode.SYSTEM_ERROR);
            })
    };

    getBlock(height, denom) {
        const inputs = [height, denom];

        if (denom && config.DENOM.indexOf(denom) === -1) {
            console.log('getBlock', inputs, "DENOM NOT SUPPORTED");
            return Controller._(inputs, null, errCode.DENOM_NOT_SUPPORTED);
        }

        return this.rpc.getBlock(height)
        .then(block => {
            if (!block)
                return Controller._(inputs, null, errCode.BLOCK_ERROR);


			return Controller._(inputs, block, null);
        })
        .catch(err => {
            console.log('getBlock', inputs, err);
            return Controller._(inputs, null, errCode.SYSTEM_ERROR);
        });
    };

    //private
    static _(input, output, error) {
        return Promise.resolve({input: input, output: output, error: error});
    };
}

module.exports = Controller;