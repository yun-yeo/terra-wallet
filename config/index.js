'use strict';

module.exports = {
    DEBUG: true,

    PROVIDER: "https://lcd.terra.money",

    TITLE: "Terra Wallet",
    PORT: 8080,

    CHAIN_ID: "soju-0006",

    MASTER_MNEMONIC: "swap theme smile ordinary camera gain glow image dragon clutch found right spring evolve shoulder depend sad december zone train like perfect autumn expire",

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