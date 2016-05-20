/**
 * Created by Nicholas_Wang on 2016/3/1.
 */
var getPages = require('./get_pages');
var cheerio = require('cheerio');
var firstPage = "http://www.ss.pku.edu.cn/index.php/newscenter/news";

getPages.getPages(firstPage);
//getPages.readData('spider/data/data.json');
//getPages.saveData('spider/data/data.json',global.news);
//getPages.getPageContent('http://www.ss.pku.edu.cn/index.php/newscenter/news/2391-'+encodeURI('台湾实践大学陈振贵校长一行参访无锡校区'));
//console.log('output:'+ global.content);


//getPages.getPageContent('htt:p//www.ss.pku.edu.cn/en/index.php/news-and-events/17-ssm-welcomes-new-students-at-three-campuses');