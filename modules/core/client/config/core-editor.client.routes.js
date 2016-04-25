'use strict';

// Setting up route
angular.module('core.editor.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('editor', {
                url: '/editor',
                // resolve: {
                //     type: [ '$stateParams', function ($stateParams) {
                //         return $stateParams.type
                //     } ],
                //     status: [ '$stateParams', function ($stateParams) {
                //         return $stateParams.status
                //     } ]
                // },
                templateUrl: 'modules/users/client/views/productEditor/productEditor.parent.html',
                controller: 'productEditorController',
                // template: '<ui-view/>',
                data: {
                    roles: [ 'editor', 'curator', 'admin' ]
                }
            });
    }
]);
