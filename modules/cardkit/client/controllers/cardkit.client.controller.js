'use strict';

angular.module('cardkit').controller('CardkitController', ['$scope', 'Authentication', '$cookieStore', 'clientHelper', '$state', '$stateParams', 'PostMessage', '$injector', '$timeout', 'Authorization', '$location', '$rootScope',
    function($scope, Authentication, $cookieStore, clientHelper, $state, $stateParams, PostMessage, $injector, $timeout, Authorization, $location, $rootScope) {
        $scope.authentication = Authentication;
        $scope.selectedClient = null;
        $scope.$injector = $injector;

        var resolveClient = clientHelper.resolveStateClientName;

        init();

        function init() {
            $scope.$watch('$root.selectAccount', function(account) {
                if (!account) return
                $scope.account = account
                $scope.themeClient = account.preferences.websiteTheme || _.buildUrl(account.name)
            });

            initCardkit();
        }

        function initCardkit() {
            clientHelper.bindSelectedClient($scope);

            $scope.$watch(function() { return Authentication.cardkit.user; }, loadClients);
            $scope.$watch('themeClient', loadClients);

            function loadClients() {
                if (!$scope.themeClient) return;
                clientHelper.loadClients($scope).then(function() {
                    $rootScope.selectedClient = resolveClient($scope.clients, $scope.themeClient) || $rootScope.selectedClient;
                    if ($rootScope.selectedClient) Authorization.authorizeSellr($location.url());
                });
            }
        }
    }
]);
