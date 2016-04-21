'use strict';

// Setting up route
angular.module('core.editor.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('editor', {
                abstract: true,
                url: '',
                template: '<ui-view/>',
                data: {
                    roles: ['editor']
                }
            });
    }
]);
