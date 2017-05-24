'use strict'

module.exports = {
  client: {
    lib: {
      css: 'public/dist/lib.min.css',
      js: 'public/dist/lib.js'
    },
    css: 'public/dist/application.min.css',
    js: [
      'public/dist/application.min.js',
      'public/dist/templates.min.js'
    ]
  }
}
