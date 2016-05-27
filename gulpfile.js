'use strict'

const gulp = require('gulp')
const join = require('path').join
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const sourcemaps = require('gulp-sourcemaps')
const babelify = require('babelify')
const argv = require('yargs').argv

let production = false
if (argv.p) {
  production.true
}

let dependencies = [
  'react',
  'react-dom',
  'jquery'
]

let destination = join('dist','js')
if (production) {
  destination = join('build', 'js')
}
gulp.task('buildjs:vendor', ()=> {
  return browserify()
    .require(dependencies)
    .bundle()
    .pipe(source('vendor.js'))
    .pipe(buffer())
    .pipe(gulp.dest(destination))
})

gulp.task('buildjs:client', ()=> {
  let common = browserify({
    entries: join('src', 'bla.js'),
    debug: true
  }).external(dependencies)
    .transform(babelify, {presets: ['es2015', 'react']})
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(destination))
  return common
})

module.exports = gulp.tasks
