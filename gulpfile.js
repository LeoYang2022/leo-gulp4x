const gulp = require("gulp"),
    del = require("del"),
    connect = require("gulp-connect");
const browserSync = require("browser-sync").create();   // 连续声明变量没有方法提示，换行重新声明就有提示
const httpProxy = require("http-proxy-middleware");

// 读取配置文件
const pathConfig = require("./gulp-variable");
const gf = require("./gulp-lib/gulp-function");

let environment = "development";
let clearCache = false;   // 本地开发会自动刷新（热部署），不需要手动清缓存
let ignorePages = false;    // 打包结果是否去除 pages 目录


/************************ Gulp 任务*********************************/
// 压缩 CSS
gulp.task("cleanAndMinifyCss:less", ()=>{
    return gf.funcCleanAndMinifyCss(
        pathConfig.stylesLess.src, 
        pathConfig.stylesLess.dest, 
        "less", 
        environment, 
        clearCache
    );
})

gulp.task("cleanAndMinifyCss:stylus", ()=>{
    return gf.funcCleanAndMinifyCss(
        pathConfig.stylesStylus.src, 
        pathConfig.stylesStylus.dest, 
        "stylus", 
        environment, 
        clearCache
    );
})

// 压缩 JS
gulp.task("uglifyJs", ()=>{
    return gf.funcUglifyJs(
        pathConfig.javascript.src, 
        pathConfig.javascript.dest, 
        environment
    );
})

// 压缩 HTML
gulp.task("htmlminTask", ()=>{
    return gf.funcHtmlMin(
        pathConfig.htmls.src, 
        pathConfig.htmls.dest, 
        environment, 
        clearCache,
        ignorePages
    );
})

// 拷贝图片
gulp.task("copyImages", () => {
    return gf.funcCopyFiles(
        pathConfig.imagesPath.src, 
        pathConfig.imagesPath.dest
    );
})

// 拷贝字体文件
gulp.task("copyFonts", () => {
    return gf.funcCopyFiles(
        pathConfig.fontsPath.src, 
        pathConfig.fontsPath.dest
    );
})

// 拷贝压缩版 JS
gulp.task("copyMinJs", () => {
    return gf.funcCopyFiles(
        pathConfig.javascript.copyFiles, 
        pathConfig.javascript.dest
    );
})

// 清除压缩目录
gulp.task("clean:dist", ()=>{
    return del(pathConfig.clearPath);
})

gulp.task("devBuild", (done) => {
    environment = "development";
    clearCache = false;
    console.log("开始 development 打包");
    done();
})

gulp.task("prdBuild", (done) => {
    environment = "production";
    clearCache = true;
    console.log("开始 production 打包");
    done();
})

gulp.task("prdBuildIgnorePages", (done) => {
    environment = "production";
    clearCache = true;
    ignorePages = true;
    console.log("开始 production 打包（删除 pages 目录）");
    done();
})

// 监听任务全部更新
gulp.task("watchDevPathUpdateAll", (done)=>{
    // 任务1：js工作目录
    gulp.watch(pathConfig.javascript.src, gulp.series("uglifyJs"));
    
    // 任务2：css工作目录
    gulp.watch(pathConfig.stylesLess.watchPath, gulp.series("cleanAndMinifyCss:less"));
    gulp.watch(pathConfig.stylesStylus.watchPath, gulp.series("cleanAndMinifyCss:stylus"));

    // 任务3：html工作目录
    gulp.watch(pathConfig.htmls.watchPath, gulp.series("htmlminTask"));

    // 任务4：images工作目录
    gulp.watch(pathConfig.imagesPath.src, gulp.series("copyImages"));

    // 任务5：fonts工作目录
    gulp.watch(pathConfig.fontsPath.src, gulp.series("copyFonts"));

    // 任务6：复制压缩版JS文件
    gulp.watch(pathConfig.javascript.copyFiles, gulp.series("copyMinJs"));

    done();
})

// 配置静态资源代理
gulp.task("runServerA2RV", (done) => {
    connect.server({
        name: "三大框架静态资源代理",
        root: "A2RV" + pathConfig.a2rvAccessUrl,
        host: "0.0.0.0",
        port: 9021,
        livereload: true,
        middleware: (connect, opt) => [
            httpProxy("/api", {
                target: 'https://www.baidu.com',
                changeOrigin: true,
            }),
        ]
    })
    done();
})

