'use strict';

module.exports = {
    DEBUG: true,

    PROVIDER: "http://127.0.0.1:1317",

    TITLE: "Terra Wallet",
    PORT: 8080,

    CHAIN_ID: "soju-0006",

    MASTER_MNEMONIC: "pistol cycle mushroom minute sugar patient crack dumb tool zone onion marine theme kitten return stage dirt egg escape valley sleep cream there remind",
    BLOCK_TIME: 5000,

    TRANSACTION_CHECK_PAGE_SIZE: 10,

    BOOTSTRAP_HEIGHT: 0,

    DEFAULT_DENOM: "mluna",
    DENOM: ["mluna", "msdr", "mkrw", "musd", "mcny", "mgbp", "meur"],
    FEES: [{
        "denom": "mluna",
        "amount": "1",
    }],

    BASIC_AUTH_ID: "terra",
    BASIC_AUTH_PASSWORD: "terra-password"
};
