angular.module('core').service('constants', function (envService) {
    var me = this;


    me.API_URL = envService.read('API_URL');

    return me;
});
