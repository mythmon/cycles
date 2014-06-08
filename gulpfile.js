// Include gulp
var gulp = require('gulp');
var traceur = require('gulp-traceur');
var htmlSrc = require('gulp-html-src');
var ghPages = require("gulp-gh-pages");

function errors(err) {
  this.end();
  console.error(err.toString());
}

// Watch Files For Changes
gulp.task('watch', ['build'], function() {
  gulp.watch('src/*.js', ['build']);
});

gulp.task('build', function () {
  gulp.src('index.html')
    .pipe(htmlSrc())
    .pipe(gulp.dest('dist'));
  gulp.src('src/**/*.js')
    .pipe(traceur({modules: 'instantiate'})).on('error', errors)
    .pipe(gulp.dest('dist/src'));
  gulp.src('{index.html,style.css}')
    .pipe(gulp.dest('dist'));
});

gulp.task('deploy', ['build'], function() {
  gulp.src('dist/**/*')
    .pipe(ghPages());
});

// Default Task
gulp.task('default', ['buld']);
