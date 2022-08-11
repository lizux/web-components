// Nodejs 脚本，可以把 <include src="header.html"> 替换成 src 文件中的内容，用于实现 html template 功能，提高静态页面开发效率；同时实现了根据源文件改动自动更新静态页面的功能

const libFs = require('fs');
const libPath = require('path');

// 构建模板相关配置
let sourceFolder = 'src'; // 源文件目录，放置原始文件及引入模板
let buildFolder = 'build'; // 构建目标目录，放置生成后的页面
let subFolder = 'page'; // 构建目标的子文件夹，放置非索引页的其他页面
let rootFile = ['index.html']; // 定义索引页（除此之外的文件都会放入子文件夹）
let encode = {
    encoding: 'utf8'
};
let watcher = [];

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
        let subPath = rootFile.includes(filename) ? '' : subFolder + '/';
        let fullPath = buildFolder + '/' + subPath;
        if (!libFs.existsSync(fullPath)) {
            libFs.mkdirSync(fullPath, {recursive: true});
        }
        libFs.writeFile(fullPath + filename, dataReplace, encode, function (err) {
            if (!err) {
                console.log(filename + ' 构建成功！');
            }
        });
    });
};

let rebuild = function () {
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
                let fromPath = sourceFolder + '/';
                let ext = libPath.extname(filename);
                // 源目录下的单个文件，假如是 html 页面，加入监测列表，并在修改时动态构建新页面
                if (isFile && ext === '.html') {
                    fileImport(fromPath, filename);
                    if (!watcher.includes(filedir)) {
                        libFs.watch(filedir, function (event, filename) {
                            if (event === 'change') {
                                console.log(filedir + ' 改变，重新构建...');
                                fileImport(fromPath, filename);
                            }
                        });
                        watcher.push(filedir);
                    }
                } else if (isDir) {
                    // 源目录下的子文件夹，循环内部文件，假如是 html 页面，加入监测列表，并在修改时动态构建新页面
                    libFs.readdir(filedir, function (err, files) {
                        files.forEach(function (subfile) {
                            let subdir = libPath.join(filedir, subfile);
                            let ext = libPath.extname(subfile);
                            if (ext === '.html') {
                                if (!watcher.includes(subdir)) {
                                    libFs.watch(subdir, function (event, filename) {
                                        if (event === 'change') {
                                            console.log(filedir + ' 子文件改变，重新构建...');
                                            rebuild();
                                        }
                                    });
                                    watcher.push(subdir);
                                }
                            }
                        });
                    });
                }
            });
        });
    });
};
rebuild();
