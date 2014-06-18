// Include gulp
var gulp = require('gulp');
var traceur = require('gulp-traceur');
var htmlSrc = require('gulp-html-src');
var ghPages = require("gulp-gh-pages");
var browserify = require('gulp-browserify');
var rm = require('gulp-rm');

function errors(err) {
  console.error(err.toString());
  this.end();
}

gulp.task('default', ['build']);

gulp.task('watch', function() {
  gulp.watch(['src/*.js', 'index.html', 'style.css'], ['build']);
});

gulp.task('build', [
  'build.copy',
  'build.traceur',
  'build.browserify',
  'build.vendor',
]);

gulp.task('build.copy', function() {
  return gulp.src(['index.html', 'style.css'])
    .pipe(gulp.dest('dist'));
});

gulp.task('build.vendor', function() {
  return gulp.src('index.html')
    .pipe(htmlSrc())
    .pipe(gulp.dest('dist'));
});

gulp.task('build.traceur', function() {
  return gulp.src('src/**/*.js')
    .pipe(traceur({modules: 'commonjs'}))
    .pipe(gulp.dest('build/src'));
});

gulp.task('build.browserify', ['build.traceur'], function() {
  return gulp.src('build/src/app.js')
    .pipe(browserify({debug: true}))
    .pipe(gulp.dest('dist'));
});

gulp.task('deploy', ['build'], function() {
  return gulp.src('dist/**/*')
    .pipe(ghPages());
});

gulp.task('clean', function() {
  return gulp.src(['dist/**/*', 'build/**/*'])
    .pipe(rm());
});
