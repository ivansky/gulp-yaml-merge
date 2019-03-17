'use strict';

var fs = require('fs');
var through = require('through2');
var assert = require('assert');
var File = require('vinyl');
var gulp = require('gulp');

var yamlMerge = require('../index.js');

require('mocha');
require('should');

function streamifyString() {
    var args = arguments || [];

    var stream = through.obj(function (data, enc, next) {
        this.push(data);
        next();
    });

    setTimeout(function(){
        for(var i = 0; i < args.length; i++) {
            stream.push(new File({
                cwd: "",
                path: i.toString(),
                contents: Buffer.from(args[i], 'utf8')
            }));
        }
        stream.end();
    }, 0);

    return stream;
}

var a = '\
deep:\n\
  a:\n\
    aa: 2\n\
    ab: 1\n\
  b:\n\
    ba: 3\n\
    bb: 4\n\
product: \n\
  - sku: A \n\
    quantity: 1 \n\
    description: First \n\
    price: 100 \n\
  - sku: B \n\
    quantity: 2 \n\
    description: Second \n\
    price: 200 \n\
';

var b = '\
deep:\n\
  a:\n\
    aa: 1\n\
    ab: 2\n\
  b:\n\
    bc: 5\n\
  c:\n\
    ba: 6\n\
    bb: 7\n\
product: \n\
  - sku: C \n\
    quantity: 3 \n\
    description: Third \n\
    price: 300 \n\
';

var c = '\
deep:\n\
  a:\n\
    aa: 1\n\
    ab: 2\n\
  b:\n\
    ba: 3\n\
    bb: 4\n\
    bc: 5\n\
  c:\n\
    ba: 6\n\
    bb: 7\n\
product:\n\
  - sku: C\n\
    quantity: 3\n\
    description: Third\n\
    price: 300\n\
  - sku: B\n\
    quantity: 2\n\
    description: Second\n\
    price: 200\n\
';

describe('gulp-yaml-merge', function() {

    describe('yamlMerge', function() {

        it('should throw, when arguments is missing', function() {
            (function(){
                yamlMerge();
            }).should.throw('Missing file option for gulp-yaml-merge');
        });

        it('should concat multiple file', function(done) {
            var stream = streamifyString(a, b).pipe(yamlMerge('./tmp/v.yaml'));

            stream.on('data', function(file) {
                file.contents.toString('utf8').should.equal(c);
                done();
            });
        });

    });

});