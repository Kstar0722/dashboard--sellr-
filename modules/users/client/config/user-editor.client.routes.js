'use strict';

// Setting up route
angular.module('users.editor.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('editor.products', {
                url: '/:type/:status',
                // controller: 'productEditorController',
                views: {
                    'list': {
                        templateUrl: 'modules/users/client/views/productEditor/productEditor.list.html'
                    },
                    'stats': {
                        templateUrl: 'modules/users/client/views/productEditor/productEditor.stats.html'
                    },
                    'detail': {
                        templateUrl: 'modules/users/client/views/productEditor/productEditor.detail.html'
                    }
                }
            })
            .state('editor.products.detail', {
                url: '/:productId/:task',
                params: {
                    task: 'view'
                },
                views: {
                    'list': {
                        templateUrl: 'modules/users/client/views/productEditor/productEditor.list.html'
                    },
                    'stats': {
                        templateUrl: 'modules/users/client/views/productEditor/productEditor.stats.html'
                    },
                    'detail': {
                        templateUrl: 'modules/users/client/views/productEditor/productEditor.detail.html'
                    }
                }
            })

    }
]);
