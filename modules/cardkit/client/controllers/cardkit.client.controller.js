'use strict';

angular.module('cardkit').controller('CardkitController', ['$scope', 'Authentication', '$cookieStore', 'clientHelper', '$state', '$stateParams', 'PostMessage', '$injector', '$timeout', 'Authorization', '$location', '$rootScope', 'Clients', 'accountsService',
    function($scope, Authentication, $cookieStore, clientHelper, $state, $stateParams, PostMessage, $injector, $timeout, Authorization, $location, $rootScope, Clients, accountsService) {
        $scope.authentication = Authentication;
        $scope.selectedClient = null;

        init();

        function init() {
            $scope.$watch(function() { return accountsService.currentAccount }, function(account) {
                if (account) $scope.themeClient = (account.preferences || {}).websiteTheme || _.buildUrl(account.name)
                else $scope.themeClient = null
            });

            initCardkit();
        }

        function initCardkit() {
            $scope.$watch('themeClient', loadClients);

            function loadClients() {
                if (!$scope.themeClient) return $rootScope.selectedClient = null;
                Clients.query().$promise.then(function(clients) {
                    var oldClient = $rootScope.selectedClient;
                    var newClient = clientHelper.resolveStateClientName(clients, $scope.themeClient);
                    $rootScope.selectedClient = newClient;
                    if (!newClient || oldClient == newClient) return;
                    Authorization.authorizeSellr($scope.themeClient).finally(function() {
                        if (oldClient || $state.is('cardkit.listPages')) {
                            $state.go('cardkit.listPages_client', { clientSlug: $scope.themeClient }, { reload: true });
                        }
                    });
                });
            }
        }
    }
]);
