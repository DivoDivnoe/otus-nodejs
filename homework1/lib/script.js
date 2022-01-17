import fs from 'fs';
import path from 'path';

const DEFAULT_STR = '------';
const SPACE = '   ';
const FINAL_STR = '\\';
const START_STR = '|';

const buildStrBase = (name, index, listLength, currentDepth, needStartStr = true) => {
  let str = '';

  if (needStartStr) {
    str = !currentDepth && index === listLength - 1 ? FINAL_STR : START_STR;
  }

  str += `${Array.from({ length: currentDepth }, () => SPACE).join('')}`;

  if (currentDepth > 0) {
    str += index < listLength - 1 ? START_STR : FINAL_STR;
  }

  str += `${DEFAULT_STR}${name}`;

  return str;
};

const getStructure = (directory, depth = Infinity) => {
  if (!(depth === Infinity || (Number.isInteger(depth) && depth >= 0))) {
    throw new Error('Wrong depth value');
  }

  const normalized = path.resolve(directory);
  const relativePath = path.parse(normalized).base;
  const stat = fs.lstatSync(directory);

  let foldersAmount = 0,
    filesAmount = 0,
    needStartStr = true;

  if (!stat.isDirectory()) {
    filesAmount++;
    return { structure: relativePath, filesAmount, foldersAmount };
  }

  const getDirStructure = (dir, currentDepth = 0) => {
    if (currentDepth > depth) return '';

    const files = fs.readdirSync(dir);
    let result = '';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const curPath = path.join(dir, file);
      const stat = fs.lstatSync(curPath);

      let str = buildStrBase(file, i, files.length, currentDepth, needStartStr);

      if (!currentDepth && i === files.length - 1) {
        needStartStr = false;
      }

      if (stat.isDirectory()) {
        foldersAmount++;
        result += `${str}\n${getDirStructure(curPath, currentDepth + 1)}`;
      } else {
        filesAmount++;
        result += `${str}\n`;
      }
    }

    return result;
  };

  const structure = `${relativePath}\n${getDirStructure(directory)}`;

  return { structure, foldersAmount, filesAmount };
};

export default getStructure;
