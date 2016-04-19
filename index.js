'use strict';

var through = require('through2');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var yaml = require('js-yaml');
var merge = require('lodash.merge');
var File = gutil.File;

module.exports = function (file, opt) {
  if (!file) {
    throw new PluginError('gulp-yaml-merge', 'Missing file option for gulp-yaml-merge');
  }

  opt = opt || {};

  var loadOptions = opt.load || {};
  var dumpOptions = opt.dump || {};

  var latestFile;
  var outData = {};

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
    loadOptions = merge(loadOptions, {filename: file.path});
    
    try {
      var data = yaml.safeLoad(file.contents, loadOptions);
    } catch(err) {
      this.emit('error', new PluginError('gulp-yaml-merge', err));
      cb();
      return;
    }

    outData = merge(outData, data);

    cb();
  }

  function endStream(cb) {
    var outFile;

    if (typeof file === 'string') {
      outFile = latestFile.clone({contents: false});
      outFile.path = path.join(latestFile.base, file);
    } else {
      outFile = new File(file);
    }

    outFile.contents = new Buffer(yaml.safeDump(outData, dumpOptions));

    this.push(outFile);

    cb();
  }

  return through.obj(bufferContents, endStream);
};