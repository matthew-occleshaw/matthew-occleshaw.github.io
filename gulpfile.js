const { readFileSync } = require('fs');
const { src, dest, task, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const terser = require('gulp-terser');
const cheerio = require('gulp-cheerio');
const webp = require('gulp-webp');
const browsersync = require('browser-sync').create();
const prettier = require('gulp-prettier');
const concat = require('gulp-concat');
const rename = require('gulp-rename');

// Path Object
const path = {
  scss: 'src/scss/*.scss',
  html: {
    all: 'src/html/**/*.html',
    content: {
      all: 'src/html/content/*.html',
      index: 'src/html/content/index.html',
      other: ['src/html/content/*.html', '!src/html/content/index.html'],
    },
    component: {
      all: 'src/html/components/*.html',
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
    .pipe(concat('main.js', { newLine: '' }))
    .pipe(dest('dist', { sourcemaps: '.' }));
}

// HTML Task
function htmlTask() {
  let head = readFileSync(path.html.component.head, 'utf8');
  let header = readFileSync(path.html.component.header, 'utf8');
  let footer = readFileSync(path.html.component.footer, 'utf8');
  let scripts = readFileSync(path.html.component.scripts, 'utf8');

  return src(path.html.content.all, { nodir: true })
    .pipe(
      cheerio(($, file) => {
        let head_attrs = $('head').attr();
        let title = head_attrs['data-title'];
        let description = head_attrs['data-description'];
        head_attrs['data-title'] = null;
        head_attrs['data-description'] = null;
        $('head').html(head);
        $('title').html(title);
        $('meta[name="description"]').attr('content', description);
        $('head').attr(head_attrs);
        $('header').html(header);
        $('footer').html(footer);
        $('body').append(scripts);
        $('#page-title').html(title);
        $(`#${title.toLowerCase()}-navbar-button`).addClass('active');
      })
    )
    .pipe(prettier(prettierOptions))
    .pipe(
      rename((path) => {
        if (path.basename == 'index') {
          path.dirname = '..';
        }
      })
    )
    .pipe(dest('dist'));
}

const prettierOptions = {
  singleQuote: true,
  arrowParens: 'always',
  semi: true,
  trailingComma: 'es5',
};

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

// Build Task
const buildTask = parallel(htmlTask, scssTask, jsTask, imageTask);

// Gulp Tasks
exports.default = series(buildTask, browsersyncServe, watchTask);
exports.watch = series(browsersyncServe, watchTask);
exports.build = buildTask;
