const path = require('path');
const fs = require('fs');
const events = require('events');
const {
  initRandomNumbersFile,
  splitRootFileToSecondarySortedFiles,
  writeChunktoWritableStream,
  chunkGenerator,
  sortedNumbersGenerator
} = require('./core');

const BYTES_PER_MEGABYTE = 10 ** 6;
const MAIN_FILE_SIZE = 100 * BYTES_PER_MEGABYTE;
const SECONDARY_FILES_AMOUNT = 7;
const MAIN_FILE_NAME = 'numbers.txt';

(async () => {
  const mainFilePath = path.join(__dirname, MAIN_FILE_NAME);

  await initRandomNumbersFile(mainFilePath, MAIN_FILE_SIZE);

  console.log('main file initialized');

  await splitRootFileToSecondarySortedFiles(mainFilePath, SECONDARY_FILES_AMOUNT);

  console.log(`main file is splited to ${SECONDARY_FILES_AMOUNT} temp files`);

  const outputFilePath = path.join(__dirname, `numbers_sorted.txt`);
  const writable = fs.createWriteStream(outputFilePath);

  const readables = Array.from({ length: SECONDARY_FILES_AMOUNT }, (_, index) => {
    return fs.createReadStream(path.join(__dirname, `numbers_${index}.txt`), { encoding: 'utf8' });
  });

  const sortGenerator = sortedNumbersGenerator(readables);

  for await (const chunk of sortGenerator) {
    await writeChunktoWritableStream(chunk, writable);
  }

  writable.end();
})().catch(console.error);
