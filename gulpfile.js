const fs = require('fs');
const gulp = require('gulp');
const axios = require('axios');
const log = require('fancy-log');
const replace = require('gulp-replace');

const envFile = './.env';

// fallback if user forgets to create an .env file
if (!fs.existsSync(envFile)) {
  fs.copyFileSync('./.env-skel', envFile);
  log.info('.env file was not found and was created! However it most likely needs adaptions - please check the configuration!');
}

require('dotenv').config({
  path: envFile,
});

// eslint-disable-next-line consistent-return
gulp.task('set-default-settings', async () => {
  try {
    // create settings from settings-skel if it does not exist
    if (!fs.existsSync('./config/settings.js')) {
      fs.copyFileSync('./config/settings-skel.js', './config/settings.js');
      log.info('config file was created.');
    }
  } catch (e) {
    log.warn('Something went wrong while creating the file config/settings.js from config/settings-skel.js!'
      + 'Please check if file exists and create manually if necessary.');
    log.error(e);
  }
});

// eslint-disable-next-line consistent-return
gulp.task('set-header', async () => {
  try {
    const res = await axios.get(`${process.env.headerJson}`);
    const baseUrl = process.env.headerJson.match(/(^https?:\/\/[a-z-.]+)/)[0];
    return gulp.src([envFile], { base: './' })
      .pipe(replace(/(\s+HEADER=).*/, (match, p1) => {
        return `${p1}${baseUrl}/${res.data.latest}`;
      }))
      .pipe(gulp.dest('.'))
      .on('end', () => { log(`Header file set to: ${res.data.latest}`); });
  } catch (e) {
    log.warn(`WARNING: header file could not be set and default ${process.env.HEADER} (might be outdated) will be used!`);
    log.error(e);
  }
});

gulp.task('default', gulp.series(gulp.parallel('set-default-settings')));
