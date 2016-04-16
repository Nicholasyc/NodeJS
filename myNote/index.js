/**
 * Created by Nicholas_Wang on 2016/3/10.
 */
"use strict"
//加载依赖库
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var session = require('express-session');
var querystring = require('querystring'),
    url = require('url');
// npm install --save moment ， save 要放在 moment 前面
var moment = require('moment');

var stringTest = require('./stringTest');


//引入 mongoose
var mongoose = require('mongoose');
//引入模型
var models = require('./models/models');
var User = models.User;
var Note = models.Note;

//使用 mongoose 连接服务
mongoose.connect('mongodb://localhost:27017/notes');
mongoose.connection.on('error',console.error.bind(console, '链接数据库失败'));

//创建 express 实例
var app = express();

//定义 ejs 模版引擎和模版文件位置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//定义静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

//定义数据解析器
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//建立 session 模型
app.use(session({
    secret: '1234',
    name: 'mynote',
    cookie: {maxAge: 1000 * 60 * 20}, //设置 session的保存时间为20分钟
    resave: false,
    saveUninitialized: true
}));


//响应首页 get 请求
app.get('/', function (req, res) {
    //req.session.user = null;
    res.render('index',{
        user: req.session.user,
        title:'首页'
    });
});

app.get('/register', function (req, res) {
   console.log('注册！');

    if (req.session.user!=null){
        return res.render('index', {
            user: req.session.user,
            title: '已登录',
            warn:''
        });
    }
    res.render('register', {
        user: req.session.user,
        title: '注册',
        warn:'',
        err: ''
    });
});

app.post('/register', function (req, res) {
    //req.body 可以获取到表单的每项数据
    var username = req.body.username,
        password = req.body.password,
        passwordRepeat = req.body.passwordRepeat;

    //检查输入的用户名是否为空，使用trim去掉两端的空格
    if (username.trim().length==0){
        console.log('用户名不能为空！');
        return res.redirect('/register');
    }

    if (!stringTest.nameTest(username)){
        console.log('用户名不合法');
        return res.render('register',{
            user: req.session.user,
            title: '注册',
            warn:'用户名只能是字母、数字、下划线的组合，长度3-20个字符'
        });
    }

    if (!stringTest.passwordTest(password)){
        console.log('密码不合法');
        return res.render('register',{
            user: req.session.user,
            title: '注册',
            warn:'密码长度不能少于6，必须同时包含数字、小写字母、大写字母'
        });
    }

    //检查输入的密码是否为空，使用trim去掉两端的空格
    if (password.trim().length==0){
        console.log('密码不能为空！');
        return res.redirect('/register');
    }

    //检查两次输入的密码是否一致
    if (password != passwordRepeat){
        console.log('两次输入的密码不一致！');
        return res.render('register',{
            user: req.session.user,
            title: '注册',
            warn:'两次输入的密码不一致'
        });
    }

    //检查用户名是否已经存在，如果不存在，则保存该条记录
    User.findOne({username:username}, function (err, user) {
        if (err) {
            console.log(err);
            return res.redirect('/register');
        }
        if (user) {
            console.log('用户名已存在');
            return res.render('register',{
                user: req.session.user,
                title: '注册',
                warn:'用户名已存在'
            });
        }

        //对密码进行 md5 加密
        var md5 = crypto.createHash('md5'),
            md5password = md5.update(password).digest('hex');

        //新建 user 对象用于保存数据
        var newUser = new User({
            username: username,
            password: md5password
        });

        newUser.save(function (err, doc) {
            if(err){
                console.log(err);
                return res.redirect('/register');
            }
            console.log('注册成功！');
            req.session.user = newUser;
            return res.render('index',{
                user: req.session.user,
                title:'注册'
            });
        });

    });

});

//用户登录
app.get('/login', function (req, res) {
    if (req.session.user!=null){
        return res.render('index', {
            user: req.session.user,
            title: '登录',
            warn:''
        });
    }
   console.log('登录！');
    res.render('login', {
        user: req.session.user,
        title: '登录',
        warn:''
    });
});

