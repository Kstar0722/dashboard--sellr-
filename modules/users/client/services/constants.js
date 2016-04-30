angular.module('core').service('constants', function (envService) {
    var me = this;


    me.API_URL = envService.read('API_URL');
    me.BWS_API=envService.read('BWS_API');
    me.env=envService.read('env');
    me.ADS_URL = 'http://s3.amazonaws.com/cdn.expertoncue.com/';
    console.log('constants %O', me)

    return me;
});
