const { readFileSync } = require('fs');
const { src, dest, watch, series, parallel } = require('gulp');
const del = require('del');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const terser = require('gulp-terser');
const cheerio = require('gulp-cheerio');
const webp = require('gulp-webp');
const browsersync = require('browser-sync').create();
const prettier = require('gulp-prettier');
const rename = require('gulp-rename');

// Path Object
const path = {
  output: {
    dirs: ['./*', '!{dist,node_modules,src}'],
    files: ['dist/**', 'index.html'],
  },
  scss: 'src/scss/*.scss',
  html: {
    all: 'src/**/*.html',
    content: {
      all: ['src/**/*.html', '!src/components/*.html'],
      allFolders: ['src/*', '!src/{components,images,js,scss}'],
      index: 'src/index/index.html',
      other: [
        'src/**/*.html',
        '!src/index/index.html',
        '!src/components/*.html',
      ],
    },
    component: {
      all: 'src/components/*.html',
      head: 'src/components/head.html',
      header: 'src/components/header.html',
      footer: 'src/components/footer.html',
      scripts: 'src/components/scripts.html',
    },
  },
  js: ['src/js/*.js', 'src/**/*.js'],
  image: {
    toWebp: ['src/images/*.{png,jpg}', 'src/**/*.{png,jpg}'],
    copy: ['src/images/*.{svg,gif}', 'src/**/*.{svg,gif}'],
  },
};

// Clean Task
async function cleanTask() {
  return Promise.all([
    del(path.output.dirs, { dryRun: false, onlyDirectories: true }),
    del(path.output.files, { dryRun: false }),
  ]);
}

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

  return src(path.html.content.all)
    .pipe(
      cheerio(($, file) => {
        if (typeof $('html').data('ignore') === 'undefined') {
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
        }
      })
    )
    .pipe(prettier(prettierOptions))
    .pipe(
      rename((path) => {
        if (path.dirname == 'index') {
          path.dirname = '.';
        } else {
          path.basename = 'index';
        }
      })
    )
    .pipe(dest('.'));
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
    .pipe(dest('dist/img'));
}

function copyImageTask() {
  return src(path.image.copy).pipe(dest('dist/img'));
}

// Browsersync Tasks
function browsersyncServe(cb) {
  browsersync.init({
    server: {
      baseDir: '.',
      serveStaticOptions: {
        extensions: ['html'],
      },
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
const buildTask = series(
  cleanTask,
  parallel(htmlTask, scssTask, jsTask, imageTask)
);

// Gulp Tasks
exports.default = series(buildTask, browsersyncServe, watchTask);
exports.watch = series(browsersyncServe, watchTask);
exports.server = browsersyncServe;
exports.build = buildTask;
exports.clean = cleanTask;
