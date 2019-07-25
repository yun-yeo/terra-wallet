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

    getAddressWithIndex(index) {
        return this.km.getAddressFromIndex(index);
    }

    static checkAddress(address) {
        const inputs = [address];
        try {
            return Controller._(inputs, {isValid: KeyManager.isAddress(address)}, null);
        } catch (err) {
            console.log('checkAddress', inputs, err);
            return Controller._(inputs, null, errCode.SYSTEM_ERROR);
        }
    };

    async send(fromAddress, toAddress, amount, memo, denom) {
        const inputs = [fromAddress, toAddress, amount, memo, denom];

        if (denom && config.DENOM.indexOf(denom) === -1) {
            console.log('send', inputs, "DENOM NOT SUPPORTED");
            return Controller._(inputs, null, errCode.DENOM_NOT_SUPPORTED);
        }

        // Get Sequence Number & Key Index for Signing
        const { sequence, keyIndex } = await this.km.getAddressInfo(fromAddress);

        // Get Account Number
        const { sequenceNumber, accountNumber } = await this.rpc.loadAccountInfo(fromAddress);
        
        const accountInfo = {
            address: fromAddress,
            sequence: Math.max(sequence, sequenceNumber),
            accountNumber: accountNumber,
            keyIndex: keyIndex,
        };

        return this.rpc.transfer(accountInfo, toAddress, {denom: denom || config.DEFAULT_DENOM, amount: amount}, memo)
        .then(res => {
            if(res.result && res.result.value) {
                const broadcastBody = this.km.signAndCompleteBroadcastBody(accountInfo, res.result.value);
                console.log(broadcastBody);
                return this.rpc.broadcast(broadcastBody);    
            } else {
                throw res;
            }
            
        }).then(async res => {
            if(res.code && res.code !== 0) {
                throw res;
            }

            accountInfo.sequence++;
            await this.km.setAccountInfo(accountInfo.address, accountInfo);
            return Controller._(inputs, res, null);
        }).catch(err => {
            console.log('send', inputs, err);
            return Controller._(inputs, null, errCode.TRANSACTION_ERROR);
        });
    };

    async multiSend(inputs, outputs, memo) {
        const params = [inputs, outputs, memo];
    }

    async oracleVote(fromAddress, price, denom, memo) {
        const inputs = [fromAddress, denom, price, memo];

        if (denom && config.DENOM.indexOf(denom) === -1) {
            console.log('oracleVote', inputs, "DENOM NOT SUPPORTED");
            return Controller._(inputs, null, errCode.DENOM_NOT_SUPPORTED);
        }

        // Get Sequence Number & Key Index for Signing
        const { sequence, keyIndex } = await this.km.getAddressInfo(fromAddress);

        // Get Account Number
        const { sequenceNumber, accountNumber } = await this.rpc.loadAccountInfo(fromAddress);
        
        const accountInfo = {
            address: fromAddress,
            sequence: Math.max(sequence, sequenceNumber),
            accountNumber: accountNumber,
            keyIndex: keyIndex,
        };

        return this.rpc.oracleVote(accountInfo, price, denom || config.DEFAULT_DENOM, memo)
        .then(res => {

            if(res.result && res.result.value) {
                const broadcastBody = this.km.signAndCompleteBroadcastBody(accountInfo, res.result.value);
                return this.rpc.broadcast(broadcastBody);    
            } else {
                throw res;
            }
            
        }).then(async res => {
            if(res.code && res.code !== 0) {
                throw res;
            }

            accountInfo.sequence++;
            await this.km.setAccountInfo(accountInfo.address, accountInfo);
            return Controller._(inputs, res, null);
        }).catch(err => {
            console.log('oracleVote', inputs, err);
            return Controller._(inputs, null, errCode.TRANSACTION_ERROR);
        });
    };

    getLatestBlock() {
        const inputs = [];
        return this.rpc.getBlock('latest')
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

    getBlock(height) {
        const inputs = [height];

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

    getTransaction(page = 1, size = 10, tags = 'action=send') {
        const inputs = [page, size, tags];

        return this.rpc.getTxs(page, size, tags)
        .then(txs => {
            if(!txs) 
                return Controller._(inputs, null, errCode.SYSTEM_ERROR);

            return Controller._(inputs, txs, null);
        })
        .catch(err => {
            console.log('getTransaction', inputs, err);
            return Controller._(inputs, null, errCode.SYSTEM_ERROR);
        })

    }

    //private
    static _(input, output, error) {
        return Promise.resolve({input: input, output: output, error: error});
    };
}

module.exports = Controller;