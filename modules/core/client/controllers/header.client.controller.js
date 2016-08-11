'use strict';

angular.module('core').controller('HeaderController', [ '$scope', 'Authentication', 'Menus', '$http', '$window', '$state', '$stateParams', 'accountsService',
    function ($scope, Authentication, Menus, $http, $window, $state, $stateParams, accountsService) {
        console.log('HELLO FROM THE HEADER')
        $scope.authentication = Authentication;
        $scope.ui = {};
        $scope.$state = $state;
        $scope.accountsService = accountsService;

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

        init();

        $scope.$watch('$root.selectAccountId', function (accountId) {
            $stateParams.accountId = accountId;
            if (accountId) $state.go('.', $stateParams, {notify: false});
        });

        $scope.$root.$on('$stateChangeSuccess', function (e, toState, toParams) {
            init();

            if (toState.name != 'dashboard' && toState.name != 'stats' && toState.name != 'storeOwner.orders' && toState.name != 'manager.ads') {
                $scope.$root.selectAccountId = null;
            }
            else if (toState) {
                toParams.accountId = $scope.$root.selectAccountId;
                $state.go(toState.name, toParams, {notify: false});
            }
        });

        function init() {
            if ($stateParams.accountId)
                $scope.$root.selectAccountId = $stateParams.accountId;
            else
                $scope.$root.selectAccountId = $scope.$root.selectAccountId || localStorage.getItem('accountId');
        }
    }
]);
