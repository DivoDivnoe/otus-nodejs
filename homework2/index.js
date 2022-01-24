const path = require('path');
const fs = require('fs');

const {
  initRandomNumbersFile,
  splitRootFileToSecondarySortedFiles,
  writeChunktoWritableStream,
  sortedNumbersGenerator
} = require('./core');

const BYTES_PER_MEGABYTE = 10 ** 6;
const MAIN_FILE_SIZE = 100 * BYTES_PER_MEGABYTE;
const SECONDARY_FILES_AMOUNT = 7;
const MAIN_FILE_NAME = 'numbers.txt';

(async () => {
  const mainFilePath = path.join(__dirname, MAIN_FILE_NAME);

  // create 100mb file with random numbers
  await initRandomNumbersFile(mainFilePath, MAIN_FILE_SIZE);
  process.stdout.write('main file initialized\n', 'utf8');

  // split main file into 7 separate files with sorted numbers
  await splitRootFileToSecondarySortedFiles(mainFilePath, SECONDARY_FILES_AMOUNT);
  process.stdout.write(`main file is splited to ${SECONDARY_FILES_AMOUNT} temp files\n`, 'utf8');

  const outputFilePath = path.join(__dirname, `numbers_sorted.txt`);
  const writable = fs.createWriteStream(outputFilePath);
  const paths = Array.from({ length: SECONDARY_FILES_AMOUNT }, (_, index) => {
    return path.join(__dirname, `numbers_${index}.txt`);
  });
  const readables = paths.map(path => fs.createReadStream(path, { encoding: 'utf8' }));

  // outputs string line with min number from several readable streams
  const sortedNumbersIterator = sortedNumbersGenerator(readables);

  for await (const line of sortedNumbersIterator) {
    await writeChunktoWritableStream(line, writable);
  }

  writable.end();
  process.stdout.write('result file with sorted numbers is ready\n', 'utf8');

  // delete temp files
  paths.forEach(fs.unlinkSync);
  process.stdout.write('temp files removed\n', 'utf8');
})().catch(console.error);
