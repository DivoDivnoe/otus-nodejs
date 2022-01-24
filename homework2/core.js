const events = require('events');
const fs = require('fs');
const { getRandomNumber, mergeSort } = require('./utils');

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

async function* chunkGenerator(stream) {
  for await (const chunk of stream) {
    yield chunk;
  }
}

async function* sortedNumbersGenerator(streams) {
  const generators = streams.map(chunkGenerator);
  const data = Array.from({ length: streams.length }, () => null);
  const extras = Array.from({ length: streams.length }, () => '');

  for (let streamIndex = 0; streamIndex < streams.length; streamIndex++) {
    const generator = generators[streamIndex];
    let chunk = (await generator.next()).value;
    chunk = `${extras[streamIndex]}${chunk}`;

    let items = chunk.split('\n');
    extras[streamIndex] = items.splice(-1, 1)[0];
    items = items.map(str => parseInt(str, 10));

    data[streamIndex] = items;
  }

  while (data.some(item => item.length)) {
    const currentItems = data.map((dataItems, dataIndex) => {
      return dataItems[0];
    });

    const minItem = Math.min(...currentItems.filter(item => item !== undefined));
    const minIndex = currentItems.indexOf(minItem);
    data[minIndex].shift();

    delete currentItems;

    yield `${minItem}\n`;

    if (!data[minIndex].length) {
      let chunk = (await generators[minIndex].next()).value;

      chunk = `${extras[minIndex]}${chunk || ''}`;

      let items = chunk.split('\n');
      extras[minIndex] = items.length > 1 ? items.splice(-1, 1)[0] : '';
      items = items.filter(item => item.length).map(str => parseInt(str, 10));

      data[minIndex] = items;
    }
  }
}

module.exports = {
  initRandomNumbersFile,
  splitRootFileToSecondarySortedFiles,
  writeChunktoWritableStream,
  chunkGenerator,
  sortedNumbersGenerator
};
