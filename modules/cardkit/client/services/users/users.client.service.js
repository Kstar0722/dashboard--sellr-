(function() {
    'use strict';

    angular
        .module('cardkit.users')
        .factory('Users', Users);

    Users.$inject = ['$resource', 'appConfig'];

    function Users($resource, appConfig) {
        return $resource(appConfig.CARDKIT_URL + '/users/:userId/:controller', {
                userId: '@userId'
            },
            {
                changeUserPassword: {
                    method: 'PUT',
                    params: {
                        controller: 'changePassword'
                    }
                },
                getAllUsers: {
                    method: 'GET',
                    isArray: true,
                    params: {
                        controller: 'all'
                    }
                },
                changeUserData: {
                    method: 'PUT',
                    params: {
                        controller: 'userData'
                    }
                },
                changePermissions: {
                    method: 'PUT',
                    params: {
                        controller: 'changePermissions'
                    }
                },
                get: {
                    method: 'GET',
                    params: {
                        id: 'me'
                    }
                },
                getMyCards: {
                    method: 'GET',
                    isArray: true,
                    params: {
                        controller: 'myCards'
                    }
                },
                update: {
                    method: 'PUT'
                }
            });
    }

}());
