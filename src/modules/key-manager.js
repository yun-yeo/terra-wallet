'use strict';

const crypto = require('crypto');
const { Sema } = require('async-sema');
const sema = new Sema(1, {capacity: 100});
const errCode = require('../../config/err-code');
const bech32 = require('bech32');
const Wallet = require('../library/wallet');
const level = require('level')


class KeyManager {
    constructor(rpc) {

        Wallet.deriveMasterKey(config.MASTER_MNEMONIC)
        .then(masterKey => {
            this.masterKey = masterKey;
        }).catch(err => {
            process.exit(0);
        })
        
        this.db = level('../../key.db')

        this.db.get('last-key-index')
        .then(value => {
            this.lastKeyIndex = Number(value);
        })
        .catch(err => {
            if(err.type == 'NotFoundError') {
                return this.db.put('last-key-index', String(0)).catch(err => {
                    console.error(err);
                    process.exit(0);
                })
            }
        })

    }

    async newAddress() {
        return new Promise(async (resolve, reject) => {
            await sema.acquire()

            const {publicKey} = Wallet.deriveKeypair(this.masterKey, this.lastKeyIndex)
            const newAddress = Wallet.createTerraAddress(publicKey)

            try {

                await this.db.put('last-key-index', String(this.lastKeyIndex + 1));
                await this.db.put(newAddress, JSON.stringify({
                    keyIndex: this.lastKeyIndex,
                    sequence: 0
                }));


                this.lastKeyIndex++;
                sema.release();
                return resolve({address: newAddress});

            } catch(err) {
                sema.release();
                console.error("newAddress", err);

                reject(err)
            }
        });
    }

    getAddressInfo(address) {
        return this.db.get(address)
        .then(value => {
            return JSON.parse(value);
        })
    }

    getAddressFromIndex(index) {
        const {publicKey} = Wallet.deriveKeypair(this.masterKey, index)
        return Wallet.createTerraAddress(publicKey)
    }

    async getAddresses() {
        let addresses = [];
        for(let i = 0; i < this.lastKeyIndex; i++) {
            const address = this.getAddressFromIndex(i);
            addresses.push(address)
        }

        return addresses;
    }

    static isAddress(address) {
        try {
            const { prefix } = bech32.decode(address);
            return prefix === "terra";
        } catch(err) {
            return false;
        }
    }
}

module.exports = KeyManager;