#!/usr/bin/env node --harmony

const program = require('commander');
const co = require('co');
const prompt = require('co-prompt');
const request = require('superagent');
const writeImagesForConfig = require('./browser.js');
const {createImageDiffs, createImages} = require('./diffImages.js');

function list(val) {
  return val.split(',');
}

const PERISCOPE_AVATAR = 'https://pbs.twimg.com/profile_images/576529332580982785/pfta069p_400x400.png';
const THEMES = 'sparkle,ripple,rainbow,wave';

const THEME_ENDPOINT = 'https://payman.periscope.tv/api/v1/giftHeartStyles';


program
  .version('1.0.0')
  .option('-t, --themes <heart-themes>', 'a list of themes to be requested from giftHeartStyles', list)
  .option('-a, --avatar <url>', 'avatar to use if heart theme uses avatars');

program.parse(process.argv);

co(function *() {
  let { themes, avatar } = program;
  if (!themes || !avatar) {
    console.log('\nThis utility will walk you through creating a super-screen file.');
    console.log('It only covers the most common items, and tries to guess sensible defaults.\n\n');

    // Prompt for theme if not provided
    if (!themes) {
      themes = yield prompt(`themes: (${THEMES}) `);
      themes = themes ? list(themes) : list(THEMES);
    }
    // Prompt for avatar if not provided
    if (!avatar) {
      avatar = yield prompt(`avatar url: (${PERISCOPE_AVATAR}) `);
      avatar = avatar || PERISCOPE_AVATAR;
    }
  }


  makeSuperScreen({ themes, avatar })
  //   .then(makeDiff)
  // makeDiff({ themes })
    .then(makeImages)
    .then(() => {
      // Success Exit
      process.exit(0);
    });
});

const getThemeConfig = ({ themes }) => request
  .get(THEME_ENDPOINT)
  .query({ styles: themes.join(',') })
  .then(({ body }) => body && body.styles);

const makeSuperScreen = ({
  themes,
  avatar
}) => co(function *() {
  const config = yield getThemeConfig({ themes });
  const promises = config.map(style => writeImagesForConfig(style, avatar));
  return Promise.all(promises)
    .then(() => ({ themes }));
});

function makeImages({ themes }) {
  const diffPromises = themes.map(theme => createImages({ theme }));
  return Promise.all(diffPromises);
};

function makeDiff({ themes }) {
  const diffPromises = themes.map(theme => createImageDiffs({ theme }));
  return Promise.all(diffPromises);
};
