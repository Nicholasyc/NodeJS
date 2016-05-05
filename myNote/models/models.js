/**
 * Created by Nicholas_Wang on 2016/3/10.
 */;
var Waterline = require('waterline');
var moment = require('moment');

var database = 'mongo';

var User = Waterline.Collection.extend({
    identity: 'user',
    connection: database,
    schema: true,
    attributes: {
        username: {
            type: 'string',
            required: true
        },
        password: {
            type: 'string',
            required:true
        },
        email: {type:'string'},
        createTime: {
            type: 'string',
            defaultsTo: moment(Date.now()).locale('zh-cn').format('LL HH:mm:ss')
        }
    }
});

var Note = Waterline.Collection.extend({
    identity: 'note',
    connection: database,
    schema: true,
    attributes: {
        title: {type:'string'},
        author: {type:'string'},
        tag: {type:'string'},
        content: {type:'text'},
        createTime: {
            type: 'string',
            defaultsTo: moment(Date.now()).locale('zh-cn').format('LL HH:mm:ss')
        }
    }

});

exports.User = User;
exports.Note = Note;