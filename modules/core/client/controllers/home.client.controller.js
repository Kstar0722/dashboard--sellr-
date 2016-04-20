'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$mdDialog', '$state','$http',
    function ($scope, Authentication, $mdDialog, $state, $http) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
        $scope.stuff = {};
        var check = false;
        //PERFECTLY FUNCTIONAL! DO NOT TOUCH
        if(!$scope.authentication.user != !check){
            $state.go('manager.dashboard')
        }
        $scope.userIsSupplier = function () {
            if (_.contains(Authentication.user.roles, 'supplier')) {
                return true;
            }
        };
        $scope.askForPasswordReset = function (isValid) {
            console.log('ask for password called %O',$scope.stuff )
            $scope.success = $scope.error = null;

            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

                return false;
            }
            $scope.stuff.username = $scope.stuff.passuser;
            $http.post('/api/auth/forgot', $scope.stuff).success(function (response) {
                // Show user success message and clear form
                $scope.credentials = null;
                $scope.success = response.message;

            }).error(function (response) {
                // Show user error message and clear form
                $scope.credentials = null;
                $scope.error = response.message;
            });
        };
        $scope.testFunction = function (ev) {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('This is an alert title')
                    .textContent('You can specify some description text in here.')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Got it!')
                    .targetEvent(ev)
            );
            console.log('test');
        };

    }
]);
