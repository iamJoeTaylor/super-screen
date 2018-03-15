const path = require('path');

const imagesPath = path.join(__dirname, 'images');

module.exports = {
  imagesPath,
  getThemePath: themeName => path.join(imagesPath, themeName),
  canvasURL: `file://${path.join(__dirname, 'canvas.html')}`,
  animationCompositionJSPath: path.join(
    __dirname, 'node_modules', 'animation-composition', 'dist', 'animation-composition.js'
  ),
};
