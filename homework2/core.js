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

const splitRootFileToSecondaryFiles = async (rootPath, filesAmount) => {
  const secondaryFileSize = fs.statSync(rootPath).size / filesAmount;
  const readable = fs.createReadStream(rootPath, { encoding: 'utf8' });

  let currentFile = 0;
  let currentPath = `numbers_${currentFile}.txt`;
  let writable = fs.createWriteStream(currentPath);

  for await (let chunk of readable) {
    if (fs.statSync(currentPath).size >= secondaryFileSize) {
      if (currentFile < filesAmount - 1) {
        currentFile++;
        currentPath = `numbers_${currentFile}.txt`;

        const items = chunk.split('\n');
        const extra = `${items.splice(0, 1)[0]}\n`;
        chunk = items.join('\n');

        delete items;

        writable.write(extra, 'utf8');
        writable.end();

        writable = fs.createWriteStream(currentPath);
      }
    }

    await writeChunktoWritableStream(chunk, writable);
  }

  writable.end();
};

const sortFile = async filePath => {
  const readable = fs.createReadStream(filePath, { encoding: 'utf8' });

  let data = [];
  let extra = '';

  for await (let chunk of readable) {
    chunk = `${extra}${chunk}`;
    let items = chunk.split('\n');
    extra = items.splice(-1, 1)[0];
    items = items.map(item => parseInt(item, 10));

    delete items;

    data.push(...items.map(item => parseInt(item, 10)));
  }

  data = mergeSort(data);

  console.log('data is read and sorted');

  readable.destroy();

  const writable = fs.createWriteStream(filePath);

  // while (data.length) {
  //   await writeChunktoWritableStream(`${data.shift()}\n`, writable);
  // }

  writable.write(data.join('\n'), 'utf8');
  console.log('data is written');
  writable.end();

  delete data;
};

module.exports = {
  initRandomNumbersFile,
  splitRootFileToSecondaryFiles,
  sortFile
};
