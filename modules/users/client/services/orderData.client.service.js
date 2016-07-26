/**
 * Created by mac4rpalmer on 6/27/16.
 */
angular.module('users').factory('orderDataService', function ($http, $location, constants, Authentication, $stateParams, $q, toastr, $rootScope, uploadService, $timeout) {
    "use strict";
    var me = this;

    var API_URL = constants.BWS_API;

    me.allItems = {};
    me.selected =[];
    me.getData = getData;
    me.searchSku = searchSku;
    me.createNewProduct = createNewProduct;
    me.markDuplicate = markDuplicate;
    me.storeSelected = storeSelected;
    return me;


    function getData (id) {
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
    function storeSelected (selected) {
            me.selected = selected;
        return me.selected;
    }
    function searchSku (sku) {
        var defer = $q.defer();
        console.log('orderdata %O',sku)
        var skuUrl = API_URL + '/edit/search?v=sum&sku='+sku;
        $http.get(skuUrl).then(function (skuItems) {
            me.skuData = skuItems.data;
            console.log('orderdata %O',skuItems)
            defer.resolve( me.skuData)
        });
        return defer.promise;
    }
    function markDuplicate (prod, selected){
        var defer = $q.defer();
        var skuUrl = API_URL + '/edit/duplicates';
        var payload =
        {"payload":{
            "duplicates": [

            ],
            "skus":[
                prod.upc
            ]
        }
        }
        for(var i in selected){
            payload.payload.duplicates.push(selected[i].productId)
        }
        $http.post(skuUrl, payload).then(function (skuItems) {
            console.log(payload)

            if (skuItems)
                defer.resolve( skuItems)
        });
        return defer.promise;
    }
    function createNewProduct (prod) {
        var defer = $q.defer();
        var skuUrl = API_URL + '/edit/products';
        var payload = {
            'payload':{
                    "name": prod.name,
                    "description": "New Discription Needed",
                    "notes": "",
                    "productTypeId": prod.type,
                    "requestedBy": "sellr",
                    "feedback": "0",
                    "properties": [ ],
                    "mediaAssets": [
                        {
                            "type": "RESEARCH_IMG",
                            "fileName": "",
                            "script": null,
                            "publicUrl": prod.url
                        }
                    ],
                    "skus": [
                        prod.upc
                    ]
            }
        }
        console.log(payload)
        $http.post(skuUrl, payload).then(function (skuItems) {
            if (skuItems)
                defer.resolve( skuItems)
        });
        return defer.promise;
    }

});
