'use strict'

angular.module('cardkit.core').service('mimeTypeService', function () {
  var svc = window.mimeType

  svc.lookupType = function (filePath) {
    if (filePath) filePath = filePath.toString()
    var mimetype = svc.lookup(filePath)
    if (!mimetype) return null
    return mimetype.split('/')[0]
  }

  return svc
})
