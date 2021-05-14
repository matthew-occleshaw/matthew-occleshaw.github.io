const { readFileSync } = require('fs');
const { src, dest, task, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const terser = require('gulp-terser');
const cheerio = require('gulp-cheerio');
const webp = require('gulp-webp');
const flatten = require('gulp-flatten');
const browsersync = require('browser-sync').create();

// Path Object
const path = {
  scss: 'src/scss/*.scss',
  html: {
    all: 'src/html/**/*.html',
    content: 'src/html/content/*',
    component: {
      all: 'src/html/components/*',
      header: 'src/html/components/header.html',
      footer: 'src/html/components/footer.html',
    },
  },
  js: 'src/js/*.js',
  image: {
    all: 'src/images/*',
    toWebp: 'src/images/*.{png,jpg}',
    copy: ['src/images/*', '!src/images/*.{png,jpg}'],
  },
};

// Sass Task
function scssTask() {
  return src(path.scss, { sourcemaps: true })
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(dest('dist', { sourcemaps: '.' }));
}

// JavaScript Task
function jsTask() {
  return src(path.js, { sourcemaps: true })
    .pipe(terser())
    .pipe(dest('dist', { sourcemaps: '.' }));
}

// HTML Task
function htmlTask() {
  let header = readFileSync(path.html.component.header, 'utf8');
  let footer = readFileSync(path.html.component.footer, 'utf8');

  return src(path.html.content)
    .pipe(flatten())
    .pipe(
      cheerio(($, file) => {
        $('header').html(header);
        $('footer').html(footer);
        let title = $('title').text();
        $('#page-title').html(title);
        $(`#${title.toLowerCase()}-navbar-button`).addClass('active');
      })
    )
    .pipe(dest('dist'));
}

// Image Tasks
const imageTask = parallel(webpTask, copyImageTask);

function webpTask() {
  return src(path.image.toWebp)
    .pipe(webp({ quality: 100 }))
    .pipe(dest('dist'));
}

function copyImageTask() {
  return src(path.image.copy).pipe(dest('dist'));
}

// Browsersync Tasks
function browsersyncServe(cb) {
  browsersync.init({
    server: {
      baseDir: 'dist',
    },
    open: false,
  });
  cb();
}

function browsersyncReload(cb) {
  browsersync.reload();
  cb();
}

// Watch Task
function watchTask() {
  watch(path.html.all, series(htmlTask, browsersyncReload));
  watch(path.scss, series(scssTask, browsersyncReload));
  watch(path.js, series(jsTask, browsersyncReload));
  watch(path.image.all, series(imageTask, browsersyncReload));
}

// Default Gulp Task
exports.default = series(
  htmlTask,
  scssTask,
  jsTask,
  imageTask,
  browsersyncServe,
  watchTask
);
