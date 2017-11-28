const path = require('path');
const chokidar = require('chokidar');
const fs = require('fs');
const config = require('./config');
const generatePageRoute = require('./generate-page-route');
const generatePageInitState = require('./generate-page-init-state');

const pageSourceFileName = config.pagePath;
const pageInitStateFileName = config.pageInitStateFileName;
const pageRouteFileName = config.pageRouteFileName;

// 删除历史生成文件
fs.existsSync(pageInitStateFileName) && fs.unlinkSync(pageInitStateFileName);
fs.existsSync(pageRouteFileName) && fs.unlinkSync(pageRouteFileName);

function generate() {
    generatePageRoute.generateAllPageRoute();
    generatePageInitState.generateAllInitState();
}

function watch() {
    chokidar.watch([pageSourceFileName], {ignored: config.pageIgnore}).on('all', (event, pathName) => {
        generatePageInitState.handlePageInitStateWatch(event, pathName);
        generatePageRoute.handlePageRouteWatch(event, pathName);
    });
}

let watchModal = false;
for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === '--w') {
        watchModal = true;
        break;
    }
}

if (watchModal) {
    watch();
} else {
    generate();
}

exports.generate = generate;
exports.watch = watch;