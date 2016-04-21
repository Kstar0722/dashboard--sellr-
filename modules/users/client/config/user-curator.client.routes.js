'use strict';

// Setting up route
angular.module('users.curator.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('curator.assign', {
                url: '/assign',
                templateUrl: 'modules/users/client/views/productEditor/productEditor.parent.html'
            })

    }
]);
