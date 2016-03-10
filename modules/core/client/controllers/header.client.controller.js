
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', '$http', '$window',
    function ($scope, Authentication, Menus, $http, $window) {
        $scope.authentication = Authentication;
        $scope.ui = {};

        var originatorEv;
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');

        $scope.toggleCollapsibleMenu = function () {
            $scope.isCollapsed = !$scope.isCollapsed;
        };
        $scope.openMenu = function($mdOpenMenu, ev) {
            console.log('hello')
            originatorEv = ev;
            $mdOpenMenu(ev);
        };
        $scope.signOut = function () {
            localStorage.clear();
            $http.get('/auth/signout')
                .success(function () {

                    $window.location.href = '/';
                })
                .error(function (err) {
                    console.log('error', err);
                })
        };

        //$scope.$watch('ui.toolbarOpened', function (opened) {
        //    if (!opened) {
        //        $scope.ui.toolbarOpened = true;
        //    }
        //});

        // Collapsing the menu after navigation
        //$scope.$on('$stateChangeSuccess', function () {
        //    $scope.isCollapsed = false;
        //});
    }
]);
