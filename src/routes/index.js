'use strict';

const Controller = require('../controller');
const controller = Controller.getInstance();

const routes = (server) => {

    const end = function(req, res, next) {
        const result = res.result;

        result.response_time = (new Date().getTime() - req.start_time) / 1000;
        res.send(result.error ? 400 : 200, result);
        return next();
    };

    const start = function(req, res, next) {
        req.start_time = new Date();
        return next();
    };

    server.get("/", (req, res, next) => {
        res.send("ok!");
        return next();
    });

    server.get("/address/list", start, (req, res, next) => {
        return controller.addressList()
        .then(result => {
            res.result = result;
            return next();
        })
    }, end);

    server.get("/address/check/:address", start, (req, res, next) => {
        const address = req.params.address;

        return Controller.checkAddress(address)
        .then(result => {
            res.result = result;
            return next();
        })
    }, end);

    server.post("/address/new", start, (req, res, next) => {
        let s = new Date();

        return controller.newAddress()
        .then(result => {
            res.result = result;
            return next();
        })
    }, end);


    server.post("/send", start, (req, res, next) => {

        const address = req.body.address;
        const amount = req.body.amount;
        const memo = req.body.memo;
        const denom = req.body.denom;

        return controller.send(address, amount, memo, denom)
        .then(result => {
            res.result = result;
            return next();
        })
    }, end);

    server.get("/block/:height", start, (req, res, next) => {
        let s = new Date();
        const height = req.params.height;
        const denom = req.query.denom;

        return controller.getBlock(height, denom)
            .then(result => {
                res.result = result;
                return next();
            })
    }, end);

    server.get("/block/latest", start, (req, res, next) => {
        let s = new Date();

        return controller.getLatestBlock()
        .then(result => {
            res.result = result;
            return next();
        })
    }, end);

};

module.exports = routes;