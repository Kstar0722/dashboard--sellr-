'use strict';

angular.module('cardkit').controller('CardkitController', ['$scope', 'Authentication', '$cookieStore', 'clientHelper', '$state', '$stateParams', 'PostMessage', '$injector', '$timeout', 'Authorization', '$location', '$rootScope', 'Clients',
    function($scope, Authentication, $cookieStore, clientHelper, $state, $stateParams, PostMessage, $injector, $timeout, Authorization, $location, $rootScope, Clients) {
        $scope.authentication = Authentication;
        $scope.selectedClient = null;

        init();

        function init() {
            $scope.$watch('$root.selectAccount', function(account) {
                if (account) $scope.themeClient = account.preferences.websiteTheme || _.buildUrl(account.name)
                else $scope.themeClient = null
            });

            initCardkit();
        }

        function initCardkit() {
            clientHelper.bindSelectedClient($scope);

            $scope.$watch('themeClient', loadClients);

            function loadClients() {
                if (!$scope.themeClient) return $rootScope.selectedClient = null;
                Clients.query().$promise.then(function(clients) {
                    var newClient = clientHelper.resolveStateClientName(clients, $scope.themeClient);
                    if (!newClient || $rootScope.selectedClient == newClient) return;
                    $rootScope.selectedClient = newClient;
                    Authorization.authorizeSellr($scope.themeClient).finally(function() {
                        $state.go('cardkit.listPages_client', { clientSlug: $scope.themeClient }, { reload: true });
                    });
                });
            }
        }
    }
]);
