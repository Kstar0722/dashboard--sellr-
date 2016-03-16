'use strict';

// Setting up route
angular.module('users.storeOwner.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('storeOwner.inviteUser', {
                url: '/invite',
                templateUrl: 'modules/users/client/views/storeOwner/userInvite.client.view.html',
                controller:'StoreOwnerInviteController'
            })



    }
]);
