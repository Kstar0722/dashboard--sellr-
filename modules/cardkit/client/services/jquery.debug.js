(function ($) {
  'use strict'

  $.fn.$S = function () {
    return angular.element(this[0]).scope()
  }
}(jQuery))
