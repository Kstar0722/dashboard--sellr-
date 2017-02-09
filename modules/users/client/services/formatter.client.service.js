angular.module('core').service('formatter', function () {
  var me = this

  me.codeOf = function (name) {
    return (name || '').toString().replace(/[^a-z0-9_]+/gi, '_').trim().toLowerCase()
  }

  me.humanReadable = function (code) {
    return (code || '').toString().replace(/[_\-]+/g, ' ') // replace -/_ with whitespaces
      .replace(/([A-Z0-9]+)/g, ' $1').trim().replace(/ {2,}/g, ' ').toLowerCase() // separate words out with spaces
      .replace(/\b[a-z]/g, function (m) { return m.toUpperCase() }) // pascal-case
  }

  return me
})
