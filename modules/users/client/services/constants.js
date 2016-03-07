angular.module('core').service('constants', function (envService) {
    var me = this;


    me.API_URL = envService.read('API_URL');
    me.ADS_URL = 'http://s3.amazonaws.com/beta.cdn.expertoncue.com/';


    return me;
});
