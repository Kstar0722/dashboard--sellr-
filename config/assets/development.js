'use strict'

module.exports = {
  client: {
    lib: undefined, // reuse libs from default.js
    css: [
      'modules/*/client/css/*.css'
    ],
    less: [
      'modules/*/client/less/*.less'
    ],
    sass: [
      'modules/*/client/scss/*.scss'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js'
    ],
    views: [ 'modules/*/client/views/**/*.html' ],
    templates: [ 'build/templates.js' ]
  },
  server: {
    gruntConfig: 'gruntfile.js',
    gulpConfig: 'gulpfile.js',
    allJS: [ 'server.js', 'config/**/*.js', 'modules/*/server/**/*.js' ],
    models: 'modules/*/server/models/**/*.js',
    routes: [ 'modules/core/server/routes/**/*.js' ],
    config: 'modules/*/server/config/*.js',
    policies: 'modules/*/server/policies/*.js',
    views: 'modules/*/server/views/*.html'
  }
}
