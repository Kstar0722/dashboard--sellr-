/* globals angular */
angular.module('core').service('constants', function (envService) {
  var me = this

  angular.extend(me, window.appSettings || {});

  me.env = envService.read('env')
  me.API_URL = envService.read('API_URL')
  me.BWS_API = envService.read('BWS_API')
  me.SHOPPR_URL = envService.read('SHOPPR_URL')

  me.CARDKIT_URL = 'https://www.cardkit.io/';
  me.GETSELLR_URL = 'https://getsellr.com/';
  me.ADS_URL = 'https://s3.amazonaws.com/cdn.expertoncue.com/'
  console.log('constants %O', me)

  return me
})
