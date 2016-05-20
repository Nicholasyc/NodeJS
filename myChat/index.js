/**
 * Created by Nicholas_Wang on 2016/5/16.
 */
var express =  require('express');
var app = express();
var url = require('url');
var qs = require('querystring');
var crypto = require('crypto');
var xmlParse = require('xml2js').parseString;
var TOKEN = 'nicholas';
var getUserInfo = require('./lib/user').getUserInfo;

function checkSignature(params, token){
    var key = [token, params.timestamp, params.nonce].sort().join('');
    var sha1 = crypto.createHash('sha1');
    sha1.update(key);
    return sha1.digest('hex') == params.signature;
}

var messages = [];
messages.push('欢迎你来到 myChat!');

//设置静态文件路径,且要放在上面 use 中间件的后面，否则微信配置不通过
app.use('/client',express.static(__dirname + '/client'));

app.use('/wall',function (req, res) {
    console.log('visit this page wall');
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/',function (req, res) {
    var query = url.parse(req.url).query;
    var params = qs.parse(query);

    console.log('token -->', TOKEN);

    if(!checkSignature(params, TOKEN)){
        res.end('signature fail');
        return;
    }

    if(req.method == 'GET'){
        res.end(params.echostr);
    } else {
        var postdata = '';

        req.addListener('data', function (postchunk) {
            postdata += postchunk;
        });

        req.addListener('end', function () {
            console.log(postdata);
            xmlParse(postdata, function (err, result) {
                if (!err) {
                    //获取用户发送过来的消息
                    console.log('微信消息：',result);
                    if (result.xml.MsgType[0] === 'text') {
                        getUserInfo(result.xml.FromUserName[0])
                            .then(function (userInfo) {
                                //获得用户信息，合并到消息中
                                result.user = userInfo;
                                //console.log('user info:',userInfo);
                                //将消息通过websocket广播

                                messages.unshift(result);
                                //console.log('messages:',messages);
                                io.sockets.emit('newMessage', result);
                                //wss.broadcast(result);
                                //var reply = replyText(result, '你说得对！');

                                //res.end('hello');
                                res.sendFile(__dirname + '/client/index.html');
                            });
                    }
                    //res.end('hello');
                }

            });
        });
    }
});




var server = app.listen(3002, function () {
   console.log('app is running at port 3002!');
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){
    console.log('connected');
    socket.emit('connected');
    socket.broadcast.emit('newClient', new Date());

    socket.on('getAllMessages', function () {
        socket.emit('allMessage',messages);
    });

    socket.on('addMessage', function (message) {
        messages.unshift(message);
        io.sockets.emit('newMessage', message);
    });
});

