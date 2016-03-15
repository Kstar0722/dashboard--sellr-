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
            accessories[1].qty = number;
            accessories[2].qty = Math.round((.33 * number) * 1)/1;
            $scope.pricing.pricelist.totalDevices =number;
            $scope.pricing.pricelist.totalApps =number*3;
            $scope.pricing.pricelist.totalAccessories = number;

            var packageTotal = (devices[0].price * Math.round((.66 * number) * 1)/1) +(devices[1].price * Math.round((.33 * number) * 1)/1)
                +(apps[0].price * number)+(apps[1].price * number)+(apps[2].price * number) +(accessories[0].price * Math.round((.66 * number) * 1)/1)+((accessories[1].price * number * 1)/1)+(accessories[2].price * Math.round((.33 * number) * 1)/1)
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
        $scope.switchItem = function(cart, mod) {

            switch (cart.name) {
                case 'iPad Air 16GB':
                    if(mod == 'add')
                        devices[0].qty += 1;
                    else if(devices[0].qty != 0)
                        devices[0].qty -= 1;
                    $scope.images.push({name: cart.name, fileName: 'dist/ipadair.jpeg'});
                    break;
                case 'iPad Pro 32GB':
                    if(mod == 'add')
                        devices[1].qty += 1;
                    else if(devices[1].qty != 0)
                        devices[1].qty -= 1;
                    $scope.images.push({name: cart.name, fileName: 'dist/ipad-pro-250x306.jpg'});
                    break;
                case 'iPad Air 32GB 4G':
                    if(mod == 'add')
                        devices[2].qty += 1;
                    else if(devices[2].qty != 0)
                        devices[2].qty -= 1;
                    $scope.images.push({name: cart.name, fileName: 'dist/ipadair.jpeg'});
                    break;
                case 'iPad Pro 128GB 4G':
                    if(mod == 'add')
                        devices[4].qty += 1;
                    else if(devices[4].qty != 0)
                        devices[4].qty -= 1;
                    break;
                case 'Beer Lookup':
                    if(mod == 'add')
                        apps[0].qty += 1;
                    else if(apps[0].qty != 0)
                        apps[0].qty -= 1;
                    break;
                case 'Wine Lookup':
                    if(mod == 'add')
                        apps[1].qty += 1;
                    else if(apps[1].qty != 0)
                        apps[1].qty -= 1;
                    break;
                case 'Spirits Lookup':
                    if(mod == 'add')
                        apps[2].qty += 1;
                    else if(apps[2].qty != 0)
                        apps[2].qty -= 1;
                    break;
                case 'Pharmacy':
                    if(mod == 'add')
                        apps[3].qty += 1;
                    else if(apps[3].qty != 0)
                        apps[3].qty -= 1;
                    break;
                case 'Dashboard':
                    if(mod == 'add')
                        apps[4].qty += 1;
                    else if(apps[4].qty != 0)
                        apps[4].qty -= 1;
                    break;
                case 'VESA Shelf Mount':
                    if(mod == 'add')
                        accessories[0].qty += 1;
                    else if(accessories[0].qty != 0)
                        accessories[0].qty -= 1;
                    $scope.images.push({name: cart.name, fileName: 'dist/vesa.jpg'});
                    break;
                case '2D Scanner':
                    if(mod == 'add')
                        accessories[1].qty += 1;
                    else if(accessories[1].qty != 0)
                        accessories[1].qty -= 1;
                    break;
                case 'Floor Stand':
                    if(mod == 'add')
                        accessories[2].qty += 1;
                    else if(accessories[2].qty != 0)
                        accessories[2].qty -= 1;
                    $scope.images.push({name: cart.name, fileName: 'dist/armodillo-floor.png'});
                    break;
                case '4G hotspot':
                    if(mod == 'add')
                        accessories[3].qty += 1;
                    else if(accessories[3].qty != 0)
                        accessories[3].qty -= 1;
                    break;
                default:

            }
        }

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
                $scope.switchItem(item, 'add');

                //$scope.sources.push({fileName:'dist/ipadair.jpeg'});git pull

                //return $scope.itemPrice.push(obj);
            }
            else {
                //obj.qty += 1;
                obj.total += 1;
                $scope.switchItem(item, 'add');
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
            $scope.switchItem(item, 'subtract');
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
                        name: 'iPad Air 16GB',
                        price: 499,
                        qty:0
                    },
                    {
                        name: 'iPad Pro 32GB',
                        price: 799,
                        qty:0
                    },
                    {
                        name: 'iPad Air 16GB 4G',
                        price: 629,
                        qty:0
                    },
                    {
                        name: 'iPad Pro 128GB 4G',
                        price: 1079,
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
                        price: 130,
                        qty:0
                    },
                    {
                        name: '2D Scanner',
                        price: 208,
                        qty:0
                    },
                    {
                        name: 'Floor Stand',
                        price: 350,
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

