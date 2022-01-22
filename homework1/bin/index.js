#!/usr/bin/env node
import getStructure from '../lib/script.js';

const DEFAULT_DEPTH = Infinity;
const depthOptionsList = ['--depth', '-d'];

const args = process.argv.splice(2);

let depth = DEFAULT_DEPTH;
const [directory, option, value] = args;

if (depthOptionsList.includes(option)) {
  depth = +value;
}

const { structure, foldersAmount, filesAmount } = getStructure(directory, depth);
console.log(`${structure}\n${foldersAmount} directories, ${filesAmount} files`);
