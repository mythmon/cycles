// Include gulp
var gulp = require('gulp');
var traceur = require('gulp-traceur');

// Watch Files For Changes
gulp.task('watch', ['compile'], function() {
  gulp.watch('src/*.js', ['compile']);
});

function errors(err) {
  this.end();
  console.error(err.toString());
}

gulp.task('compile', function () {
  return gulp.src('src/*.js').on('error', errors)
  .pipe(traceur({modules: 'instantiate', sourceMap: true})).on('error', errors)
  .pipe(gulp.dest('dist')).on('error', errors);
});

// Default Task
gulp.task('default', ['compile']);
