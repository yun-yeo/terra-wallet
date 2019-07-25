'use strict';

const request = require('axios');

const errCode = require('../../config/err-code');
const KeyManager = require('./key-manager');
const { Sema } = require('async-sema');
const sema = new Sema(1, {capacity: 100});

function req (method, path) {
    return function (data) {
        return this.request(method, path, data);
    }
}

function argReq (method, path) {
    return function (args, data) {
        if(Array.isArray(args)) {
            args = args.join('/');
        }

        return this.request(method, `${path}/${args}`, data);
    }
}

class Client {
    constructor (server = 'https://localhost:1317') {
        this.server = server;
    }

    async request (method, path, data) {
        try {
            let res = await request({
                method,
                url: this.server + path,
                data
            });

            return res.data
        } catch (resError) {
            let data = resError.response ? resError.response.data : null;
            if (!data) {
                throw {err: resError, method: method, path: path};
            }

            // server responded with error message, create an Error from that
            throw {data: data, method: method, path: path};
        }
    }


    get account() {
        return argReq.call(this, 'GET', '/auth/accounts');
    }

    async loadAccountInfo(address) {
        let accountInfo = await this.account(address);
        if(!accountInfo || !accountInfo.value
            || !accountInfo.value.account_number
            || !accountInfo.value.sequence) {
            throw "account not found"
        }

        return {
            accountNumber: Number(accountInfo.value.account_number),
            sequenceNumber: Number(accountInfo.value.sequence)
        };
    }

    async transfer (accountInfo, toAddress, asset, memo) {
        await sema.acquire();

        const inputs = [accountInfo, toAddress, asset, memo];
        try {
            if(!KeyManager.isAddress(toAddress) && !KeyManager.isAddress(accountInfo.address)) {
                console.log("transfer", inputs, "Address should start with \"terra\"");
                return {error: errCode.INVALID_PARAM};
            }

            let result = await this.request('POST', '/bank/accounts/' + toAddress + '/transfers', {
                "base_req": {
                    "from": accountInfo.address,
                    "chain_id": config.CHAIN_ID,
                    "account_number": String(accountInfo.accountNumber),
                    "sequence": String(accountInfo.sequence),
                    "fees": config.FEES,
                    "memo": memo,
                    "simulate": false,
                },
                "coins": [
                    asset
                ]
            });

            sema.release();
            return {result: result};
        } catch (err) {
            console.log("transfer", inputs, err);

            sema.release();
            return {error: errCode.TRANSACTION_ERROR};
        }
    }

    async oracleVote (accountInfo, price, denom, memo) {
        await sema.acquire();

        const inputs = [accountInfo, price, denom, memo];
        try {
            if(!KeyManager.isAddress(accountInfo.address)) {
                console.log("transfer", inputs, "Address should start with \"terra\"");
                return {error: errCode.INVALID_PARAM};
            }

            let result = await this.request('POST', '/oracle/denoms/' + denom + '/votes', {
                "base_req": {
                    "from": accountInfo.address,
                    "chain_id": config.CHAIN_ID,
                    "account_number": String(accountInfo.accountNumber),
                    "sequence": String(accountInfo.sequence),
                    "fees": config.FEES,
                    "memo": memo,
                    "simulate": false,
                },
                "price": String(price)
            });

            sema.release();
            return {result: result};
        } catch (err) {
            console.log("oracleVote", inputs, err);

            sema.release();
            return {error: errCode.TRANSACTION_ERROR};
        }
    }

    get getBlock() {
        return argReq.call(this, 'GET', '/blocks');
    }

    get getTx() {
        return argReq.call(this, 'GET', '/txs');
    }

    get getTxs() {
        return (page, size, tags = "action=send") => {
            return this.request('GET', "/txs?page=" + page + "&limit=" + size + "&" + tags);
        }
    }

    get broadcast() {
        return req.call(this, 'POST', '/txs')
    }

}


module.exports = Client;