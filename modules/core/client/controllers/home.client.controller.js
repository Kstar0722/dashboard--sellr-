'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$mdDialog', '$state',
    function ($scope, Authentication, $mdDialog, $state) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
        console.log('hey %O', $scope.authentication)
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
