/**
 * Created by Nicholas_Wang on 2016/5/3.
 */
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 10,
    host:'localhost',
    user:'mynote',
    password:'12345',
    database:'mynote'
});

/**
 * search user by name
 * @param username
 */
function queryUser(username) {
    pool.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query('select * from user where username=?', username,
            function (err, results, fields) {
                if (err) throw err;
                console.log('results'+results);
                console.log('fields'+fields);
                connection.release();
                return ret;
            });
    });
}

/**
 * save user
 * @param user
 */
function saveUser(user) {
    //var params = [user.username, user.password, user.createTime];
    pool.getConnection(function (err, connection) {
        if (err) throw err;
        console.log(user);
        var params = [user.username, user.password, user.createTime];
        var query = connection.query('insert into user(username,password,createtime) values' +
            '(?,?,?)', params, function (err, result) {
            if (err) {
                console.log(err);
                console.log(query.sql);
                connection.release();
                return;
            }
            connection.release();
            console.log(query.sql);
            return result;

        });
    });
}

/**
 * save note
 * @param note
 */
function saveNote(note) {

    pool.getConnection(function (err, connection) {
        if (err) throw err;
        var sql = 'insert into note(title, author, tag, content, createtime) values(?,?,?,?,?)';
        var params = [note.title, note.author, note.tag, note.content, note.createTime];
        connection.query(sql,params, function (err, result) {
            if (err) {
                console.log(err);
                connection.release();
                return;
            }
            connection.release();
            return result;
        });
    });
}

/**
 * search note by title
 * @param authorTitle
 */
function queryNoteByTitle(authorTitle) {
    pool.getConnection(function (err, connection) {
        if (err) throw err;
        var sql = 'select * from note where title=? and author=?';
        var params = [authorTitle.author, authorTitle.title];
        connection.query(sql, params, function (err, ret) {
            if (err) {
                console.log(err);
                connection.release();
                return;
            }
            console.log(ret);
            connection.release();
            return ret;
        });
    });
}

/**
 * search note by username
 * @param username
 */
function queryNoteByName(username) {
    pool.getConnection(function (err, connection) {
        if (err) throw err;
        var sql = 'select * from note where author=?';
        connection.query(sql, username, function (err, ret) {
            if (err) {
                console.log(err);
                connection.release();
                return;
            }
            console.log(ret);
            connection.release();
            return ret;
        });
    });
}

exports.queryUser = queryUser;
exports.saveUser = saveUser;
exports.saveNote = saveNote;
exports.queryNoteByTitle = queryNoteByTitle;
exports.queryNoteByName = queryNoteByName;