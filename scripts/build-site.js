const fs = require('fs');
const path = require('path')
const cheerio = require('cheerio');

function getPath () {
  const websitePath = path.join(__dirname, '..')
  const sourcePath = path.join(websitePath, 'html', 'src', 'content');
  const destPath = path.join(websitePath, 'html', 'dest');
  return [websitePath, sourcePath, destPath];
}

function buildSite (websitePath, sourcePath, destPath) {
  let header = fs.readFileSync(path.join(websitePath, '/html/src/components/header.html'));
  let footer = fs.readFileSync(path.join(websitePath, './html/src/components/footer.html'));

  const files = fs.readdirSync(sourcePath);

  files.forEach(function (fileName) {
  let oldFilePath = path.join(sourcePath, fileName);
  if (fileName == 'index.html') {
      var newFilePath = path.join(websitePath, 'index.html');
  } else {
      var newFilePath = path.join(destPath, fileName);
  }
  buildFile(oldFilePath, newFilePath);
  });

  function buildFile(oldFilePath, newFilePath) {

    fs.copyFileSync(oldFilePath, newFilePath);
    let file = fs.readFileSync(newFilePath);
    let $ = cheerio.load(file);
    
    let title = $('title').text();

    $('header').html(header);
    $('footer').html(footer);
    $('#page-title').html(title);

    $(`#${title.toLowerCase()}-navbar-button`).addClass('active');

    fs.writeFileSync(newFilePath, $.html());

  }

  console.log('Page build completed');
}

function main () {
  const [websitePath, sourcePath, destPath] = getPath();
  buildSite(websitePath, sourcePath, destPath);
}

main();