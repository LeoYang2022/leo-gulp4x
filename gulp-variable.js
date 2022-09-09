const StaticAssetsFolder = "/assets";   // 静态资源所在的文件夹（以斜杠开头，不以斜杠结尾！）
const StaticPagesFolder = "/pages";     // 页面所在的文件夹（以斜杠开头，不以斜杠结尾！）

let projectVersion = "?ver=0001";
let projectName = "/example-project";    // 示例项目名，即针对性打包对应的项目


let a2rvProjectPath = "/Vue/dist";      // 框架项目（Angular2、React、Vue）

let workPorts = {
    proxyConnectPort: 9001,
    browserOpenPath: "/pages/",
    autoOpenBrowser: true,  // 是否自动打开浏览器
    browserSyncPort: 9002,
    browserSyncUiPort: 9003,
};


// art-template 模板 初始数据（全局）
function artTemplateData(env) {
    return {
        baseHref: env ? "." : ".",
    }
}

const pathConfig = {
    version: projectVersion,    // 项目版本号
    accessUrl: projectName,   // 访问资源的链接
    a2rvAccessUrl: a2rvProjectPath,
    artTemplateGlobalData: artTemplateData,   // art-template 模板 data对象
    workPorts: workPorts,       // 端口
    
    stylesLess: {
        src: [
            "./src" + projectName + StaticAssetsFolder + "/less/**/[^_]*.less", 
            "./src" + projectName + StaticAssetsFolder + "/less/**/[^_]*.css"
        ],
        dest: "./dist" + projectName + StaticAssetsFolder + "/css/",
        watchPath: [
            "./src" + projectName + StaticAssetsFolder + "/less/**/*.less"
        ]
    },
    stylesStylus: {
        src: [
            "./src" + projectName + StaticAssetsFolder + "/stylus/**/[^_]*.styl?(us)", 
            "./src" + projectName + StaticAssetsFolder + "/stylus/**/[^_]*.css"
        ],
        dest: "./dist" + projectName + StaticAssetsFolder + "/css/",
        watchPath: [
            "./src" + projectName + StaticAssetsFolder + "/stylus/**/*.styl?(us)"
        ]
    },
    javascript: {
        src: [
            "./src" + projectName + StaticAssetsFolder + "/javascript/**/*.js", 
            "!./src" + projectName + StaticAssetsFolder + "/javascript/jquery-1.*.js", 
            "!./src" + projectName + StaticAssetsFolder + "/javascript/*.min.js",       // .min.js 表示已压缩文件，不监听
        ],
        dest: "./dist" + projectName + StaticAssetsFolder + "/js/",
        copyFiles: [
            "./src" + projectName + StaticAssetsFolder + "/javascript/*.min.js",      // 复制已压缩的文件（即：后缀名 .min.js）
        ]
    },
    htmls: {
        src: [
            "./src" + projectName + StaticPagesFolder + "/**/*.html", 
            "!./src" + projectName + StaticPagesFolder + "/components/**"
        ],
        dest: "./dist" + projectName + StaticPagesFolder + "/",
        watchPath: [
            "./src" + projectName + StaticPagesFolder + "/**/*.html", 
            "./src" + projectName + "/components/**",       // 与 pages 同级目录
        ],
        componentsPath: [    // 可复用公共组件 路径，数组！！！注：多路径时禁止模板的文件名重复！！！
            "./src" + projectName + StaticPagesFolder + "/components/"
        ]
    },
    imagesPath: {
        src: "./src" + projectName + StaticAssetsFolder + "/images/**",
        dest: "./dist" + projectName + StaticAssetsFolder + "/images/"
    },
    fontsPath: {
        src: "./src" + projectName + StaticAssetsFolder + "/fonts/**",
        dest: "./dist" + projectName + StaticAssetsFolder + "/fonts/",
    },
    // 清除目录
    clearPath: [
        // "./dist",   // 清除整个 dist 目录，如果 dist 包含多个项目都会被删除
        "./dist" + projectName,     // 清除指定项目
    ]
    
}

module.exports = pathConfig;
