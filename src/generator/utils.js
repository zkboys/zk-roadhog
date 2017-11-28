const path = require('path');

/**
 * 获取文件相对路径名，用于引入等
 * @param pathName
 */
function getPathName(pathName) {
  const extName = path.extname(pathName);
  pathName = pathName.replace(extName, '');

  if (process.platform.indexOf('win') >= 0) {
    pathName = pathName.replace(/\\/g, "\/");
  }
  // pathName = pathName.replace('../', '');
  return pathName;
}

/**
 * 获取asyncComponent 转换之后的字符串
 * @param componentPath
 * @returns {string}
 */
function getComponentString(componentPath) {
  return `getComponent: () => import('${componentPath}'),`;
}

export default {
  getComponentString,
  getPathName,
}