// 配置 openBrowserA2RV 任务
gulp.task("openBrowserA2RV", (done) => {
    browserSync.init({
        notify: false,  // 不显示在浏览器中的任何通知（右上角通知）
        proxy: "http://localhost:9021/",     // 浏览器打开的链接，端口号由 runServerA2RV 决定
        port: 9022,     // 实际访问端口
        ui: {
            port: 9023
        }
    });
    done();
})

// 配置静态资源代理
gulp.task("runServer", (done) => {
    connect.server({
        name: "静态资源代理",
        root: "dist" + pathConfig.accessUrl,
        host: "0.0.0.0",
        port: pathConfig.workPorts.proxyConnectPort || 9001,
        livereload: true,
        middleware: function(connect, opt) {
            return [
                httpProxy("/first-api/news", {
                    target: 'https://www.baidu.com',
                    changeOrigin: true,
                    pathRewrite: {
                        "^/first-api/news": "/api/news",
                    }
                }),
                httpProxy("/second-api/", {
                    target: 'https://www.bing.com/',
                    changeOrigin: true,
                    pathRewrite: {
                        "^/second-api/menus": "/api/menus",
                    }
                })
            ]
        }
    })
    done();
})

// 配置 browserSync 任务
gulp.task("browserSync", (done) => {
    browserSync.init({
        notify: false,  // 不显示在浏览器中的任何通知（右上角通知）
        // proxy: "http://localhost:9001/pages",     // 浏览器打开的链接，端口号由 runServer 决定
        proxy: "http://localhost:" + pathConfig.workPorts.proxyConnectPort + pathConfig.workPorts.browserOpenPath,
        port: pathConfig.workPorts.browserSyncPort || 9002,     // 实际访问端口
        ui: {
            port: pathConfig.workPorts.browserSyncUiPort || 9003,
        }
    });
    done();
})

// gulp 任务启动入口
gulp.task("default", gulp.series([
    "devBuild",     // 设置环境
    "clean:dist",           // 清除目录
    "uglifyJs",             // 初始化压缩 js 文件
    "cleanAndMinifyCss:less",    // 初始化压缩成 css 文件
    "cleanAndMinifyCss:stylus",    // 初始化压缩成 css 文件
    "htmlminTask",              // 初始化压缩 HTML 文件
    "copyImages",
    "copyFonts",
    "copyMinJs",
    gulp.parallel(
        pathConfig.workPorts.autoOpenBrowser ? 
        [
            "runServer",                // 静态资源服务
            "watchDevPathUpdateAll",    // 监听开发目录，如新增则生成新的压缩文件，如删除则删除对应的压缩文件
            "browserSync",              // 启动浏览器
        ] : 
        [
            "runServer",                // 静态资源服务
            "watchDevPathUpdateAll",    // 监听开发目录，如新增则生成新的压缩文件，如删除则删除对应的压缩文件
        ]
    )
]))

// 生产编译（不需要启动服务）
gulp.task("prd", gulp.series([
    "prdBuild",     // 设置环境
    "clean:dist",           // 清除目录
    "uglifyJs",             // 初始化压缩 js 文件
    "cleanAndMinifyCss:less",    // 初始化压缩成 css 文件
    "cleanAndMinifyCss:stylus",    // 初始化压缩成 css 文件
    "htmlminTask",              // 初始化压缩 HTML 文件
    "copyImages",
    "copyFonts",
    "copyMinJs"
]))

// 生产编译（不需要启动服务）
gulp.task("prdIgnorePages", gulp.series([
    "prdBuildIgnorePages",     // 设置环境（删除 pages 目录）
    "clean:dist",           // 清除目录
    "uglifyJs",             // 初始化压缩 js 文件
    "cleanAndMinifyCss:less",    // 初始化压缩成 css 文件
    "cleanAndMinifyCss:stylus",    // 初始化压缩成 css 文件
    "htmlminTask",              // 初始化压缩 HTML 文件
    "copyImages",
    "copyFonts",
    "copyMinJs"
]))


// 运行三大框架打包后项目的服务
gulp.task("a2rv", gulp.parallel([
    "runServerA2RV",
    "openBrowserA2RV"
]))

module.exports = gulp;
