import getStructure, { buildStrBase } from './script';
import fs from 'fs';

jest.mock('fs');

describe('buildStrBase function', () => {
  describe('constructs correct folder sctructure line', () => {
    it('filename: index.js, isLastFile: false, currentDepth: 0, needStartStr: true', () => {
      const fileName = 'index.js';
      const isLastFile = false;
      const currentDepth = 0;
      const needStartStr = true;

      expect(buildStrBase(fileName, isLastFile, currentDepth, needStartStr)).toEqual('|------index.js');
    });

    it('filename: index.js, isLastFile: true, currentDepth: 1, needStartStr: false', () => {
      const fileName = 'index.js';
      const isLastFile = true;
      const currentDepth = 1;
      const needStartStr = false;

      expect(buildStrBase(fileName, isLastFile, currentDepth, needStartStr)).toEqual('   \\------index.js');
    });
  });
});

describe('getStructure function', () => {
  describe('should construct correct folder structure', () => {
    it('with empty folder structure', () => {
      fs.__setMockFiles({
        current: null
      });

      expect(getStructure('current')).toEqual({
        filesAmount: 0,
        foldersAmount: 0,
        structure: `current\n`
      });
    });

    it('with 1 level structure', () => {
      fs.__setMockFiles({
        'path/file1.js': '',
        'path/file2.js': '',
        'path/somefolder': ''
      });

      expect(getStructure('path')).toEqual({
        filesAmount: 2,
        foldersAmount: 1,
        structure: `path\n|------file1.js\n|------file2.js\n\\------somefolder\n`
      });
    });

    it('with 2 levels structure', () => {
      fs.__setMockFiles({
        'path/to': '',
        'path/to/file1.js': '',
        'path/to/file2.js': '',
        'path/from': '',
        'path/from/file3.js': '',
        'path/from/file4.js': '',
        'path/somefolder': ''
      });

      expect(getStructure('path')).toEqual({
        filesAmount: 4,
        foldersAmount: 3,
        structure: `path\n|------to\n|   |------file1.js\n|   \\------file2.js\n|------from\n|   |------file3.js\n|   \\------file4.js\n\\------somefolder\n`
      });
    });

    it('with 2 levels structure and 1 level limit', () => {
      fs.__setMockFiles({
        'path/to': '',
        'path/to/file1.js': '',
        'path/to/file2.js': '',
        'path/from': '',
        'path/from/file3.js': '',
        'path/from/file4.js': '',
        'path/somefolder': ''
      });

      expect(getStructure('path', 0)).toEqual({
        filesAmount: 0,
        foldersAmount: 3,
        structure: `path\n|------to\n|------from\n\\------somefolder\n`
      });
    });

    it('with file taken instead of directory', () => {
      fs.__setMockFiles({
        'file.js': ''
      });

      expect(getStructure('file.js')).toEqual({
        filesAmount: 0,
        foldersAmount: 0,
        structure: `file.js\n`
      });
    });
  });
  describe('should throw error', () => {
    it('with wrong depth taken', () => {
      fs.__setMockFiles({
        'path/to': '',
        'path/to/file1.js': '',
        'path/to/file2.js': '',
        'path/from': '',
        'path/from/file3.js': '',
        'path/from/file4.js': '',
        'path/somefolder': ''
      });

      expect(() => getStructure('path', -1)).toThrowError('Wrong depth value');
      expect(() => getStructure('path', '1')).toThrowError('Wrong depth value');
    });
  });
});
