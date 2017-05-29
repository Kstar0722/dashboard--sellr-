(function() {
    'use strict';

    angular
        .module('cardkit.clients')
        .factory('clientHelper', clientHelper);

    clientHelper.$inject = ['logger', '$q', '$cookieStore', 'Clients', 'Authentication', '$state', '$stateParams'];

    function clientHelper(logger, $q, $cookieStore, Clients, Authentication, $state, $stateParams) {
        var service = {
            getClientByName: getClientByName,
            getIndex: getIndex,
            addClietVariesToLess: addClietVariesToLess,
            editClientUpdate: editClientUpdate,
            loadClients: loadClients,
            bindSelectedClient: bindSelectedClient,
            resolveStateClientName: resolveStateClientName,
            displayList: displayList
        };
        return service;

        function displayList(clients, compact) {
            var delimiter = compact !== false ? ', ' : '\n';
            var names = _.map(clients, 'companyName').sort();
            if (compact && names.length >= 4) {
                return names.slice(0, 2).join(delimiter) + ' and ' + (names.length - 2) + ' more...';
            }
            return names.join(delimiter);
        }

        function getClientByName(clients, name) {
            for (var i = 0; i < clients.length; i += 1) {
                if (clients[i].companyName == name) {
                    return clients[i];
                }
            }
            return false;
        };

        function addClietVariesToLess(variables) {
            var less_client_variables = '';
            if (variables) {
                for (var i = 0; i < variables.length; i += 1) {
                    if (!variables[i]) continue;
                    if (variables[i].kind == 'File' || variables[i].kind == 'Video' || variables[i].kind == 'Font') {
                        less_client_variables = less_client_variables.concat(variables[i].variable, ":'", variables[i].value, "';\n");
                    } else {
                        less_client_variables = less_client_variables.concat(variables[i].variable, ":", variables[i].value, ";\n");
                    }
                }
            }
            less_client_variables = less_client_variables + '\n';
            return less_client_variables;
        };

        function getIndex(clients, client) {
            for (var i = 0; i < clients.length; i += 1) {
                if (clients[i]._id == client._id) {
                    return i;
                }
            }
            return -1;
        }

        function editClientUpdate(client, title, entity) {
            var _client = client;
            return _client.$update(function() {
                if (title == 'add') {
                    logger.success('Client ' + entity + ' added successfully');
                } else if (title == 'update') {
                    logger.success('Client ' + entity + ' updated successfully');
                } else if (title == 'remove') {
                    logger.success('Client ' + entity + ' removed successfully');
                }
                //$location.path('clients/' + _client._id + '/edit');
            }, function(errorResponse) {
                var error = errorResponse.data.message;
                console.log(error);
                return $q.reject(errorResponse);
            });
        }

        function loadClients(scope) {
            return Clients.query().$promise.then(function(clients) {
                scope = scope || {};

                var user = Authentication.cardkit.user || {};
                var userClients = _.unionItems(user.clients, user.client);
                var userClient = (userClients.length == 1 ? userClients[0] : null);

                // map clients by name
                userClients = _.map(userClients, function(client) {
                    return _.find(clients, { companyName: client }) || client;
                });

                if (_.isEmbedMode()) scope.selectedClient = resolveStateClientName(userClients);
                else scope.selectedClient = resolveStateClientName(userClients) || $cookieStore.get('list-pages-client') || $cookieStore.get('post-client') || (user && user.role == 'admin' && user.defaultClient) || userClient || null;

                if (user.role != 'admin' && !_.contains(userClients, scope.selectedClient)) {
                    scope.selectedClient = null;
                }

                clients = _.sortBy(clients, 'companyName');

                if (user.role == 'client' || user.role == 'contentContributor') {
                    clients = _.filter(clients, function(client) {
                        return _.contains(_.unionItems(user.clients, user.client), client.companyName);
                    });
                }

                if (clients.length == 1) {
                    scope.selectedClient = clients[0].companyName;
                }

                if (!_.some(clients, function(client) { return client.companyName == scope.selectedClient; })) {
                    scope.selectedClient = null;
                }

                if (!scope.selectedClient && clients.length == 1) {
                    scope.selectedClient = clients[0].companyName;
                }

                scope.selectedClient = resolveStateClientName(clients) || scope.selectedClient || (user && user.role == 'admin' && user.defaultClient);

                return scope.clients = clients;
            });
        }

        function bindSelectedClient($scope, context) {
            bindRootProperty($scope, 'selectedClient', context);
        }

        // set up two-way binding to parent property
        function bindRootProperty($scope, name, context) {
            (context || $scope)[name] = $scope.$root[name];

            $scope.$watch('$root.' + name, function(value) {
                (context || $scope)[name] = value;
            });

            $scope.$watch(function() {
                return (context || $scope)[name];
            }, function(value) {
                $scope.$root[name] = value;
            });
        }

        function resolveStateClientName(clients, clientSlug) {
            if ($stateParams.clientSlug || clientSlug) {
                var slug = $stateParams.clientSlug || clientSlug;
                var clientName = resolveClientName(clients, slug)
                return clientName;
            }
            if ($stateParams.clientId) {
                var clientName = resolveClientName(clients, $stateParams.clientId);
                if (clientName) return clientName;
                var client = _.find(clients, { _id: _.id($stateParams.clientId) });
                return client && client.companyName || client;
            }
            return $stateParams.clientName || null;
        }

        function resolveClientName(clients, slug) {
            var client = _.find(clients, function(c) {
                return typeof c == 'string' && _.buildUrl(c) == slug || c && c.slug == slug;
            });
            return client && client.companyName || client;
        }
    }
})();
