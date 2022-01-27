import path from 'path';

const fs = jest.createMockFromModule('fs');

const isDir = curPath => {
  const normalized = path.resolve(curPath);
  const parsedPath = path.parse(normalized);

  return !parsedPath.ext.length;
};

let mockFiles = Object.create(null);

const __setMockFiles = newMockFiles => {
  mockFiles = Object.create(null);

  for (const file in newMockFiles) {
    const dir = path.dirname(file);

    if (!mockFiles[dir]) {
      mockFiles[dir] = [];
    }

    mockFiles[dir].push(path.basename(file));
  }
};

const readdirSync = directoryPath => {
  return mockFiles[directoryPath] || [];
};

const lstatSync = curPath => {
  return {
    isDirectory() {
      return isDir(curPath);
    }
  };
};

fs.__setMockFiles = __setMockFiles;
fs.readdirSync = readdirSync;
fs.lstatSync = lstatSync;

module.exports = fs;
