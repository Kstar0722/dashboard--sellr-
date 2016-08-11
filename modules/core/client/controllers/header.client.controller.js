'use strict';

angular.module('core').controller('HeaderController', [ '$scope', 'Authentication', 'Menus', '$http', '$window', '$state', '$stateParams',
    function ($scope, Authentication, Menus, $http, $window, $state, $stateParams) {
        console.log('HELLO FROM THE HEADER')
        $scope.authentication = Authentication;
        $scope.ui = {};
        $scope.$state = $state;

        var originatorEv;
        $scope.isCollapsed = false;
        $scope.mainMenu = Menus.getMenu('main');
        $scope.menu = Menus.getMenu('topbar');
        $scope.editorMenu = Menus.getMenu('editor');
        console.log('editor Menu %O', $scope.editorMenu)
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
            $window.location.href = '/';
        };

    }
]);
