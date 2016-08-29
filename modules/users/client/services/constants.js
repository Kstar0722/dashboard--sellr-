/* globals angular */
angular.module('core').service('constants', function (envService) {
  var me = this

  me.env = envService.read('env')
  me.API_URL = envService.read('API_URL')
  me.BWS_API = envService.read('BWS_API')
  me.STRIPE_PUBLISH_KEY = envService.read('STRIPE_PUBLISH_KEY')

  me.ADS_URL = 'http://s3.amazonaws.com/cdn.expertoncue.com/'
  console.log('constants %O', me)

  return me
})
