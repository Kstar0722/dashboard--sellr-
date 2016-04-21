'use strict';

// Setting up route
angular.module('users.editor.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('editor.products', {
                url: '/editor',
                templateUrl: 'modules/users/client/views/productEditor/productEditor.parent.html'
            })



    }
]);
