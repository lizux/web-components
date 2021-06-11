// WebServer 部分
console.time('[WebServer][Start]');

const libHttp = require('http');
const libUrl = require('url');
const libFs = require('fs');
const libPath = require('path');

let port = 8090;
let ip = '0.0.0.0';
let baseFolder = 'build';

let getContType = function (filePath) {
    let contentType = '';

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
    return contentType;
};

let runServer = function (req, res) {
    let reqUrl = req.url;
    console.log('request:' + reqUrl);

    let pathName = libUrl.parse(reqUrl).pathname;
    if (pathName.indexOf('/myapi') > -1) {
        console.log('proxy:' + pathName);
    } else {
        let lastStr = pathName.charAt(pathName.length - 1);
        if (lastStr === '/') {
            pathName += 'index.html';
        } else if (libPath.extname(pathName) === '') {
            pathName += '/index.html';
        }

        let filePath = libPath.resolve(baseFolder, '.' + pathName);
        libFs.access(filePath, libFs.F_OK, function (error) {
            if (!error) {
                res.writeHead(200, {
                    'Content-Type': getContType(filePath)
                });
                let stream = libFs.createReadStream(filePath, {
                    flags: 'r',
                    encoding: null
                });
                stream.on('error', function () {
                    res.writeHead(404);
                    res.end('<h1>404 Read Error</h1>');
                });
                stream.pipe(res);
            } else {
                res.writeHead(404, {
                    'Content-Type': 'text/html'
                });
                res.end('<h1>404 Not Found</h1>');
            }
        });
    }
};

let WebServer = libHttp.createServer(runServer);
WebServer.listen(port, ip, function () {
    console.log('[WebServer][Start] running at http://127.0.0.1:%s', port);
    console.timeEnd('[WebServer][Start]');
});
WebServer.on('error', function (error) {
    console.log(error);
});

// include 公共模板部分
let sourceFolder = 'src';
let buildFolder = baseFolder;
let subPath = 'page';
let homePage = ['index.html'];
let encode = {
    encoding: 'utf8'
};

let fileImport = function (src, filename) {
    libFs.readFile(src + filename, encode, function (err, data) {
        if (err) {
            return;
        }
        let dataReplace = data.replace(/<include\ssrc="(.*)"><\/include>/gi, function (matchs, path) {
            return libFs.readFileSync(src + path, encode);
        });

        let toPath = homePage.indexOf(filename) > -1 ? '' : subPath + '/';
        let fullPath = buildFolder + '/' + toPath + filename;
        libFs.writeFile(fullPath, dataReplace, encode, function (err) {
            if (!err) {
                console.log(filename + '生成成功！');
            }
        });
    });
};

libFs.readdir(sourceFolder, function (err, files) {
    if (err) {
        return;
    }
    files.forEach(function (filename) {
        let filedir = libPath.join(sourceFolder, filename);
        libFs.stat(filedir, function (err, stats) {
            if (err) {
                return;
            }
            let isFile = stats.isFile();
            let isDir = stats.isDirectory();
            if (isFile) {
                let fromPath = sourceFolder + '/';
                fileImport(fromPath, filename);
                libFs.watch(fromPath + filename, function (event, filename) {
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
