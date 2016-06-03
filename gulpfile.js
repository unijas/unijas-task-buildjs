'use strict'

const gulp = require('gulp')
const Join = require('path').join
const Browserify = require('browserify')
const Source = require('vinyl-source-stream')
const Buffer = require('vinyl-buffer')
const Sourcemaps = require('gulp-sourcemaps')
const Babelify = require('babelify')
const Uglify = require('gulp-uglify')

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
  console.log(module)
  return module.client
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

let clientConfig = readConfigFile(Join(process.cwd(), 'config', 'build.conf.json'))
console.log(buildPathes(clientConfig.dest))
gulp.task('buildjs:vendor', ()=> {
  return Browserify()
    .require(clientConfig.dependencies)
    .bundle()
    .pipe(Source('vendor.js'))
    .pipe(Buffer())
    .pipe(Sourcemaps.init({loadMaps: true}))
    .pipe(Uglify())
    .pipe(Sourcemaps.write('.'))
    .pipe(gulp.dest(buildPathes(clientConfig.dest)[0]))
})

gulp.task('buildjs:client', ()=> {
  let common = Browserify({
    entries: buildPathes(clientConfig.src),
    debug: true
  }).external(clientConfig.dependencies)
    .transform(Babelify, {presets: ['es2015', 'react']})
    .bundle()
    .pipe(Source(clientConfig.destFileName))
    .pipe(Buffer())
    .pipe(Sourcemaps.init({loadMaps: true}))
    .pipe(Sourcemaps.write('.'))
    .pipe(gulp.dest(buildPathes(clientConfig.dest)[0]))
  return common
})


module.exports = gulp.tasks
