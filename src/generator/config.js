import path from 'path';
import getPaths from '../config/paths';
import getConfig from '../utils/getConfig';

const cwd = process.cwd();
const paths = getPaths(cwd);

const srcPath = paths.appSrc;
let pageIgnore = [];
let pagePath = path.join(srcPath, 'pages', '**/*.jsx');
let rcConfig;

// 可以基于配置，抓取不同模块的路由文件，实现分模块打包；
try {
    rcConfig = getConfig(process.env.NODE_ENV, cwd);
} catch (e) {
    console.log(chalk.red('Failed to parse .roadhogrc config.'));
    console.log();
    console.log(e.message);
    process.exit(1);
}

if (rcConfig) {
    // 处理pagePath，业务页面所在路径
    if (Array.isArray(rcConfig.pagePath)) {
        pagePath = rcConfig.pagePath.map(item => path.join(process.cwd(), item));
    } else {
        pagePath = path.join(process.cwd(), rcConfig.pagePath);
    }

    // console.log(`pagePath: ${pagePath}`);

    // 处理pageIgnore
    if (Array.isArray(rcConfig.pageIgnore)) {
        pageIgnore = rcConfig.pageIgnore;
    } else {
        pageIgnore = [rcConfig.pageIgnore];
    }

    // console.log(`pageIgnore: ${pageIgnore}`);
}

export default {
    pageIgnore, // 忽略文件，不进行构建，提供部分模块打包功能，提高reBuild速度
    pagePath, // 使用了PAGE_ROUTE INIT_STATE 文件所在目录，与routesIgnore同样可以控制打包模块
    pageInitStateFileName: path.join(srcPath, 'pages', 'page-init-state.js'),
    pageRouteFileName: path.join(srcPath, 'pages', './page-routes.js'),
};
