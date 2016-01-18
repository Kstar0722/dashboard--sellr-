'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$mdDialog',
    function ($scope, Authentication, $mdDialog) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
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
