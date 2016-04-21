'use strict';

// Setting up route
angular.module('users.editor.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('editor.products', {
                url: '/editor',
                templateUrl: 'modules/users/client/views/editor/productEditor.client.view.html'
            })



    }
]);
