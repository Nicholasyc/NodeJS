/**
 * Created by Nicholas_Wang on 2016/5/5.
 */
var Waterline = require('waterline');
var mysqlAdapter = require('sails-mysql');
var mongoAdapter = require('sails-mongo');
var models = require('./models/models');

var adapters = {
    mongo: mongoAdapter,
    mysql: mysqlAdapter,
    default: 'mysql'
};

var connections = {
    mongo: {
        adapter: 'mongo',
        url: 'mongodb://localhost/notes'
    },

    mysql: {
        adapter: 'mysql',
        url: 'mysql://mynote:12345@localhost/mynote'
    }
};

var wlconfig = {
    adapters: adapters,
    connections: connections
};

var orm = new Waterline();

orm.loadCollection(models.User);
orm.loadCollection(models.Note);

exports.wlconfig = wlconfig;
exports.orm = orm;