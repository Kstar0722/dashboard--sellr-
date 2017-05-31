/* globals angular */
angular.module('cardkit.core').service('constants', function (envService) {
  var me = this

  angular.extend(me, window.appSettings || {})

  me.env = envService.read('env')
  me.CARDKIT_URL = envService.read('CARDKIT_URL')

  return me
})
