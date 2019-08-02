// nodejs 脚本，可以把 <include src="header.html"> 替换成 src 文件中的内容，用于实现 html template 功能，提高静态页面开发效率

var libFs = require('fs');

// 待处理路径设置
var target = 'src';
var fromPath = target + '/';
var toPath = 'page/';
var homePage = 'index.html';
// 需要指定编码方式，否则返回原生buffer
var encode = {
    encoding: 'utf8'
};

var fileImport = function(src, filename) {
    // 读取HTML页面数据
    libFs.readFile(src + filename, encode, function(err, data) {
        if (err) {
            return;
        }
        // 把<include src="header.html"> HTML替换成 src 文件中的内容
        var dataReplace = data.replace(/<include\ssrc="(.*)"><\/include>/gi, function(matchs, path) {
            return libFs.readFileSync(src + path, encode);
        });

        // 如果我们要把文件放在更上一级目录，那么一些相对地址就要要处理下：比如对../进行替换
        // dataReplace = dataReplace.replace(/"\.\.\//g, '"');

        // 生成新的HTML文件
        var fullPath = filename === homePage ? filename : toPath + filename;
        libFs.writeFile(fullPath, dataReplace, encode, function(err) {
            if (!err) {
                console.log(filename + '生成成功！');
            }
        });
    });
};

// 初始化运行
libFs.readdir(target, function(err, files) {
    if (err) {
        return;
    }
    files.forEach(function(filename) {
        fileImport(fromPath, filename);
        // 监控文件，变更后重新生成
        libFs.watch(fromPath + filename, function(event, filename) {
            if (event === 'change') {
                console.log(fromPath + filename + '改变，重新生成...');
                fileImport(fromPath, filename);
            }
        });
    });
});
