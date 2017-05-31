(function() {
    'use strict';

    angular.module('cardkit.core').service('routeTracker', routeTracker);

    routeTracker.$inject = ['$state', '$rootScope', '$cookieStore', 'PostMessage', '$stateParams'];

    function routeTracker($state, $rootScope, $cookieStore, PostMessage, $stateParams) {
        var trackState = _.debounce(function(state, params) {
            if (!$state.get(state)) return;
            $state.go(state, params, { notify: false, reload: false, location: 'replace' }).then(function() {
                console.log('slug', $stateParams.clientSlug)
            })

            var url = $state.href(state, params);
            PostMessage.send('routeChange', url);
        }, 100);

        $rootScope.$on('$stateChangeSuccess', function(event, next, nextParams) {
            trackState(next, nextParams);
        });

        function rootState() {
            return $state.current.name.split('_')[0];
        }

        function trackSelectedClientState(selectedClient, force) {
            if (!force) {
                if (selectedClient && $state.current.name == rootState() + '_client') return;
                if (!selectedClient && $state.current.name == rootState()) return;
            }

            var clientName = selectedClient && selectedClient.companyName || selectedClient;
            var clientSlug = selectedClient && selectedClient.slug ? selectedClient.slug : _.buildUrl(clientName);
            $cookieStore.put('list-pages-client', clientName || '');

            trackState(selectedClient ? rootState() + '_client' : rootState(), { clientSlug: clientSlug });
        }

        return {
            rootState: rootState,
            trackState: trackState,
            trackSelectedClientState: trackSelectedClientState
        };
    }
})();
