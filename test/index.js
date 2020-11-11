'use strict';

var gulp = require('gulp');
var fs = require('fs');
var path = require('path');
var should = require('should');
var archive = require('../');
var assert = require('stream-assert');
var unzip = require('gulp-unzip');

var fixtures = function (glob) {
    return path.join(__dirname, 'fixtures', glob);
};

describe('gulp-archiver', function() {
    it('should throw, when unsupported archive type', function() {
        (function() {
            archive('foo.bar');
        }).should.throw('Unsupported archive type for gulp-archiver');
    });

    it('should throw, when arguments is missing', function() {
        (function() {
            archive();
        }).should.throw('Missing file option for gulp-archiver');
    });

    it('should throw, when incorrect archive type were passed', function() {
        (function() {
            archive('test');
        }).should.throw('Unsupported archive type for gulp-archiver');

        (function() {
            archive('test.txt');
        }).should.throw('Unsupported archive type for gulp-archiver');
    });

    it('should emit error on streamed file', function (done) {
        gulp.src(fixtures('*'), { buffer: false })
            .pipe(archive('test.zip'))
            .on('error', function (err) {
                err.message.should.eql('Streaming not supported');
                done();
            });
    });

    describe('should not fail if no files were input', function () {
        it('when argument is a string', function(done) {
            var stream = archive('test.zip');
            stream.end();
            done();
        });
    });

    it('should archive one file', function(done) {
        var fixture = fixtures('fixture.txt');

        gulp.src(fixture)
            .pipe(archive('test.zip'))
            // check archive created correct
            .pipe(assert.length(1))
            .pipe(assert.first(function(destFile) {
                destFile.path.should.eql(__dirname + '/fixtures/test.zip');
            }))
            // unzip
            .pipe(unzip())
            // check unzipped result
            .pipe(assert.length(1))
            .pipe(assert.first(function(file) {
                file.path.should.eql('fixture.txt');
                file.contents.toString().should.eql(fs.readFileSync(fixture, {encoding: 'utf8'}));
            }))
            // ok
            .pipe(assert.end(done));
    });

    it('should archive directories', function(done) {
        this.timeout(0);

        gulp.src(fixtures('**'))
            .pipe(archive('test.zip'))
            // check archive created correct
            .pipe(assert.length(1))
            .pipe(assert.first(function(destFile) {
                destFile.path.should.eql(__dirname + '/fixtures/test.zip');
            }))
            // unzip
            .pipe(unzip())
            // check unzipped result
            .pipe(assert.length(4))
            .pipe(assert.nth(0,function(file) {
                const path = 'fixture.txt';
                file.path.should.eql(path);
                file.contents.toString().should.eql(fs.readFileSync(fixtures(path), {encoding: 'utf8'}));
            }))
            .pipe(assert.nth(1,function(file) {
                const path = 'directory/file0.txt';
                file.path.should.eql(path);
                file.contents.toString().should.eql(fs.readFileSync(fixtures(path), {encoding: 'utf8'}));
            }))
            .pipe(assert.nth(2,function(file) {
                const path = 'directory/dir0/file1.txt';
                file.path.should.eql(path);
                file.contents.toString().should.eql(fs.readFileSync(fixtures(path), {encoding: 'utf8'}));
            }))
            .pipe(assert.nth(3,function(file) {
                const path = 'directory/dir0/dir1/file2.txt';
                file.path.should.eql(path);
                file.contents.toString().should.eql(fs.readFileSync(fixtures(path), {encoding: 'utf8'}));
            }))
            // ok
            .pipe(assert.end(done));
    });

    it('should archive directories with option {read: false}', function(done) {
        this.timeout(0);

        gulp.src(fixtures('**'), {read: false})
            .pipe(archive('test.zip'))
            // check archive created correct
            .pipe(assert.length(1))
            .pipe(assert.first(function(destFile) {
                destFile.path.should.eql(__dirname + '/fixtures/test.zip');
            }))
            // unzip
            .pipe(unzip())
            // check unzipped result
            .pipe(assert.length(4))
            .pipe(assert.nth(0,function(file) {
                const path = 'fixture.txt';
                file.path.should.eql(path);
                file.contents.toString().should.eql(fs.readFileSync(fixtures(path), {encoding: 'utf8'}));
            }))
            .pipe(assert.nth(1,function(file) {
                const path = 'directory/file0.txt';
                file.path.should.eql(path);
                file.contents.toString().should.eql(fs.readFileSync(fixtures(path), {encoding: 'utf8'}));
            }))
            .pipe(assert.nth(2,function(file) {
                const path = 'directory/dir0/file1.txt';
                file.path.should.eql(path);
                file.contents.toString().should.eql(fs.readFileSync(fixtures(path), {encoding: 'utf8'}));
            }))
            .pipe(assert.nth(3,function(file) {
                const path = 'directory/dir0/dir1/file2.txt';
                file.path.should.eql(path);
                file.contents.toString().should.eql(fs.readFileSync(fixtures(path), {encoding: 'utf8'}));
            }))
            // ok
            .pipe(assert.end(done));
    });
});
