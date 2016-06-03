'use strict'

const gulp = require('gulp')
const Join = require('path').join
const Browserify = require('browserify')
const Source = require('vinyl-source-stream')
const Buffer = require('vinyl-buffer')
const Sourcemaps = require('gulp-sourcemaps')
const Babelify = require('babelify')
const Uglify = require('gulp-uglify')
const Gutil = require('gulp-util')
const Domain = require('domain')

/**
 * ## readConfigFile
 * require given file or the default-config-file and read in the stylus-conf
 * @param  {[string]} file path to the config-file to use
 * @return {[Object]}      stylus config-object
 */
let readConfigFile = function (file) {
  let module
  try {
    module = require(file)
  } catch (e) {
    module = require(Join(__dirname, 'default.conf.json'))
  }
  return module
}

/**
 * ## buildPathes
 * @param  {[Array]} pathes Elements are file-glob-arrays
 * @return {[Array]}        paths/file-globs as strings with prefixed cwd
 */
let buildPathes = function (pathes) {
  pathes = pathes.map(path => {
    return Join(process.cwd(), ...path)
  })
  return pathes
}

let configFile = Join(process.cwd(), 'config', 'build.conf.json')
let clientConfig = readConfigFile(configFile).js.client

gulp.task('buildjs:vendor', ()=> {
  let d = Domain.create()
  d.on('error', (err) => {
    Gutil.log('Browserfiy-error on vendor:')
    Gutil.log(err.message)
  })
  let common
  d.run(() => {
    common = Browserify()
      .require(clientConfig.dependencies)
      .bundle()
  })
  return common
    .pipe(Source('vendor.js'))
    .pipe(Buffer())
    .pipe(Sourcemaps.init({loadMaps: true}))
    .pipe(Uglify())
    .pipe(Sourcemaps.write('.'))
    .pipe(gulp.dest(buildPathes(clientConfig.dest)[0]))
})

gulp.task('buildjs:client', ()=> {
  let d = Domain.create()
  d.on('error', (err) => {
    Gutil.log('Browserfiy-error on app:')
    Gutil.log(err.message)
  })
  let common
  d.run(function () {
    common = Browserify({
      entries: buildPathes(clientConfig.src),
      debug: true
    })
    .external(clientConfig.dependencies)
    .transform(Babelify, {presets: ['es2015', 'react']})
    .bundle()
  })
  return common
    .pipe(Source(clientConfig.destFileName))
    .pipe(Buffer())
    .pipe(Sourcemaps.init({loadMaps: true}))
    .pipe(Sourcemaps.write('.'))
    .pipe(gulp.dest(buildPathes(clientConfig.dest)[0]))
})


module.exports = gulp.tasks
