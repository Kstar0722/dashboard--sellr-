//'use strict';
//
//angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus',
//  function ($scope, $state, Authentication, Menus) {
//    // Expose view variables
//    $scope.$state = $state;
//    $scope.authentication = Authentication;
//
//    // Get the topbar menu
//    $scope.menu = Menus.getMenu('topbar');
//
//    // Toggle the menu items
//    $scope.isCollapsed = false;
//    $scope.toggleCollapsibleMenu = function () {
//      $scope.isCollapsed = !$scope.isCollapsed;
//    };
//
//    // Collapsing the menu after navigation
//    $scope.$on('$stateChangeSuccess', function () {
//      $scope.isCollapsed = false;
//    });
//  }
//]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', '$http', '$window',
    function ($scope, Authentication, Menus, $http, $window) {
        $scope.authentication = Authentication;
        $scope.ui = {};


        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');

        $scope.toggleCollapsibleMenu = function () {
            $scope.isCollapsed = !$scope.isCollapsed;
        };

        $scope.signOut = function () {
            $http.get('/auth/signout')
                .success(function () {

                    $window.location.href = '/';
                })
                .error(function (err) {
                    console.log('error', err);
                })
        };

        $scope.$watch('ui.toolbarOpened', function (opened) {
            if (!opened) {
                $scope.ui.toolbarOpened = true;
            }
        });

        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function () {
            $scope.isCollapsed = false;
        });
    }
]);
