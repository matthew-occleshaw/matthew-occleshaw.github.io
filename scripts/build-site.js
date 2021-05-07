const fs = require('fs');
const path = require('path')
const cheerio = require('cheerio');
const chokidar = require('chokidar');

let header;
let footer;

function getPath () {
  const websitePath = path.join(__dirname, '..')
  const sourcePath = path.join(websitePath, 'html', 'src', 'content');
  const componentPath = path.join(websitePath, 'html', 'src', 'components');
  const destPath = path.join(websitePath, 'html', 'dest');
  return [websitePath, sourcePath, componentPath, destPath];
}

async function getComponents (websitePath) {
  header = await fs.promises.readFile(path.join(websitePath, '/html/src/components/header.html'));
  footer = await fs.promises.readFile(path.join(websitePath, './html/src/components/footer.html'));
}

function getFilePaths (websitePath, sourcePath, destPath, filename) {
  let oldFilePath = path.join(sourcePath, filename);
  let newFilePath;
  if (filename == 'index.html') {
    newFilePath = path.join(websitePath, 'index.html');
  } else {
    newFilePath = path.join(destPath, filename);
  }
  return [oldFilePath, newFilePath];
}

async function buildSite (websitePath, sourcePath, destPath) {

  const files = await fs.promises.readdir(sourcePath);

  files.forEach(function (filename) {
    let [oldFilePath, newFilePath] = getFilePaths(websitePath, sourcePath, destPath, filename);
    buildPage(oldFilePath, newFilePath);
  });

  console.log('Page build complete');

}

async function buildPage(oldFilePath, newFilePath) {

  await fs.promises.copyFile(oldFilePath, newFilePath);
  let file = await fs.promises.readFile(newFilePath);
  let $ = cheerio.load(file);
  
  let title = $('title').text();

  $('header').html(header);
  $('footer').html(footer);
  $('#page-title').html(title);

  $(`#${title.toLowerCase()}-navbar-button`).addClass('active');

  await fs.promises.writeFile(newFilePath, $.html());

}

function main () {

  const [websitePath, sourcePath, componentPath, destPath] = getPath();
  getComponents(websitePath);

  if (typeof process.argv[2] === 'undefined') {
    buildSite(websitePath, sourcePath, destPath);

  } else if (process.argv[2] == '-w' || process.argv[2] == '--watch') {

    const contentWatch = chokidar.watch(sourcePath).on('change', (event) => {

      let filename = path.basename(event);
      console.log(`File change detected (${filename})`);

      let [oldFilePath, newFilePath] = getFilePaths(websitePath, sourcePath, destPath, filename);
      buildPage(oldFilePath, newFilePath);
      console.log('Page built\n');

    });

    const componentWatch = chokidar.watch(componentPath).on('change', (event) => {
      buildSite(websitePath, sourcePath, destPath);
    });

    console.log('Files being watched. Press Ctrl+C to exit.\n');

  } else {
    console.log('Not a valid flag');
  }

}

main();