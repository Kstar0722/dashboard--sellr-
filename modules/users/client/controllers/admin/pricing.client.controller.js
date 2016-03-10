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
        $scope.deviceImage = 'dist/ipadair.jpeg';
        $scope.images = [];
        $scope.currentDiscount = 0;
        $scope.priceTotal = 0;

        var x;
        $scope.addPackage  = function(number){
            $scope.priceTotal = 0

            devices[0].qty = Math.round((.66 * number) * 1)/1;
            devices[1].qty = Math.round((.33 * number) * 1)/1;
            apps[0].qty = number;
            apps[1].qty = number;
            apps[2].qty = number;
            accessories[0].qty = Math.round((.66 * number) * 1)/1;
            accessories[1].qty = Math.round((.33 * number) * 1)/1;
            $scope.pricing.pricelist.totalDevices =number;
            $scope.pricing.pricelist.totalApps =number*3;
            $scope.pricing.pricelist.totalAccessories = number;

            var packageTotal = (devices[0].price * Math.round((.66 * number) * 1)/1) +(devices[1].price * Math.round((.33 * number) * 1)/1)
                +(apps[0].price * number)+(apps[1].price * number)+(apps[2].price * number) +(accessories[0].price * Math.round((.66 * number) * 1)/1)+(accessories[1].price * Math.round((.33 * number) * 1)/1)
            $scope.total(packageTotal);
        }
        $scope.formatNumber = function(i) {
            return Math.round(i * 1)/1;
        }
        $scope.total = function (price) {
            console.log(price)
            $scope.priceTotal += price;
        }
        $scope.addDiscount = function(amount){
            $scope.currentDiscount = Number(amount);

        }
        $scope.subtractTotal = function (price) {
            if($scope.priceTotal - price >= 0)
                $scope.priceTotal -= price ;
            else{
                $scope.priceTotal =0;
            }
        }
        //$scope.addItem = function (item, id) {
        //    var obj = item;
        //    if(id == 'device')
        //        $scope.pricing.pricelist.totalDevices += 1;
        //    if(id == 'apps' )
        //        $scope.pricing.pricelist.totalApps += 1;
        //    if(id == 'accessories')
        //        $scope.pricing.pricelist.totalAccessories += 1;
        //    if ($scope.itemPrice.length == 0) {
        //        obj.qty += 1;
        //        obj.total +=1;
        //        $scope.total(obj.price);
        //        if(obj.name == 'iPad') {
        //            $scope.images.push({name: obj.name, fileName: 'dist/ipadair.jpeg'});
        //        }
        //        if(obj.name == 'iPad Pro'){
        //            $scope.images.push({name:obj.name, fileName:'dist/ipad-pro-250x306.jpg'});
        //            }
        //        if(obj.name == 'VESA Shelf Mount') {
        //            $scope.images.push({name: obj.name, fileName: 'dist/vesa.jpg'});
        //        }
        //        if(obj.name == 'Floor Stand') {
        //            $scope.images.push({name: obj.name, fileName: 'dist/armodillo-floor.png'});
        //        }
        //        console.log('images %O', $scope.images);
        //        //$scope.sources.push({fileName:'dist/ipadair.jpeg'});git pull
        //
        //        return $scope.itemPrice.push(obj);
        //    }
        //    obj.qty += 1;
        //    obj.total +=1;
        //    if(obj.name == 'iPad')
        //        $scope.images.push({name:obj.name, fileName:'dist/ipadair.jpeg'});
        //    if(obj.name == 'iPad Pro')
        //        $scope.images.push({name:obj.name, fileName:'dist/ipad-pro-250x306.jpg'});
        //    if(obj.name == 'VESA Shelf Mount')
        //        $scope.images.push({name:obj.name, fileName:'dist/vesa.jpg'});
        //    if(obj.name == 'Floor Stand')
        //        $scope.images.push({name:obj.name, fileName:'dist/armodillo-floor.png'});
        //    console.log('images %O', $scope.images);
        //    $scope.total(obj.price);
        //    return $scope.itemPrice.push(obj);
        //}
        $scope.addItem = function (item, id) {

            var obj = item;
            if(id == 'device')
                $scope.pricing.pricelist.totalDevices += 1;
            if(id == 'apps' )
                $scope.pricing.pricelist.totalApps += 1;
            if(id == 'accessories')
                $scope.pricing.pricelist.totalAccessories += 1;
            if ($scope.itemPrice.length == 0) {
                //obj.qty += 1;
                obj.total +=1;
                $scope.total(obj.price);
                if (obj.name == 'iPad') {
                    devices[0].qty += 1;
                    $scope.images.push({name: obj.name, fileName: 'dist/ipadair.jpeg'});
                }
                if (obj.name == 'iPad Pro') {
                    devices[1].qty += 1;
                    $scope.images.push({name: obj.name, fileName: 'dist/ipad-pro-250x306.jpg'});
                }
                if (obj.name == 'VESA Shelf Mount') {
                    accessories[0].qty += 1;
                    $scope.images.push({name: obj.name, fileName: 'dist/vesa.jpg'});
                }
                if (obj.name == 'Floor Stand') {
                    accessories[1].qty += 1;
                    $scope.images.push({name: obj.name, fileName: 'dist/armodillo-floor.png'});
                }
                if (obj.name == '4g hotspot') {
                    accessories[2].qty += 1;
                }
                if (obj.name == 'Beer Lookup') {
                    apps[0].qty += 1;
                }
                if (obj.name == 'Wine Lookup') {
                    apps[1].qty += 1;
                }
                if (obj.name == 'Spirits Lookup') {
                    apps[2].qty += 1;
                }
                if (obj.name == 'Pharmacy ') {
                    apps[3].qty += 1;
                }
                if (obj.name == 'Digital Signage ') {
                    apps[4].qty += 1;
                }
                if (obj.name == 'Dashboard ') {
                    apps[5].qty += 1;
                }
                console.log('images %O', $scope.images);
                //$scope.sources.push({fileName:'dist/ipadair.jpeg'});git pull

                //return $scope.itemPrice.push(obj);
            }
            else {
                //obj.qty += 1;
                obj.total += 1;
                if (obj.name == 'iPad') {
                    devices[0].qty += 1;
                    $scope.images.push({name: obj.name, fileName: 'dist/ipadair.jpeg'});
                }
                if (obj.name == 'iPad Pro') {
                    devices[1].qty += 1;
                    $scope.images.push({name: obj.name, fileName: 'dist/ipad-pro-250x306.jpg'});
                }
                if (obj.name == 'VESA Shelf Mount') {
                    accessories[0].qty += 1;
                    $scope.images.push({name: obj.name, fileName: 'dist/vesa.jpg'});
                }
                if (obj.name == 'Floor Stand') {
                    accessories[1].qty += 1;
                    $scope.images.push({name: obj.name, fileName: 'dist/armodillo-floor.png'});
                }
                if (obj.name == '4g hotspot') {
                    accessories[2].qty += 1;
                }
                if (obj.name == 'Beer Lookup') {
                    apps[0].qty += 1;
                }
                if (obj.name == 'Wine Lookup') {
                    apps[1].qty += 1;
                }
                if (obj.name == 'Spirits Lookup') {
                    apps[2].qty += 1;
                }
                if (obj.name == 'Pharmacy ') {
                    apps[3].qty += 1;
                }
                if (obj.name == 'Digital Signage ') {
                    apps[4].qty += 1;
                }
                if (obj.name == 'Dashboard ') {
                    apps[5].qty += 1;
                }
                $scope.total(obj.price);
                //return $scope.itemPrice.push(obj);
            }
        }
        $scope.removeItem = function (item, id) {
            var obj = item;
            if(id == 'device' && $scope.pricing.pricelist.totalDevices != 0)
                $scope.pricing.pricelist.totalDevices -= 1;
            if(id == 'apps' && $scope.pricing.pricelist.totalApps != 0)
                $scope.pricing.pricelist.totalApps -= 1;
            if(id == 'accessories' && $scope.pricing.pricelist.totalAccessories != 0)
                $scope.pricing.pricelist.totalAccessories -= 1;
            for(var y in $scope.images){
                    if($scope.images[y].name == obj.name){
                        console.log('image deleted');
                        $scope.images.splice(y,1);
                    }
            }
            //if($scope.itemPrice) {
            //    for (x in $scope.itemPrice) {
            //        if ($scope.itemPrice[x].name == obj.name) {
            //            console.log('deleted')
            //            console.log('itemPrice1 %O', $scope.itemPrice)
            //            obj.qty -= 1;
            //            obj.total -= 1;
            //            $scope.subtractTotal(obj.price);
            //            return $scope.itemPrice.splice(x, 1);
            //        }
            //
            //        //if ($scope.itemPrice.hasOwnProperty(x) && $scope.itemPrice[x] === obj) {
            //        //    console.log('deleted')
            //        //    console.log('itemPrice1 %O', $scope.itemPrice)
            //            obj.qty -= 1;
            //            obj.total -=1;
            //            $scope.subtractTotal(obj.price);
            //        //    return $scope.itemPrice.splice(x, 1);
            //        //}
            //    }
            //}

            obj.total -=1;
            console.log('obj for removing %O', obj);
            console.log('pricing obj %O', $scope.pricing);
            $scope.subtractTotal(obj.price);
            if (obj.name == 'iPad') {
                devices[0].qty -=1;
            }
            if (obj.name == 'iPad Pro') {
                devices[1].qty -=1;
            }
            if (obj.name == 'VESA Shelf Mount') {
                accessories[0].qty -=1;
            }
            if (obj.name == 'Floor Stand') {
                accessories[1].qty -=1;
            }
            if (obj.name == '4g hotspot') {
                accessories[2].qty -= 1;
            }
            if (obj.name == 'Beer Lookup') {
                apps[0].qty -= 1;
            }
            if (obj.name == 'Wine Lookup') {
                apps[1].qty -= 1;
            }
            if (obj.name == 'Spirits Lookup') {
                apps[2].qty -= 1;
            }
            if (obj.name == 'Pharmacy ') {
                apps[3].qty -= 1;
            }
            if (obj.name == 'Digital Signage ') {
                apps[4].qty -= 1;
            }
            if (obj.name == 'Dashboard ') {
                apps[5].qty -= 1;
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
                        'name': 'Beer Lookup',
                        'price': 1000,
                        'max-quantity': 1,
                        qty:0
                    },
                    {
                        'name': 'Wine Lookup',
                        'price': 1000,
                        'max-quantity': 1,
                        qty:0
                    },
                    {
                        'name': 'Spirits Lookup',
                        'price': 1000,
                        'max-quantity': 1,
                        qty:0
                    },
                    {
                        'name': 'Pharmacy',
                        'price': 1000,
                        'max-quantity': 1,
                        qty:0
                    },
                    {
                        'name': 'Digital Signage',
                        'price': 1000,
                        'max-quantity': 1,
                        qty:0
                    },
                    {
                        'name': 'Dashboard',
                        'price': 1000,
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
                    }],
                totalDevices:0,
                totalApps:0,
                totalAccessories:0
            }
        }
        $scope.discounts = [
            {amount :0 , name:'0%'},
            {amount: .05, name:'5%'},
            {amount: .10, name:'10%'},
            {amount: .20, name:'20%'},
            {amount: .30, name:'30%'},
            {amount: .40, name:'40%'}];
        var devices = $scope.pricing.pricelist.devices
        var apps = $scope.pricing.pricelist.apps
        var accessories = $scope.pricing.pricelist.accessories
    }


]);

