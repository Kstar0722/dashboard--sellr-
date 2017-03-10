'use strict'

// Users service used for communicating with the users REST endpoint
angular.module('core').factory('ImageService', [
  function () {
    var me = this
    me.image = ''

    return me
  }
])