app.post('/login', function (req, res) {
    var username = req.body.username,
        password = req.body.password,
        chRm = req.body.chRm;
    User.findOne({username:username}, function (err, user) {
        if (err) {
            console.log(err);
            return res.redirect('/login');
        }
        if (!user) {
            console.log('用户不存在');
            return res.render('login', {
                user: req.session.user,
                title: '登录',
                warn:'用户不存在，请先注册'
            });
        }

        //md5 加密
        var md5 = crypto.createHash('md5'),
            md5password = md5.update(password).digest('hex');

        if (user.password !== md5password) {
            console.log('密码错误');
            return res.render('login', {
                user: req.session.user,
                title: '登录',
                warn:'密码错误'
            });
        }

        console.log('登录成功');
        //一周免登录
        if (chRm){
            req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
        }
        user.password = null;
        //安全起见，将密码删除
        delete user.password;
        //req.session 是一个json格式的JavaScript对象，可以随意添加成员
        req.session.user = user;
        //req.session.cookie.user = user;
        return res.redirect('/noteslist');
    });
});


app.get('/quit', function (req, res) {
    console.log('退出');
    req.session.user = null;
    return res.redirect('login');
});

app.get('/post', function (req, res) {
    if (req.session.user==null){
        return res.redirect('/');
    }
    console.log('发布');
    res.render('post', {
        user: req.session.user,
        title: '发布'
    });
});

app.post('/post', function (req, res) {
    var note = new Note({
        title: req.body.title,
        author: req.session.user.username,
        tag: req.body.tag,
        content: req.body.content
    });

    note.save(function (err, doc) {
        if (err) {
            console.log(err);
            return res.redirect('/post');
        }
        console.log('发表文章成功');
        return res.redirect('/');
    });

});

app.get('/detail', function (req, res) {
    if (req.session.user==null){
        return res.redirect('/');
    }
    console.log('查看笔记！');
    var getQuery = url.parse(req.url).query;
    var title = querystring.parse(getQuery)['title'];

    console.log('request-----: '+ title);
    Note.findOne({author: req.session.user.username, title: title}, function (err, note) {
        if (err) {
            console.log(err);
            return res.redirect('/noteslist');
        }
        console.log('----------'+note);
        //note.createTime = moment(note.createTime).format("YYYY-MM-DD");
        return res.render('detail', {
            user: req.session.user,
            note: note,
            title: '查看笔记列表',
            moment:moment
        });
    });

});

app.get('/delete', function (req, res) {
    console.log('删除指定笔记');
    if (req.session.user == null) {
        return res.redirect('/');
    }
    var getQuery = url.parse(req.url).query;
    var id = querystring.parse(getQuery)['id'];
    Note.remove({_id:id}, function (err, docs) {
        if (err) {
            console.log(err);
            return res.redirect('/noteslist');
        }
        console.log(docs);
        return res.redirect('/noteslist');
    });
});

app.get('/update', function (req, res) {
    console.log('修改笔记');
    if (req.session.user == null) {
        return res.redirect('/');
    }
    var getQuery = url.parse(req.url).query;
    var id = querystring.parse(getQuery)['id'];
    Note.findOne({_id:id}, function (err, note) {
        if (err) {
            console.log(err);
            return res.redirect('/noteslist');
        }
        console.log('----------'+note);
        //note.createTime = moment(note.createTime).format("YYYY-MM-DD");
        return res.render('update', {
            user: req.session.user,
            note: note,
            title: '修改笔记',
            moment:moment
        });
    });
});

app.post('/update', function (req, res) {
    console.log('修改笔记');
    if (req.session.user == null) {
        return res.redirect('/');
    }

    Note.update({_id:req.body.id},{
        $set:{title: req.body.title, tag:req.body.tag, content:req.body.content, createTime:req.body.createTime}
    }, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('更新成功');
        return res.redirect('/noteslist');

    });


});


app.get('/noteslist', function (req, res) {
    console.log('查看笔记列表');
    if (req.session.user==null){
        return res.redirect('/');
    }
    Note.find({author:req.session.user.username}, function (err, notes) {
        if (err) {
            //req.session.notes = null;
            console.log(err);
            return res.redirect('/');
        }
        //req.session.notes = notes;
        console.log(notes);
        return res.render('noteslist', {
            user: req.session.user,
            notes: notes,
            title: '查看笔记列表',
            moment:moment
        });
    });
});


//舰艇3000端口
app.listen(3000, function (req, res) {
    console.log('app is running at port 3000');
});

