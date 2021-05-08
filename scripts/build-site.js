const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const chokidar = require('chokidar');

function getPath() {
  const websitePath = path.join(__dirname, '..');
  const sourcePath = path.join(websitePath, 'html', 'src', 'content');
  const componentPath = path.join(websitePath, 'html', 'src', 'components');
  const destPath = path.join(websitePath, 'html', 'dest');
  return [websitePath, sourcePath, componentPath, destPath];
}

async function getComponents(componentPath) {
  header = await fs.promises.readFile(path.join(componentPath, 'header.html'));
  footer = await fs.promises.readFile(path.join(componentPath, 'footer.html'));
  return [header, footer];
}

function getFilePaths(websitePath, sourcePath, destPath, filename) {
  let oldFilePath = path.join(sourcePath, filename);
  let newFilePath;
  if (filename == 'index.html') {
    newFilePath = path.join(websitePath, 'index.html');
  } else {
    newFilePath = path.join(destPath, filename);
  }
  return [oldFilePath, newFilePath];
}

async function buildSite(websitePath, sourcePath, componentPath, destPath) {
  let files = await fs.promises.readdir(sourcePath);
  let [header, footer] = await getComponents(componentPath);

  files.forEach(function (filename) {
    let [oldFilePath, newFilePath] = getFilePaths(
      websitePath,
      sourcePath,
      destPath,
      filename
    );
    buildPage(oldFilePath, newFilePath, header, footer);
  });

  console.log('Site build complete\n');
}

async function buildPage(oldFilePath, newFilePath, header, footer) {
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

async function main() {
  let [websitePath, sourcePath, componentPath, destPath] = await getPath();

  if (typeof process.argv[2] === 'undefined') {
    buildSite(websitePath, sourcePath, componentPath, destPath);
  } else if (process.argv[2] == '-w' || process.argv[2] == '--watch') {
    let contentWatch = chokidar
      .watch(sourcePath)
      .on('change', async (event) => {
        let filename = path.basename(event);
        console.log(`File change detected (content/${filename})`);

        let [oldFilePath, newFilePath] = await getFilePaths(
          websitePath,
          sourcePath,
          destPath,
          filename
        );
        let [header, footer] = await getComponents(componentPath);
        buildPage(oldFilePath, newFilePath, header, footer);
        console.log('Page build complete\n');
      });

    let componentWatch = chokidar
      .watch(componentPath)
      .on('change', async (event) => {
        let filename = path.basename(event);
        console.log(`File change detected (components/${filename})`);

        buildSite(websitePath, sourcePath, componentPath, destPath);
      });

    console.log('Files being watched. Press Ctrl+C to exit.\n');
  } else {
    console.log('Not a valid flag');
  }
}

main();
