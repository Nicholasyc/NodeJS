/**
 * Created by Nicholas_Wang on 2016/3/3.
 */
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
global.news = [];
global.content = {};
function getPages(path){
    //http://www.ss.pku.edu.cn/index.php/newscenter/news
    var $;
    var html = "";
    var num = 0;
    http.get(path,function(res){
        //var html = "";
        //var news = [];
        res.setEncoding('utf-8');

        res.on('data',function(chunk){

            html += chunk;

        });

        res.on('end',function(){
            $ = cheerio.load(html);
            $('#info-list-ul li').each(function(index,item){
                var link = 'http://www.ss.pku.edu.cn' + encodeURI($('a',this).attr('href'));
                //遍历每个新闻链接并存储 news_item 对象
                var news_item = {
                    title:$('.info-title', this).text(),
                    time:$('.time', this).text(),
                    link:'http://www.ss.pku.edu.cn' + $('a',this).attr('href')
                };

                //进入每个新闻链接，获取具体新闻内容
                var content = getPageContent(link);
                //getPageContent(link);

                //news_item.suppler = content.supply;
                //console.log(content.supply);
                news_item.content = content;

                global.news.push(news_item);
            });
            //判断 下一页 是否有可点链接
            num = $('.pagination-next').find('a').length;
            if(num>0){
                var page = 'http://www.ss.pku.edu.cn' + $('a','.pagination-next').attr('href');
                console.log(page);
                //递归调用函数实现下一个页面数据的提取
                getPages(page);
            }
            saveData('spider/data/data.json',global.news);
            //readData('spider/data/data.json');
        });
    }).on('error',function(err){
        console.log(err);
    });
}

/* 获取页面内容 */
function getPageContent(path){
    var html = "";
    var $;
    http.get(path,function(res){
        res.setEncoding('utf-8');

        res.on('data', function(chunk){
            html += chunk;
        });

        res.on('end', function () {
            $ = cheerio.load(html);
            //var suppy = $('a[title = Author]','.article-info').text().replace(/\s+/g,'');
            var suppy = $('a[title = 供稿]','.article-info').text().replace(/\s+/g,'');
            var imgs = [];
            var imgTitles = [];
            var paragraphs = [];
            //中文标点
            suppy = suppy.split('：')[1];

            $('.article-content p').each(function (index, item) {
                //图片
                if($(this).find('img').length>0){
                    var imgPath = 'http://www.ss.pku.edu.cn' + $('img', this).attr('src');
                    var imgTile = imgPath.substring(imgPath.lastIndexOf('/'))
                    //如果图片的下一个元素是有span 且span 有属性，则将其定为图片名称
                    if($(this).next().find('span').length>0 && $('span',$(this).next()).attr('style')!=null){
                        imgTile = $(this).next().text()+'.jpg';
                    }

                    var dataPath = 'spider/data/images/' + imgTile;
                    saveImages(imgPath, dataPath);
                    imgs.push(dataPath);
                }else if($(this).find('span').length>0){
                    // 图片名称
                    var imgTitle = $('span',this).text();
                    imgTitles.push(imgTitle);
                }else {
                    //段落
                    var paragraph = $(this).text();
                    paragraphs.push(paragraph);
                }
            });

            global.content = {
                supply : suppy,
                images:imgs,
                imgTitles:imgTitles,
                paragraphs:paragraphs
            };
            //console.log(global.content);
        });
    }).on('error', function (err) {
        console.log(err);
    });
    return global.content;
}


function saveData(path, news){
    //fs.appendFileSync(path, JSON.stringify(news, null, 4));
    fs.writeFile(path, JSON.stringify(news, null, 4), function(err) {
        if (err) {
            return console.log(err);
        }
        console.log('Data saved');
    });
}

//从文件读取数据
function readData(path){
    fs.readFile(path, {encoding:'utf-8'},function(err, bytesRead){
        if(err)
            console.log(err);
        else {
            var data = JSON.parse(bytesRead);

            //console.log(data[0].link);
            console.log('readData success!');
        }
    });
}


function saveImages(imgPath, dataPath){
    http.get(imgPath, function (res) {
        var imgData = "";
        res.setEncoding('binary');
        res.on('data', function (chunk) {
            imgData += chunk;
        });
        
        res.on('end', function () {
            fs.writeFile(dataPath, imgData,'binary', function (err) {
                if(err){
                    console.log(err);
                }
                console.log('save image success!');
            });
        });
    });
}

//函数导出

exports.getPages = getPages;
exports.saveData = saveData;
exports.readData = readData;
exports.getPageContent = getPageContent;