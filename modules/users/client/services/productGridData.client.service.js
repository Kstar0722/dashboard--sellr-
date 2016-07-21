/**
 * Created by mac4rpalmer on 6/27/16.
 */
angular.module('users').factory('productGridData', function ($http, $location, constants, Authentication, $stateParams, $q, toastr, $rootScope, uploadService, $timeout) {
    "use strict";
    var me = this;

    var API_URL = constants.BWS_API;

    me.getData = getData;
    me.searchProducts = searchProducts;
    return me;


    function getData(type) {
        var defer = $q.defer();
        console.log(type)
        $http.get(API_URL + '/edit/search?type=' + type).then(function (products) {
            console.log(products);
            me.allProducts = products.data;
            defer.resolve(me.allProducts)
        });
        return defer.promise;
    }

    function searchProducts(searchText, obj) {
        var defer = $q.defer();
        var url = '/edit/search?'
        if(obj.types){

            for(var i in obj.types){
                url += '&type='+obj.types[i].type;
            }
        }
        if(obj.sku){
            url+='&sku='+obj.sku
        }
        if(obj.status){
            url+='&status='+obj.status;
        }
        if(searchText){
            url += '&q=' + searchText + '&v=sum';
        }
        console.log(url);
        $http.get(API_URL + url )
            .then(function (response) {
                me.allProducts = response.data;
                defer.resolve(me.allProducts)
            });
        return defer.promise;
    }

});
