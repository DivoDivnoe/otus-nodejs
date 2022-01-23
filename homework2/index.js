const path = require('path');
const fs = require('fs');
const events = require('events');
const { initRandomNumbersFile, splitRootFileToSecondarySortedFiles } = require('./core');

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
})().catch(console.error);
