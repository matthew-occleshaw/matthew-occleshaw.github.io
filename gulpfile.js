const gulp = require('gulp');
const gulpSass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');

function sass (cb) {
  return gulp.src('styles/scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(gulpSass())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('styles/css/'));
  cb()
};

exports.sass = sass;
