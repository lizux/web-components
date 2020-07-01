// Nodejs 脚本，简洁版 web server，还支持 api 反向代理，解决跨越请求问题；同时实现了根据页面模板 include 公共模块并自动生成静态页面

//开始服务启动计时器
console.time('[WebServer][Start]');

//请求模块
const libHttp = require('http'); // HTTP协议模块
const libUrl = require('url'); // URL解析模块
const libFs = require('fs'); // 文件系统模块
const libPath = require('path'); // 路径解析模块
const httpProxy = require('http-proxy').createProxyServer({secure: false});

let port = process.env.PORT || 8080;
let ip = '0.0.0.0';
let baseFolder = ''; // 允许自定义根目录
if (process.argv.length > 2) {
    baseFolder = process.argv[2]; // 可以通过命令行参数传入根目录，如 node webserver myroot
}

// 依据路径获取返回内容类型字符串,用于 http 返回头
let getContType = function (filePath) {
    let contentType = '';
    //使用路径解析模块获取文件扩展名
    let ext = libPath.extname(filePath);
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
    return contentType; // 返回内容类型字符串
};

// Web服务器主函数,解析请求,返回Web内容
let runServer = function (req, res) {
    let reqUrl = req.url;
    // 向控制台输出请求的路径
    console.log('request:' + reqUrl);
    // 使用url解析模块获取url中的路径名
    let pathName = libUrl.parse(reqUrl).pathname;
    if (pathName.indexOf('/myapi') > -1) {
        console.log('proxy:' + pathName);
        httpProxy.web(req, res, {
            target: 'http://127.0.0.1'
        });
    } else {
        let lastStr = pathName.charAt(pathName.length - 1);
        if (lastStr === '/') {
            // 如果访问目录，指定默认页
            pathName += 'index.html';
        } else if (libPath.extname(pathName) === '') {
            // 如果路径没有扩展名，指定访问目录
            pathName += '/index.html';
        }

        // 使用路径解析模块,组装实际文件路径
        let filePath = libPath.resolve(baseFolder, '.' + pathName);
        // 判断文件是否存在
        libFs.access(filePath, libFs.F_OK, function (error) {
            if (!error) {
                // 文件存在
                // 在返回头中写入内容类型
                res.writeHead(200, {
                    'Content-Type': getContType(filePath)
                });
                // 创建只读流用于返回
                let stream = libFs.createReadStream(filePath, {
                    flags: 'r',
                    encoding: null
                });
                // 指定如果流读取错误,返回404错误
                stream.on('error', function () {
                    res.writeHead(404);
                    res.end('<h1>404 Read Error</h1>');
                });
                // 连接文件流和http返回流的管道,用于返回实际Web内容
                stream.pipe(res);
            } else {
                // 文件不存在返回404错误
                res.writeHead(404, {
                    'Content-Type': 'text/html'
                });
                res.end('<h1>404 Not Found</h1>');
            }
        });
    }
};

// 创建一个http服务器
let WebServer = libHttp.createServer(runServer);

// 开始侦听端口
WebServer.listen(port, ip, function () {
    // 向控制台输出服务启动的信息
    console.log('[WebServer][Start] running at http://127.0.0.1:%s', port);
    // 结束服务启动计时器并输出
    console.timeEnd('[WebServer][Start]');
});

// 指定服务器错误事件响应
WebServer.on('error', function (error) {
    console.log(error);
});


// 解析模板 include 引入公共组件并生成静态页面
let sourceFolder = 'src'; // 源目录，放置模板
let buildFolder = baseFolder; // 构建根目录，放置生成页面
let subPath = 'page'; // 构建子目录，放置非目录页的其他页
let homePage = ['index.html', 'index_cn.html']; // 目录页（除此之外的文件都会当做其他页放入子目录）
let encode = {
    encoding: 'utf8'
};

let fileImport = function(src, filename) {
    libFs.readFile(src + filename, encode, function(err, data) {
        if (err) {
            return;
        }
        let dataReplace = data.replace(/<include\ssrc="(.*)"><\/include>/gi, function(matchs, path) {
            return libFs.readFileSync(src + path, encode);
        });

        let toPath = homePage.indexOf(filename) > -1 ? '' : subPath + '/';
        let fullPath = buildFolder + '/' + toPath + filename;
        libFs.writeFile(fullPath, dataReplace, encode, function(err) {
            if (!err) {
                console.log(filename + '生成成功！');
            }
        });
    });
};

libFs.readdir(sourceFolder, function(err, files) {
    if (err) {
        return;
    }
    files.forEach(function(filename) {
        let filedir = libPath.join(sourceFolder, filename);
        libFs.stat(filedir, function(err, stats) {
            if (err) {
                return;
            }
            let isFile = stats.isFile();
            let isDir = stats.isDirectory();
            if (isFile) {
                let fromPath = sourceFolder + '/';
                fileImport(fromPath, filename);
                libFs.watch(fromPath + filename, function(event, filename) {
                    if (event === 'change') {
                        console.log(fromPath + filename + '改变，重新生成...');
                        fileImport(fromPath, filename);
                    }
                });
            }
            if (isDir) {
                console.log('folder == ', filename);
            }
        });
    });
});
