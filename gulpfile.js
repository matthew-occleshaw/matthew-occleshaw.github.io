const { readFileSync } = require('fs');
const { src, dest, task, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const terser = require('gulp-terser');
const cheerio = require('gulp-cheerio');
const webp = require('gulp-webp');
const mergeStream = require('merge-stream');
const browsersync = require('browser-sync').create();

// Path Object
const path = {
  scss: 'src/scss/*.scss',
  html: {
    all: 'src/html/**/*.html',
    content: {
      all: 'src/html/content/*',
      index: 'src/html/content/index.html',
      other: ['src/html/content/*', '!src/html/content/index.html'],
    },
    component: {
      all: 'src/html/components/*',
      head: 'src/html/components/head.html',
      header: 'src/html/components/header.html',
      footer: 'src/html/components/footer.html',
      scripts: 'src/html/components/scripts.html',
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
  let head = readFileSync(path.html.component.head, 'utf8');
  let header = readFileSync(path.html.component.header, 'utf8');
  let footer = readFileSync(path.html.component.footer, 'utf8');
  let scripts = readFileSync(path.html.component.scripts, 'utf8');

  return mergeStream(
    src(path.html.content.index, { nodir: true })
      .pipe(injectHtml(head, header, footer, scripts))
      .pipe(dest('.')),
    src(path.html.content.other, { nodir: true })
      .pipe(injectHtml(head, header, footer, scripts))
      .pipe(dest('dist'))
  );
}

function injectHtml(head, header, footer, scripts) {
  return cheerio(($, file) => {
    let title = $('head').data('title');
    let description = $('head').data('description');
    $('head').html('\n' + head);
    $('title').html('\n' + title);
    $('meta[name="description"]').attr('content', description);
    $('header').html('\n' + header);
    $('footer').html('\n' + footer);
    $('body').append(scripts);
    $('#page-title').html(title);
    $(`#${title.toLowerCase()}-navbar-button`).addClass('active');
  });
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
      baseDir: '.',
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

// Gulp Tasks
exports.default = series(
  parallel(htmlTask, scssTask, jsTask, imageTask),
  browsersyncServe,
  watchTask
);
exports.watch = series(browsersyncServe, watchTask);
exports.build = parallel(htmlTask, scssTask, jsTask, imageTask);
