'use strict';

angular.module('cardkit').controller('CardkitController', ['$scope', 'Authentication', '$cookieStore', 'clientHelper', '$state', '$stateParams', 'PostMessage', '$injector',
    function($scope, Authentication, $cookieStore, clientHelper, $state, $stateParams, PostMessage, $injector) {
        $scope.authentication = Authentication;
        $scope.selectedClient = null;
        $scope.$injector = $injector;

        var resolveClient = clientHelper.resolveStateClientName;

        init();

        function init() {
            PostMessage.on('selectAccount', function(account) {
                $scope.account = account
                $scope.themeClient = account.preferences.websiteTheme || _.buildUrl(account.name)
            })

            initCardkit();
        }

        function initCardkit() {
            initSelectedClient();

            $scope.$watch(function() { return Authentication.cardkit.user; }, loadClients);
            $scope.$watch('themeClient', loadClients);
            $scope.$root.$on('clients.reload', loadClients);

            function loadClients() {
                clientHelper.loadClients($scope).then(function() {
                    $scope.selectedClient = resolveClient($scope.clients, $scope.themeClient) || $scope.selectedClient;
                });
            }
        }

        function initSelectedClient() {
            var resolveClient = clientHelper.resolveStateClientName;

            if (!$state.current.name) {
                var unsubscribe = $scope.$root.$on('$stateChangeSuccess', function() {
                    unsubscribe(); // once
                    initSelectedClient(); // retry
                });

                return;
            }

            if (_.isEmbedMode()) $scope.$root.selectedClient = resolveClient($scope.clients) || null;
            else {
                var user = Authentication.cardkit.user;
                $scope.$root.selectedClient = resolveClient($scope.clients) || $cookieStore.get('list-pages-client') || (user && user.role == 'admin' && user.defaultClient) || null;
            }

            clientHelper.bindSelectedClient($scope);
        }
    }
]);
