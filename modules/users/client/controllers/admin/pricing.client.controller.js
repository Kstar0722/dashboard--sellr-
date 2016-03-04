'use strict';

angular.module('users.admin').controller('AdminPricingController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Admin', 'Upload', '$sce', 'ImageService', 'constants',
    function ($scope, $state, $http, Authentication, $timeout, Admin, Upload, $sce, ImageService, constants) {
        $scope.authentication = Authentication;
        Admin.query(function (data) {
            $scope.users = data;
            $scope.buildPager();
        });
        var self = this;
        $scope.amountDiscount = 0;
        $scope.itemPrice = [];
        $scope.currentDiscount = 0;
        var x;
        $scope.priceTotal = 0;
        $scope.total = function (price) {

            $scope.priceTotal += price ;
            console.log('total called %O', price)
        }
        $scope.addDiscount = function(amount){
            console.log('discount called %O', amount)
            $scope.currentDiscount = Number(amount);

        }
        $scope.subtractTotal = function (price) {

            if($scope.priceTotal - price >= 0)
                $scope.priceTotal -= price ;
            else{
                $scope.priceTotal =0;
            }
            console.log('total called %O', price)
        }
        $scope.addItem = function (item) {
            var obj = item;

            if ($scope.itemPrice.length == 0) {
                console.log('itemPrice1 %O', $scope.itemPrice)
                obj.qty += 1;
                $scope.total(obj.price);
                return $scope.itemPrice.push(obj);
            }
            console.log('itemPrice1 %O', $scope.itemPrice);
            obj.qty += 1;
            $scope.total(obj.price);
            return $scope.itemPrice.push(obj);
        }
        $scope.removeItem = function (item) {
            var obj = item;
            for (x in $scope.itemPrice) {

                if ($scope.itemPrice.hasOwnProperty(x) && $scope.itemPrice[x] === obj) {
                    console.log('deleted')
                    console.log('itemPrice1 %O', $scope.itemPrice)
                    obj.qty -= 1;
                    $scope.subtractTotal(obj.price);
                    return $scope.itemPrice.splice(x, 1);
                }
            }
        };
        $scope.appcheck;
        $scope.checkClick = function (item) {
            if ($scope.appcheck == false)
                $scope.addItem(item);
            else
                $scope.removeItem(item);
        }
        $scope.pricing = {
            pricelist: {
                devices: [
                    {
                        name: 'iPad',
                        price: 500,
                        qty:0
                    },
                    {
                        name: 'iPad Pro',
                        price: 1000,
                        qty:0
                    }],
                apps: [
                    {
                        'name': 'Beer, Wine, & Spirits',
                        'price': 2000,
                        'max-quantity': 1,
                        qty:0
                    },
                    {
                        'name': 'Pharmacy',
                        'price': 2000,
                        'max-quantity': 1,
                        qty:0
                    },
                    {
                        'name': 'Dashboard',
                        'price': 2000,
                        'max-quantity': 1,
                        qty:0
                    }],
                accessories: [
                    {
                        name: 'VESA Shelf Mount',
                        price: 100,
                        qty:0
                    },
                    {
                        name: 'Floor Stand',
                        price: 300,
                        qty:0
                    },
                    {
                        name: '4G Hotspot',
                        price: 600,
                        qty:0
                    }]
            }
        }
        $scope.discounts = [
            {amount :0 , name:'0%'},
            {amount: .05, name:'5%'},
            {amount: .10, name:'10%'},
            {amount: .20, name:'20%'},
            {amount: .30, name:'30%'},
            {amount: .40, name:'40%'}];
    }


]);

