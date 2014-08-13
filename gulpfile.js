var browserify = require('browserify');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var connect = require('gulp-connect');
var source = require('vinyl-source-stream');
var verb = require("gulp-verb");
var deploy = require("gulp-gh-pages");

var packageJson = require('./package.json');
var libName = packageJson.exports || packageJson.name;
var exports =  packageJson.exports;
var dependencies = Object.keys(packageJson && packageJson.dependencies || {});

// compiles dependencies outside the package for code coverage
gulp.task('dependencies', function () {
  return browserify()
    .require(dependencies)
    .bundle()
    .pipe(source('dependencies.js'))
    .pipe(gulp.dest('./tests/'));
});

// browserify the lib without its dependencies
gulp.task('lib', function () {
  return browserify('./index.js')
    .external(dependencies)
    .bundle({ standalone : libName})
    .pipe(source('lib.js'))
    .pipe(gulp.dest('./tests/'));
});

// browserify the module with all its dependencies
gulp.task('standalone', function () {
  return browserify('./index.js')
    .bundle({ standalone : libName})
    .pipe(source(packageJson.name + '.js'))
    .pipe(gulp.dest('./'));
});

// uglifies the browserified package
gulp.task('uglify', function() {
  return browserify('./index.js')
    .bundle()
    .pipe(source(packageJson.name + '.min.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./'));
});

// dev server for testing
gulp.task('connectDev', function () {
  connect.server({
    root: ['./'],
    port: 9001,
    livereload: false
  });
});

// automatic readme generation
gulp.task('verb-docs', function () {
  gulp.src(['docs/README.tmpl.md'])
    .pipe(verb({
      dest: 'README.md',
      jsstart : '```js',
      jsend : '```'
    }))
    .pipe(gulp.dest('./'));
});

// automatic gh-pages generation
gulp.task('verb-gh-pages', function () {

  var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

  var today = new Date();
  var day = today.getDate();
  var month = months[today.getMonth()];
  var year = today.getUTCFullYear();

  gulp.src('./docs/css/main.css', {base: './docs/'})
    .pipe(gulp.dest('./gh-pages/'));

  gulp.src('./docs/css/fonts/*', {base: './docs/'})
    .pipe(gulp.dest('./gh-pages/'));

  gulp.src(['./docs/index.tmpl.html'])
    .pipe(verb({
      name: libName,
      repo: packageJson.repository.url,
      updated: [day, month, year].join('/'),
      dest: 'index.html',
      jsstart : '<script>',
      jsend : '</script>'
    }))
    .pipe(gulp.dest('./gh-pages'))
    .pipe(deploy(packageJson.repository.url));
});

// Tasks
// -----
gulp.task('default', ['standalone', 'uglify']);

gulp.task('watch', function() {
  gulp.watch("./", ['dependencies', 'lib']);
});

gulp.task('test', ['dependencies', 'lib', 'connectDev' , 'watch']);

gulp.task('docs', ['verb-docs']);

gulp.task('gh-pages', ['verb-gh-pages']);
