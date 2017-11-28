/* eslint-disable */
import fs from 'fs';
import globby from 'globby';
import utils from './utils';
import config from './config';

const sourceFileName = config.pagePath;
const targetFileName = config.pageRouteFileName;

const paths = {};
const pathNames = {};

export function handlePageRouteWatch(event, pathName) {
  let pn;
  let changed = false;
  const routePath = getRoutePath(pathName);
  if (routePath) {
    // console.log('page-route:', event, pathName);
    pn = utils.getPathName(pathName);
  }
  if (event === 'add' && routePath) {
    paths[pathName] = routePath;
    pathNames[pathName] = pn;
    changed = true;
  }

  if (event === 'change') {
    if (!routePath) { // 有可能删了
      delete paths[pathName];
      delete pathNames[pathName];
      changed = true;
    } else if (routePath !== paths[pathName]) { // 增加或者改了
      paths[pathName] = routePath;
      pathNames[pathName] = pn;
      changed = true;
    }
  }

  if (event === 'unlink') {
    delete paths[pathName];
    delete pathNames[pathName];
    changed = true;
  }

  if (changed) {
    const ps = Object.keys(paths).map(function (key) {
      return paths[key];
    });
    const pns = Object.keys(pathNames).map(function (key) {
      return pathNames[key];
    });
    writeAllPageRoute(ps, pns, targetFileName);
  }


}

export function generateAllPageRoute() {
  const result = getPathsAndPathNames(sourceFileName, targetFileName, getRoutePath);
  const paths = result.paths;
  const pathNames = result.pathNames;
  writeAllPageRoute(paths, pathNames, targetFileName);
}

function writeAllPageRoute(paths, pathNames, targetFileName) {
  let fileString = '';

  fileString += 'export default [';
  pathNames.forEach(function (im, i) {
    // console.log('page-route:', im);
    fileString += '\n    {\n        ';
    fileString += 'path: \'' + paths[i] + '\',\n        ';
    fileString += utils.getComponentString(im);
    // fileString += 'asyncComponent: \'' + im + '\',\n    ';
    fileString += '},'
  });
  fileString += '\n];\n';
  fs.writeFileSync(targetFileName, fileString);
}


function getRoutePath(file) {
  try {
    const fileStr = fs.readFileSync(file);
    // export const PAGE_ROUTE = '/base-information/business/users/+add/:userId';
    const patt = /export const PAGE_ROUTE = [ ]*['"]([^'"]+)['"][;]/gm;
    let isRoutes = false;
    let block = null;
    while ((block = patt.exec(fileStr)) !== null) {
      isRoutes = block[0] && block[1];
      if (isRoutes) {
        return block[1];
      }
    }
    return false;
  } catch (e) {
    return true; // 文件被移除之后，也算他没有PAGE_ROUTE
  }
}

function getPathsAndPathNames(sourceFilePath, targetFileName, filter) {
  filter = filter || function () {
    return true
  };
  const paths = [];
  const pathNames = [];
  const files = globby.sync(sourceFilePath, {ignore: config.pageIgnore, absolute: true});
  if (files && files.length) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const p = filter(file);
      if (p && p !== true) {
        // const filePath = path.relative(targetFileName, file);
        const moduleName = utils.getPathName(file);
        paths.push(p);
        pathNames.push(moduleName);
      }
    }
  }
  return {
    paths: paths,
    pathNames: pathNames,
  }
}
