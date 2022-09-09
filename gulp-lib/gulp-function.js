const gulp = require("gulp");
const gulpIf = require("gulp-if");
const autoprefixer = require("gulp-autoprefixer");
const rename = require("gulp-rename");
const cleanCss = require("gulp-clean-css");
const less = require("gulp-less");
const stylus = require("gulp-stylus");
const uglify = require("gulp-uglify");
const base64 = require("gulp-base64");
const connect = require("gulp-connect");
const htmlmin = require("gulp-htmlmin")
const babel = require("gulp-babel");
const htmlTpl = require("gulp-html-tpl");
const artTemplate = require("art-template");
const gulpReplace = require("gulp-replace");

// 读取配置文件
const pathConfig = require("../gulp-variable");

/**
 * 压缩 css
 * @param { String | String[] } devPaths ：压缩前目录
 * @param { String } distPaths ：压缩后目录 
 * @param { String } type ：预编译语言类型（less 或 stylus）
 * @param { String } buildEnv ：打包环境（development 或 production）
 * @param { String } clearCache ：是否需要清缓存（发布后防止浏览器缓存）
 */
function funcCleanAndMinifyCss(devPaths, distPaths, type, buildEnv, clearCache) {
    return gulp.src(devPaths)
        .pipe(gulpIf(type==="less", less()))
        .pipe(gulpIf(type==="stylus", stylus()))
        .pipe(base64({
            // baseDir: "",
            extensions: ["png", "jpg", "svg"],
            maxImageSize: 20 * 1024,      // 单位：bytes,
            deleteAfterEncoding: false,
            debug: true
        }))
        .pipe(autoprefixer())
        .pipe(
            gulpIf(
                buildEnv==="production", 
                cleanCss({ compatibility: "ie8" })
            )
        )
        .pipe(rename({ suffix: ".min" }))
        .pipe(
            gulpIf(
                clearCache, 
                gulpReplace(/\.(png|jpe?g|bmp|gif)/gi, (match) => (match + pathConfig.version)) 
            )
        )
        .pipe(gulp.dest(distPaths))
        .pipe(connect.reload());
}

/**
 * 压缩 js
 * @param { String | String[] } devPaths ：压缩前目录
 * @param { String } distPaths ：压缩后目录
 * @param { String } buildEnv ：打包环境（development 或 production）
 */
function funcUglifyJs(devPaths, distPaths, buildEnv) {
    return gulp.src(devPaths)
        .pipe(babel())
        .pipe(gulpIf(buildEnv==="production", uglify({
            output: {
                comments: (node, comment) => {
                    // 版权信息保留
                    return comment.value.indexOf("Copyright")>=0;
                }
            }
        })))
        .pipe(rename({ suffix: ".min" }))
        .pipe(gulp.dest(distPaths))
        .pipe(connect.reload());
}

/**
 * 压缩 HTML
 * @param { String | String[] } devPaths ：压缩前目录
 * @param { String } distPaths ：压缩后目录
 * @param { String } buildEnv ：打包环境（development 或 production）
 * @param { String } clearCache ：是否需要清缓存（发布后防止浏览器缓存）
 * @param { Boolean } ignorePages ：打包后是否删除 pages 目录（默认值：false，即保留 pages 目录）
 */
function funcHtmlMin(devPaths, distPaths, buildEnv, clearCache, ignorePages) {
    if(ignorePages) {
        distPaths = distPaths.replace("/pages/", "/");
    }
    const env = buildEnv==="production";   // 判断环境变量
    var minOption = {       // 压缩配置
        caseSensitive: false,                   // 大小写不敏感。标签和标签属性都会变小写。自定义组件避免使用大写！
        collapseBooleanAttributes: true,        // 省略布尔属性的值
        removeComments: true,                   // 清除html中注释的部分
        removeEmptyAttributes: true,            // 清除所有的空属性
        removeScriptTypeAttributes: true,       // 清除所有script标签中的type="text/javascript"属性
        removeStyleLinkTypeAttributes: true,    // 清除所有link标签上的type属性
        collapseWhitespace: env,    // 清除空格（生产环境清除空格）
        minifyJS: env,              // 压缩html中的javascript代码
        minifyCSS: env,             // 压缩html中的css代码
    }
    return gulp.src(devPaths)
        .pipe(htmlTpl({
            tag: "view-template",                       // 引入的标签名，默认 template
            paths: pathConfig.htmls.componentsPath,     // 组件所在的目录
            engine: function(template, data) {          // 注册模板引擎
                return template && artTemplate.compile(template)(data);
            },
            data: pathConfig.artTemplateGlobalData(env),    // 初始数据（全局）
            beautify: {
                indent_char: " ",
                indent_with_tabs: false,
            },
        }))
        .pipe(htmlmin(minOption))
        .pipe(
            gulpIf(
                clearCache, 
                gulpReplace(/\.min\.(js|css)/gi, (match) => (match + pathConfig.version)) 
            )
        )
        .pipe(
            gulpIf(
                clearCache, 
                gulpReplace(/\.(png|jpe?g|bmp|gif)/gi, (match) => (match + pathConfig.version)) 
            )
        )
        .pipe(
            gulpIf(
                ignorePages, 
                gulpReplace(/\.\.\/assets\//gi, "./assets/")    // 删除 pages 目录，静态资源引用减少一层路径
            )
        )
        .pipe(gulp.dest(distPaths))
        .pipe(connect.reload());
}

/**
 * 复制文件
 * @param { string | string[] } devPaths ：复制前目录
 * @param { string } distPaths ：复制后目录
 */
function funcCopyFiles(devPaths, distPaths) {
    return gulp.src(devPaths)
        .pipe(gulp.dest(distPaths))
        .pipe(connect.reload());
}

// 函数集合
const functionCollection = {
    funcCleanAndMinifyCss: funcCleanAndMinifyCss,
    funcUglifyJs,
    funcHtmlMin,
    funcCopyFiles,
}

module.exports = functionCollection;
