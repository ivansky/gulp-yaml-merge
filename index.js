'use strict';

const through = require('through2');
const path = require('path');
const PluginError = require('plugin-error');
const yaml = require('js-yaml');
const merge = require('lodash.merge');
const File = require('vinyl');

module.exports = function (file, opt) {
  if (!file) {
    throw new PluginError('gulp-yaml-merge', 'Missing file option for gulp-yaml-merge');
  }

  opt = opt || {};

  let loadOptions = opt.load || {};
  const dumpOptions = opt.dump || {};

  let latestFile;
  let outData = {};

  if (typeof file !== 'string' && typeof file.path !== 'string') {
    throw new PluginError('gulp-yaml-merge', 'Missing path in file options for gulp-yaml-merge');
  }

  function bufferContents(file, enc, cb) {
    // ignore empty files
    if (file.isNull()) {
      cb();
      return;
    }

    // we don't do streams (yet)
    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-yaml-merge', 'Streaming not supported'));
      cb();
      return;
    }

    latestFile = file;

    // pass file path for yaml error handler
    loadOptions = merge(loadOptions, { filename: file.path });

    try {
      const data = yaml.safeLoad(file.contents, loadOptions);

      outData = merge(outData, data);
    } catch (err) {
      this.emit('error', new PluginError('gulp-yaml-merge', err));
    }

    cb();
  }

  function endStream(cb) {
    let outFile;

    if (typeof file === 'string') {
      outFile = latestFile.clone({ contents: false });
      outFile.path = path.join(latestFile.base, file);
    } else {
      outFile = new File(file);
    }

    outFile.contents = Buffer.from(yaml.safeDump(outData, dumpOptions));

    this.push(outFile);

    cb();
  }

  return through.obj(bufferContents, endStream);
};