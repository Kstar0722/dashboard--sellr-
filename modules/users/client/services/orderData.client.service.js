/**
 * Created by mac4rpalmer on 6/27/16.
 */
angular.module('users').factory('orderDataService', function ($http, $location, constants, Authentication, $stateParams, $q, toastr, $rootScope, uploadService, $timeout) {
    "use strict";
    var me = this;

    var API_URL = constants.BWS_API;

    me.allItems = {};
    me.getData = getData;


    return me;


    function getData(id) {

        //back back
        var defer = $q.defer();
        console.log(id)
        var orderUrl = API_URL + '/edit/orders/'+id;
        $http.get(orderUrl).then(function (orderItems) {
            console.log(orderItems);
            me.allItems = orderItems.data;
            defer.resolve( me.allItems)
        });
        return defer.promise;
    }


});
