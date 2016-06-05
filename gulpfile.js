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
const Helper = require('unijas-task-helper')

let configFile = Join(process.cwd(), 'config', 'build.conf.json')
let clientConfig = Helper.readConfigFile(__dirname, configFile).js.client

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
    .pipe(gulp.dest(Helper.buildPathes(clientConfig.dest)[0]))
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
      entries: Helper.buildPathes(clientConfig.src),
      debug: true
    })
    .external(clientConfig.dependencies)
    .transform(Babelify, { 
       presets: ['es2015', 'react'],
       plugins: ['transform-object-rest-spread']
     })
    .bundle()
  })
  return common
    .pipe(Source(clientConfig.destFileName))
    .pipe(Buffer())
    .pipe(Sourcemaps.init({loadMaps: true}))
    .pipe(Sourcemaps.write('.'))
    .pipe(gulp.dest(Helper.buildPathes(clientConfig.dest)[0]))
})


module.exports = gulp.tasks
