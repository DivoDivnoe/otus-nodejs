const events = require('events');
const fs = require('fs');
const stream = require('stream');
const { getRandomNumber, mergeSortedArrays, mergeSort } = require('./utils');

const writeChunktoWritableStream = async (chunk, writable) => {
  if (!writable.write(chunk, 'utf8')) {
    await events.once(writable, 'drain');
  }
};

const initRandomNumbersFile = async (path, size) => {
  if (fs.existsSync(path) && fs.statSync(path).size >= size) return;

  const writable = fs.createWriteStream(path);

  do {
    const random = `${getRandomNumber()}\n`;

    await writeChunktoWritableStream(random, writable);
  } while (fs.statSync(path).size < size);

  writable.end();
};

const splitRootFileToSecondarySortedFiles = async (rootPath, filesAmount) => {
  const secondaryFileSize = fs.statSync(rootPath).size / filesAmount;
  const readable = fs.createReadStream(rootPath, { encoding: 'utf8' });

  let currentFile = 0;
  let currentPath = `numbers_${currentFile}.txt`;
  let writable = fs.createWriteStream(currentPath);

  let data = [];
  let extra = '';
  let size = 0;

  for await (let chunk of readable) {
    if (size >= secondaryFileSize) {
      if (currentFile < filesAmount - 1) {
        currentFile++;
        currentPath = `numbers_${currentFile}.txt`;

        data = mergeSort(data);

        writable.write(data.join('\n'), 'utf8');
        writable.end();

        writable = fs.createWriteStream(currentPath);
        data = [];
        size = 0;
      }
    }

    chunk = `${extra}${chunk}`;
    let items = chunk.split('\n');
    extra = items.splice(-1, 1)[0];
    items = items.map(item => parseInt(item, 10));

    delete items;

    data.push(...items.map(item => parseInt(item, 10)));
    size += items.join('\n').length;
  }

  data = mergeSort(data);
  writable.write(data.join('\n'), 'utf8');
  writable.end();
};

module.exports = {
  initRandomNumbersFile,
  splitRootFileToSecondarySortedFiles
};
