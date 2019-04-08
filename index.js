'use strict';

const restify = require('restify');
global.config = require('./config');
const routes = require('./src/routes');

const server = restify.createServer({
    name: 'Terra wallet',
    version: '1.0.0',
    acceptable: [ "application/json" ],
});

server.pre(restify.pre.sanitizePath());
server.use(restify.plugins.authorizationParser());
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());


server.use(function (req, res, next) {
    res.header('WWW-Authenticate', 'Basic realm="terraWallet"');

    if (!req.authorization || !req.authorization.basic || !req.authorization.basic.password) {
        res.send(401);
        return next(false);
    }

    if (auth(req.authorization.basic.username, req.authorization.basic.password) === false) {
        res.send(401);
        return next(false);
    }

    return next();
});


let PORT = config.PORT || 8080;
process.argv.forEach(function (val, index, array) {
    if (val === '--port') {
        PORT = process.argv[index + 1];
    }
});



server.listen(PORT, function () {
    console.log('[%s] %s listening at %s', new Date(), server.name, server.url);
});

process.on('message', function (msg) {
    if (msg === 'shutdown') {
        console.log('[' + new Date() + ']', 'Closing all connections...');
        setTimeout(function () {
            console.log('[' + new Date() + ']', 'Finished closing connections');
            process.exit(0);
        }, 1500);
    }
});

server.on('uncaughtException', function (req, res, route, err) {
    console.log('[' + new Date() + ']', 'uncaughtException', err.stack);
});


function auth(username, password) {
    return username === config.BASIC_AUTH_ID && password === config.BASIC_AUTH_PASSWORD;
}

routes(server);