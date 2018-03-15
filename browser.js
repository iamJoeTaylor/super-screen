const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

const {
  imagesPath,
  getThemePath,
  canvasURL,
  animationCompositionJSPath,
} = require('./constants.js');

async function writeImagesForConfig(config, avatar) {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  await page.goto(canvasURL);
  await page.injectFile(animationCompositionJSPath);
  await page.waitFor('canvas');

  const images = await page.evaluate(
    (...args) => getImages(...args),
    /* args */ config, { avatarImage: avatar }
  );

  const themePath = getThemePath(config.style);
  mkdirp.sync(themePath);

  images.forEach((image, i) => {
    const buf = new Buffer(image, 'base64');
    fs.writeFileSync(`${themePath}/${i}.png`, buf);
  });

  return browser.close();
}

module.exports = writeImagesForConfig;
