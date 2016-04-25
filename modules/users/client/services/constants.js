angular.module('core').service('constants', function (envService) {
    var me = this;


    me.API_URL = envService.read('API_URL');
    me.BWS_API=envService.read('BWS_API');
    me.ADS_URL = 'http://s3.amazonaws.com/beta.cdn.expertoncue.com/';
    console.log('constants %O', me)

    return me;
});
