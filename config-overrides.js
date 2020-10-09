const { override, fixBabelImports, addDecoratorsLegacy, addLessLoader } = require('customize-cra');
const { paths } = require('react-app-rewired');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const fs = require('fs');
const globby = require('globby');
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

/**
 * 禁用 ManifestPlugin 
 * 不禁用会导致start时卡死不动 build时候报错 filter not fountion 
 * 可能因为配置多页面导致ManifestPlugin入口改变 跟create-react-app版本相关 旧版本的可以使用
 * 因其产生的文件只是对比文件 暂做删除处理
 */
const removeManifest = () => config => {
    config.plugins = config.plugins.filter(
        p => p.constructor.name !== "ManifestPlugin"
    );
    return config;
};

// 配置多入口
const addCustomize = () => config => {
    // 入口文件路径
    const entriesPath = globby.sync([resolveApp('src') + '/*/index.js'], {cwd: process.cwd()});
    const htmlPath = globby.sync([resolveApp('public') + '/*.html'], {cwd: process.cwd()});
   
    paths.entriesPath = entriesPath;
    // 获取指定路径下的入口文件
    function getEntries(){
        const entries = {};
        const files = paths.entriesPath;
        files.forEach(filePath => {
            let tmp = filePath.split('/');
            let name = tmp[tmp.length - 2];
            if(process.env.NODE_ENV === 'production'){
                entries[name] = [
                    require.resolve('react-app-polyfill/stable'),
                    filePath,
                ];
            } else {
                entries[name] = [
                    require.resolve('react-app-polyfill/stable'),
                    require.resolve('react-dev-utils/webpackHotDevClient'),
                    filePath,
                ];
            }
        });
        return entries;
    }
    // 入口文件对象
    const entries = getEntries();
    // 配置 HtmlWebpackPlugin 插件, 指定入口文件生成对应的 html 文件
    let htmlPlugin;
    if(process.env.NODE_ENV === 'production'){
        config.devtool = false; // 去掉map文件
        htmlPlugin = Object.keys(entries).map((item,key) => {
            return new HtmlWebpackPlugin({
                inject: true,
                template: htmlPath[key],
                filename: item + '.html',
                chunks: [item],
                minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    keepClosingSlash: true,
                    minifyJS: true,
                    minifyCSS: true,
                    minifyURLs: true,
                }
            });
        });
    } else {
        htmlPlugin = Object.keys(entries).map((item,key) => {
            return new HtmlWebpackPlugin({
                inject: true,
                template: htmlPath[key],
                filename: item + '.html',
                chunks: [item],
            });
        });
    }
    // 修改入口
    config.entry = entries;
    // 输出相关
    if (process.env.NODE_ENV === 'production') {
        for (let i = 0; i < config.plugins.length; i++) {
            let item = config.plugins[i];
            // 更改输出的样式文件名
            if (item.constructor.toString().indexOf('class MiniCssExtractPlugin') > -1) {
                item.options.filename = 'static/[name]/css/[name].css';
                item.options.chunkFilename = 'static/[name]/css/[name].chunk.css';
            }
            // SWPrecacheWebpackPlugin: 使用 service workers 缓存项目依赖
            if(item.constructor.toString().indexOf('function GenerateSW') > -1){
                // 更改输出的文件名
                item.config.precacheManifestFilename = 'precache-manifest.js';
            }
        }
        // 更改生产模式输出的文件名
        config.output.filename = 'static/[name]/js/[name].js';
        config.output.chunkFilename = 'static/[name]/js/[name].chunk.js';
    } else {
        // 更改开发模式输出的文件名
        config.output.filename = 'static/[name]/js/[name].js';
        config.output.chunkFilename = 'static/[name]/js/[name].chunk.js';
    }
    // 修改 HtmlWebpackPlugin 插件
    for (let i = 0; i < config.plugins.length; i++) {
        let item = config.plugins[i];
        if (item.constructor.toString().indexOf('class HtmlWebpackPlugin') > -1) {
            config.plugins.splice(i, 1);
        }
    }
    config.plugins.push(...htmlPlugin);
    config.optimization.runtimeChunk = false; 
    return config;
};

module.exports = override(
    addCustomize(),
    removeManifest()
)