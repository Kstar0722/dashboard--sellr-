(function ($) {
  'use strict'

  $.Deferred.resolve = function (value) {
    return $.Deferred().resolve(value).promise()
  }

  $.Deferred.reject = function (value) {
    return $.Deferred().reject(value).promise()
  }
}(jQuery))
