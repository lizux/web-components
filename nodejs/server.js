// nodejs 脚本，简洁版 web server，还支持 api 反向代理，解决跨越请求问题


//开始服务启动计时器
console.time('[WebServer][Start]');

//请求模块
var libHttp = require('http'); //HTTP协议模块
var libUrl = require('url'); //URL解析模块
var libFs = require('fs'); //文件系统模块
var libPath = require('path'); //路径解析模块
var port = process.env.PORT || 8080;
var httpProxy = require('http-proxy').createProxyServer({secure: false});

//依据路径获取返回内容类型字符串,用于http返回头
var getContType = function(filePath) {
    var contentType = '';
    //使用路径解析模块获取文件扩展名
    var ext = libPath.extname(filePath);
    switch (ext) {
        case '.html':
            contentType = 'text/html';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.gif':
            contentType = 'image/gif';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.ico':
            contentType = 'image/icon';
            break;
        default:
            contentType = 'application/octet-stream';
    }
    return contentType; //返回内容类型字符串
};

//Web服务器主函数,解析请求,返回Web内容
var runServer = function(req, res) {
    var reqUrl = req.url;
    //向控制台输出请求的路径
    console.log('request:' + reqUrl);
    //使用url解析模块获取url中的路径名
    var pathName = libUrl.parse(reqUrl).pathname;
    if (pathName.indexOf('/myapi') > -1) {
        console.log('proxy:' + pathName);
        httpProxy.web(req, res, {
            target: 'http://127.0.0.1'
        });
    } else {
        if (libPath.extname(pathName) === '') {
            //如果路径没有扩展名，指定访问目录
            pathName += '/';
        }
        if (pathName.charAt(pathName.length - 1) === '/') {
            //如果访问目录，指定默认页
            pathName += 'index.html';
        }
        //使用路径解析模块,组装实际文件路径
        var filePath = libPath.join('.', pathName);
        //判断文件是否存在
        libFs.access(filePath, libFs.F_OK, function(error) {
            if (!error) {
                //文件存在
                //在返回头中写入内容类型
                res.writeHead(200, {
                    'Content-Type': getContType(filePath)
                });
                //创建只读流用于返回
                var stream = libFs.createReadStream(filePath, {
                    flags: 'r',
                    encoding: null
                });
                //指定如果流读取错误,返回404错误
                stream.on('error', function() {
                    res.writeHead(404);
                    res.end('<h1>404 Read Error</h1>');
                });
                //连接文件流和http返回流的管道,用于返回实际Web内容
                stream.pipe(res);
            } else {
                //文件不存在返回404错误
                res.writeHead(404, {
                    'Content-Type': 'text/html'
                });
                res.end('<h1>404 Not Found</h1>');
            }
        });
    }
};

//创建一个http服务器
var WebServer = libHttp.createServer(runServer);

//指定服务器错误事件响应
WebServer.on('error', function(error) {
    console.log(error);
});

//开始侦听端口
WebServer.listen(port, function() {
    //向控制台输出服务启动的信息
    console.log('[WebServer][Start] running at http://127.0.0.1:%s', port);
    //结束服务启动计时器并输出
    console.timeEnd('[WebServer][Start]');
});
