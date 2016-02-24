'use strict';

angular.module('users.supplier').controller('AssetController', ['$scope','$state','$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;

        $scope.links = [];

        $scope.toggleLeft = buildDelayedToggler('left');

        function debounce(func, wait, context) {
            var timer;

            return function debounced() {
                var context = $scope,
                    args = Array.prototype.slice.call(arguments);
                $timeout.cancel(timer);
                timer = $timeout(function () {
                    timer = undefined;
                    func.apply(context, args);
                }, wait || 10);
            };
        }
        function buildDelayedToggler(navID) {
            return debounce(function () {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        console.log("toggle " + navID + " is done");
                    });
            }, 200);
        }
        function encode(data) {
            var str = data.reduce(function (a, b) {
                return a + String.fromCharCode(b)
            }, '');
            return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
        }
       $scope.init = function(){
            $http.get('http://mystique.expertoncue.com:7272/media/' + $scope.authentication.user.username).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    for (var i in response.data) {
                        $scope.links.push(response.data[i].mediaAssetId + "-" + response.data[i].fileName);
                    }
                }
            });
        }

        $scope.viewFile = function (file) {
            ImageService.image = file;

            $scope.creds = {
                bucket: 'beta.cdn.expertoncue.com',
                access_key: 'AKIAICAP7UIWM4XZWVBA',
                secret_key: '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',

            };
            var params = {
                Key: ImageService.image
            };

            // Configure The S3 Object
            AWS.config.update({
                accessKeyId: $scope.creds.access_key,
                secretAccessKey: $scope.creds.secret_key
            });
            AWS.config.region = 'us-east-1';
            var bucket = new AWS.S3({params: {Bucket: $scope.creds.bucket}});
            bucket.getObject(params, function (err, data) {
                $scope.loading = true;
                if (err) {
                    // There Was An Error With Your S3 Config
                    alert(err.message);
                    return false;
                }
                else {

                    var re = /(?:\.([^.]+))?$/;

                    var ext = re.exec(ImageService.image)[1];
                    console.log(ext);
                    ext = ext.toLowerCase();
                    self.imageName = JSON.stringify(ImageService.image);
                    if(ext =='jpg' ||ext =='png' ||ext =='svg' ) {
                        $scope.media = 'image';
                        self.news3image = "data:image/jpg;base64," + encode(data.Body);
                        $scope.$apply();
                    }
                    else if(ext =='mp4' ||ext =='mov' || ext =='wmv') {
                        $scope.media = 'video';
                        self.news3image = $sce.trustAsResourceUrl('http://s3.amazonaws.com/beta.cdn.expertoncue.com/'+ImageService.image);
                        $scope.$apply();
                    }

                    // Success!

                }
            })
        }

    }
]);

