var express = require('express');
var path = require('path');
var bodyParser = require('body-parser'); //解析请求body
var app = express(); //nodejs的http请求框架
//引入数据库
var mysql = require('mysql');
//解析json类型的body
app.use(bodyParser.json());
//解析string类型body
app.use(bodyParser.urlencoded({
    //传入的内容不是string时，要改成true，否则undefined
    extended: false
}));
//设置静态文件夹public目录
app.use(express.static(__dirname + '/public'));
//不管是get/post请求提交的，都拦截
//浏览器访问    http://localhost/about
app.use("/about", function(req, res) {
    console.log("关于");
    res.send("不管是get/post请求提交的，都拦截");
});
//静态文件目录
//http://localhost/public/images/bg.png
app.use('/view', express.static('view'));

app.get('/', function(req, res) {
    res.writeHead(302, {
        'Location': '/view/test.html'
            //add other headers here...
    });
    res.end();
});
////////////////////////////////////////////
//try to connect mysql
function makeConnect() {
    //实现本地链接
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'chenxiaole',
        database: 'softwareproject'
    })
    return connection;
}
//通过id获取图片
app.get('/getImg', function(req, res) {
    var connection = makeConnect();
    var id = req.query.id;
    var sql = 'select imgPath from image where id=' + id + ';';
    console.log(sql);
    connection.connect(function(err) {
        if (err) {
            console.error('error connecting:' + err.stack)
        }
        console.log('connected as id ' + connection.threadId);
    })
    connection.query(sql, function(error, results, fields) {
        if (error) throw error;
        /*console.log('The solution is:', results[0].imgPath);
        for (var p in results) {
            console.log("测试一个不知如何访问的变量：");
            console.log(results[p].imgPath);
        }
        var fs = require("fs");
        var content = fs.readFileSync(results[0].imgPath, 'binary');
        res.send(new Buffer(content));*/
        console.log(results[0].imgPath);
        res.sendFile(results[0].imgPath, { root: __dirname });
        console.log("return img success!!!");
    });
    connection.end();
})

//获取标注数据
/*这是针对矩形画框标注数据的
app.get('/getData', function(req, res) {
    var connection = makeConnect();
    //var imgId = req.body.imgId;
    var imgId = 0;
    var sql = 'select * from imgmark where belong2img=' + imgId + ';';
    console.log(sql);
    connection.connect(function(err) {
        if (err) {
            console.error('error connecting:' + err.stack)
        }
        console.log('connected as id ' + connection.threadId);
    })

    connection.query(sql, function(error, results, fields) {
        if (error) throw error;
        console.log('The solution is:', results);
        res.json(results);
    });
    connection.end();
})

//保存草稿
app.post('/saveDraft', function(req, res) {
        var connection = makeConnect();
        var data = req.body;
        console.log(data);
        var index = req.body.index;
        console.log(data.index);
        //先清除一次数据		
        let query = connection.query('DELETE FROM imgmark where belong2img=?', [0], function(error, results, fields) {
            if (error) throw error;
        })
        console.log(query.sql);
        //保存最新数据
        if (index == 1) {
            for (var i = 0; i < index; i++) {
                let post = {
                    belong2img: 0,
                    nodex: req.body['x[]'],
                    nodey: req.body['y[]'],
                    width: req.body['width[]'],
                    height: req.body['height[]']
                };
                query = connection.query("INSERT INTO imgmark SET ?", post, function(error, results, fields) {
                    if (error) throw error;
                })
                console.log(query.sql);
            }
        } else {
            for (var i = 0; i < index; i++) {
                let post = {
                    belong2img: 0,
                    nodex: req.body['x[]'][i],
                    nodey: req.body['y[]'][i],
                    width: req.body['width[]'][i],
                    height: req.body['height[]'][i]
                };
                let query = connection.query("INSERT INTO imgmark SET ?", post, function(error, results, fields) {
                    if (error) throw error;
                })
                console.log(query.sql);
            }
        }
    })
*/
/**这是针对连点画框标注数据的 */
app.get('/getData', function(req, res) {
    var connection = makeConnect();
    //var imgId = req.body.imgId;
    var imgId = 0;
    var sql = 'select * from markpointset where belong2img=' + imgId + ';';
    connection.connect(function(err) {
        if (err) {
            console.error('error connecting:' + err.stack)
        }
        console.log('connected as id ' + connection.threadId);
    })
    connection.query(sql, function(error, results, fields) {
        if (error) throw error;
        console.log('The solution is:', results);
        res.json(results);
    });
    console.log(sql);
    connection.end();
})

//保存草稿
app.post('/saveDraft', function(req, res) {
    var connection = makeConnect();
    var data = req.body;
    console.log(data);
    var imgId = req.body.imgId;
    var length = req.body.length;
    console.log(data.imgId);
    //先清除一次数据		
    var delsql = 'delete from markpointset where belong2img=' + imgId + ';';
    let query = connection.query(delsql, function(error, results, fields) {
        if (error) throw error;
    })
    console.log(query.sql);
    var data = req.body;
    for (var i = 0; i < length; i++) {
        var sql = 'INSERT INTO markpointset (belong2img, num';
        var num = data['markX[' + i + '][]'].length;
        for (var j = 1; j <= num; j++) {
            sql = sql + ', x' + j;
            sql = sql + ', y' + j;
        }
        sql = sql + ')VALUES(' + imgId + ', ' + num;
        for (var j = 0; j < num; j++) {
            sql = sql + ' ,' + data['markX[' + i + '][]'][j];
            sql = sql + ' ,' + data['markY[' + i + '][]'][j];
        }
        sql = sql + ');';
        connection.query(sql, function(error, results, fields) {
            if (error) throw error;
        })
        console.log(sql);
    }
})
app.listen(8081, function() {
    console.log("listening port 8081...");
})