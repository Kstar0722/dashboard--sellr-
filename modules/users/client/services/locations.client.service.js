angular.module('users').service('locationsService', function ($http, constants) {
    var me = this;

    me.locations = [];

    me.getLocations = function (accountId) {
        var url = constants.API_URL + '/locations?account=' + accountId;
        $http.get(url).then(function (res) {
            console.dir('locationsService: getLocations %O', res);
            me.locations = res.data
        })
    }

    return me;
});
