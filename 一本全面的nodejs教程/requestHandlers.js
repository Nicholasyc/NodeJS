/**
 * Created by Nicholas_Wang on 2016/3/12.
 */
//var exec = require('child_process').exec;
var querystring = require('querystring'),
    fs = require('fs'),
    formidable = require('formidable'),
    util = require('util');

function start(response, postData){
    console.log('request handler "start" was called.');

    var body = '<html>'+
            '<head>'+
            '<meta http-equiv="CONTENT-TYPE" content="text/html; '+
            'charset=utf-8" />'+
            '</head>'+
            '<body>' +
            '<form action="/upload" enctype="multipart/form-data" method="post">' +
            '<input type="file" name="upload"/>' +
            '<input type="submit" value="Upload file"/>' +
            '</form>'+
            '</body>'+
            '</html>';
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(body);
    response.end();
}

function upload(response, request){
    console.log('request handler "upload" was called.');

    var form = new formidable.IncomingForm();
    console.log('about to parse');
    form.parse(request, function (error, fields, files) {
        console.log('parsing done');
        ///WebStorm/webstorm/projects/nodejs_learn/tmp/test.png
        //fs.renameSync(files.upload.path, 'C:/Users/Nicholas_Wang/Desktop/test.png');

        var readStream = fs.createReadStream(files.upload.path);
        var writeStream = fs.createWriteStream("/WebStorm/webstorm/projects/nodejs_learn/tmp/test.png");

        util.pump(readStream, writeStream, function() {
            fs.unlinkSync(files.upload.path);
        });


        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write('received image:<br/>');
        // src = /show
        response.write("<img src='/show'/>");
        response.end();
    });

}

function show(response){
    console.log('request handler "show" was called.');
    fs.readFile('/WebStorm/webstorm/projects/nodejs_learn/tmp/test.png', 'binary', function (error, file) {
        if (error) {
            response.writeHead(500, {'Content-Type': 'text/plain'});
            response.write(error + '\n');
            response.end();
        } else {
            response.writeHead(200, {'Content-Type': 'image/png'});
            response.write(file, 'binary');
            response.end();
        }
    });
}

exports.start = start;
exports.upload = upload;
exports.show = show;