'use strict';

var path = require('path');
var PluginError = require('plugin-error');
var Vinyl = require('vinyl');
var through = require('through2');
var archiver = require('archiver');
var concatStream = require('concat-stream');

function getArchiveTypeFromFile(path)
{
    const supported = ["zip", "tar", "tar.gz", "tgz"];
    for (let extension of supported) {
        let re = new RegExp(extension + '$');
        if (re.test(path)) {
            return extension;
        }
    }

    throw new PluginError('gulp-archiver', 'Unsupported archive type for gulp-archiver');
}

module.exports = function (file, opts) {
    if (typeof file !== 'string' || file.length === 0) {
        throw new PluginError('gulp-archiver', 'Missing file option for gulp-archiver');
    }

    var firstFile,
        archiveType = getArchiveTypeFromFile(file),
        archive = archiver.create(archiveType, opts || {});

    return through.obj(function(file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new PluginError('gulp-archiver',  'Streaming not supported'));
            cb();
            return;
        }

        if (!firstFile) {
            firstFile = file;
        }

        // file.relative is an empty string on the base directory.
        if (file.relative) {
            if (file.isDirectory()) {
                archive.append(null, {name: file.relative, type: "directory"});
            } else if (file.isSymbolic()) {
                archive.symlink(file.relative, file.symlink);
            } else {
                archive.append(file.contents, {name: file.relative, type: "file"});
            }
        }

        cb();
    }, function(cb) {
        if (!firstFile) {
            cb();
            return;
        }

        archive.finalize();
        archive.pipe(concatStream(function(data) {
            this.push(new Vinyl({
                cwd: firstFile.cwd,
                base: firstFile.base,
                path: path.join(firstFile.base, file),
                contents: data
            }));

            cb();
        }.bind(this)));
    });
};
