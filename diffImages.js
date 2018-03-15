const PixelDiff = require('pixel-diff');
const Jimp = require('jimp');

const {
  getThemePath,
} = require('./constants.js');

const createImages = ({ theme }) => {
  const themePath = getThemePath(theme);
  const fakeArray = Array(28).fill();
  const outputPromises = fakeArray.map((_, i) => {
    const path = `${themePath}/${i}.png`;
    return Jimp.read(path)
      .then(image => new Promise((resolve) => image.write( `${themePath}/${i}.jpg`, resolve)));
  });
  return Promise.all(outputPromises);
};

const createImageDiffs = ({ theme }) => {
  const themePath = getThemePath(theme);
  const fakeArray = Array(28).fill();
  const outputPromises = fakeArray.map((_, i) => {
    const next = i + 1 === fakeArray.length ? 0 : i + 1;
    return outputDiff(
      `${themePath}/${i}.png`,
      `${themePath}/${next}.png`,
      `${themePath}/${i}-${next}.png`
    )
      .then(() => Jimp.read(`${themePath}/${i}-${next}.png`))
      .then(image => new Promise((resolve) => image.write(`${themePath}/diff-${i}-${next}.bmp`, resolve)));
  });
  return Promise.all(outputPromises)
    .then(() => Jimp.read(`${themePath}/0.png`))
    .then(image => new Promise((resolve) => image.write(`${themePath}/og-0.bmp`, resolve)));
};

const outputDiff = (imageAPath, imageBPath, imageOutputPath) => {
  const diff = new PixelDiff({
    imageAPath,
    imageBPath,
    imageOutputPath,

    outputMaskOpacity: 0,
    // outputShiftGreen: 0,
    outputShiftOpacity: 0,
    outputBackgroundRed: 255,
    outputBackgroundAlpha: 255,
    outputBackgroundOpacity: 1,
    outputShiftOpacity: 0,

    copyImageAToOutput: false,
    copyImageBToOutput: true,

    composition: false,

    thresholdType: PixelDiff.THRESHOLD_PIXEL,
    threshold: 0.01, // 1% threshold
  });

  return diff.runWithPromise()
    .then(result => {
      console.log(`${result.differences} differences for ${imageAPath.split('/').pop()} :: ${imageBPath.split('/').pop()}.`);
      return result;
    })
    .catch(error => {
      throw error;
    });
};

module.exports = {
  createImageDiffs,
  createImages,
}
