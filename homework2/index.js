const path = require('path');
const fs = require('fs');
const events = require('events');
const {
  initRandomNumbersFile,
  splitRootFileToSecondarySortedFiles,
  writeChunktoWritableStream,
  chunkGenerator
} = require('./core');

const BYTES_PER_MEGABYTE = 10 ** 6;
const MAIN_FILE_SIZE = 100 * BYTES_PER_MEGABYTE;
const SECONDARY_FILES_AMOUNT = 7;
const MAIN_FILE_NAME = 'numbers.txt';

(async () => {
  const mainFilePath = path.join(__dirname, MAIN_FILE_NAME);

  await initRandomNumbersFile(mainFilePath, MAIN_FILE_SIZE);

  console.log('main file inited');

  await splitRootFileToSecondarySortedFiles(mainFilePath, SECONDARY_FILES_AMOUNT);

  console.log('splited');

  const outputFilePath = path.join(__dirname, `numbers_result.txt`);
  const paths = Array.from({ length: SECONDARY_FILES_AMOUNT }, (_, index) =>
    path.join(__dirname, `numbers_${index}.txt`)
  );
  const data = Array.from({ length: SECONDARY_FILES_AMOUNT }, () => null);
  const extras = Array.from({ length: SECONDARY_FILES_AMOUNT }, () => '');
  const indexes = [];

  const writable = fs.createWriteStream(outputFilePath);

  const generators = Array.from({ length: SECONDARY_FILES_AMOUNT }, (_, index) => {
    const readable = fs.createReadStream(paths[index], { encoding: 'utf8' });

    return chunkGenerator(readable);
  });

  for (let streamIndex = 0; streamIndex < generators.length; streamIndex++) {
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

    await writeChunktoWritableStream(`${minItem}\n`, writable);

    if (!data[minIndex].length) {
      let chunk = (await generators[minIndex].next()).value;

      chunk = `${extras[minIndex]}${chunk || ''}`;

      let items = chunk.split('\n');
      extras[minIndex] = items.length > 1 ? items.splice(-1, 1)[0] : '';
      items = items.filter(item => item.length).map(str => parseInt(str, 10));

      data[minIndex] = items;
      indexes[minIndex] = 0;
    }
  }

  writable.end();
})().catch(console.error);
