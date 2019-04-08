'use strict';

const errCode = {
    CALLBACK_IS_MISSING: {CODE: 100, DESC: 'callback function is missing'},
    INVALID_PARAM: {CODE: 200, DESC: 'invalid param'},
    SYSTEM_ERROR: {CODE: 300, DESC: 'system error'},
    ACCOUNT_ERROR: {CODE: 401, DESC: 'account error'},
    FILE_EXIST_ERROR: {CODE: 402, DESC: 'file is not exist'},
    CONNECTION_ERROR: {CODE: 403, DESC: 'connection error'},

    BLOCK_ERROR: {CODE: 500, DESC: 'block is null'},
    KEY_ERROR: {CODE: 501, DESC: 'no key error'},
    INVALID_AMOUNT_ERROR: {CODE:502, DESC:'invalid amount'},
    TOKEN_ERROR: {CODE: 503, DESC: 'no token error'},
    SEND_ERROR: {CODE: 503, DESC: 'no send error'},
    NOT_TOKEN_ERROR: {CODE: 504, DESC: 'it is not a token'},
    NOT_ENOUGH_BALANCE_ERROR: {CODE: 506, DESC: 'not enough balance'},
    BALANCE_ERROR: {CODE: 506, DESC: 'balance is not exist'},
    ACCOUNT_HISTORY_ERROR: {CODE: 507, DESC: 'account history error'},
    TRANSACTION_ERROR: {CODE: 508, DESC: 'transaction failed'},
    ALREADY_CLAIMED: {CODE: 609, DESC: 'reward was already claimed'},
    REWARD_FREEZE: {CODE: 610, DESC: 'not yet possible to claim, freeze reward'},

    DENOM_NOT_SUPPORTED: {CODE: 1001, DESC: 'DENOM not supported'},
};

module.exports = errCode;