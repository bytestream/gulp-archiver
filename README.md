# gulp-archiver

Archive anything through gulp

## Install

```
npm install @bytestream/gulp-archiver --save
```

## Usage

```js
var gulp = require('gulp');
var archiver = require('@bytestream/gulp-archiver');

gulp.task('default', function () {
	return gulp.src('src/**')
		.pipe(archiver('archive.zip'))
		.pipe(gulp.dest('./dist'));
});
```

Plugin uses [archiver](https://www.npmjs.org/package/archiver) npm package to make archive. 

## API

### archiver(filename[, options])

#### filename

*Required*
Type: `String`

Result archive file name.

#### options

Type: `Object`

Described in original [archiver](https://github.com/archiverjs/node-archiver#zip) repository
