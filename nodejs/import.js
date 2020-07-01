// Nodejs 脚本，可以把 <include src="header.html"> 替换成 src 文件中的内容，用于实现 html template 功能，提高静态页面开发效率；同时实现了根据源文件改动自动更新静态页面的功能

const libFs = require('fs');

// 相关参数设置
let sourceFolder = 'src'; // 源目录，放置模板
let buildFolder = 'build'; // 构建根目录，放置生成页面
let subPath = 'page'; // 构建子目录，放置非目录页的其他页
let homePage = ['index.html']; // 目录页（除此之外的文件都会当做其他页放入子目录）
let encode = {
    encoding: 'utf8'
};

let fileImport = function (src, filename) {
    // 读取HTML页面数据
    libFs.readFile(src + filename, encode, function (err, data) {
        if (err) {
            return;
        }
        // 把<include src="header.html"> HTML替换成 src 文件中的内容
        let dataReplace = data.replace(/<include\ssrc="(.*)"><\/include>/gi, function (matchs, path) {
            return libFs.readFileSync(src + path, encode);
        });

        // 生成新的HTML文件
        let toPath = homePage.indexOf(filename) > -1 ? '' : subPath + '/';
        let fullPath = buildFolder + '/' + toPath + filename;
        libFs.writeFile(fullPath, dataReplace, encode, function (err) {
            if (!err) {
                console.log(filename + '生成成功！');
            }
        });
    });
};

// 初始化运行
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
            // 使用文件夹判断，避免处理 include 文件夹
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
