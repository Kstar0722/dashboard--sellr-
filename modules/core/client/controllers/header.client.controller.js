
'use strict';

angular.module('core').controller('HeaderController', [ '$scope', 'Authentication', 'Menus', '$http', '$window', '$state',
    function ($scope, Authentication, Menus, $http, $window, $state) {
        $scope.authentication = Authentication;
        $scope.ui = {};
        $scope.$state = $state;

        var originatorEv;
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');
        console.log('menus %O', $scope.menu);


        $scope.toggleCollapsibleMenu = function () {
            $scope.isCollapsed = !$scope.isCollapsed;
        };
        $scope.openMenu = function($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };
        $scope.signOut = function () {
            window.localStorage.clear();
            localStorage.clear();
            $window.localStorage.clear();
            $window.location.href = '/auth/signout';
        };

    }
]);
