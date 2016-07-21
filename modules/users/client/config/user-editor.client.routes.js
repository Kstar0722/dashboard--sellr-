'use strict';

// Setting up route
angular.module('users.editor.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('editor.products', {
                url: '/products',
                views: {
                    'detail': {
                        templateUrl: 'modules/users/client/views/productEditor/productEditor.detail.html'
                    }
                }
            })
            .state('editor.view', {
                url: '/view/:productId',
                views: {
                    'detail': {
                        templateUrl: 'modules/users/client/views/productEditor/productEditor.detail.view.html'
                    }
                }
            })
            .state('editor.edit', {
                url: '/edit/:productId',
                views: {
                    'detail': {
                        templateUrl: 'modules/users/client/views/productEditor/productEditor.detail.edit.html'
                    }
                }
            })
            .state('editor.merge', {
                url: '/merge',
                views: {
                    'detail': {
                        templateUrl: 'modules/users/client/views/productEditor/productEditor.merge.html'
                    }
                }
            })

            .state('searchGrid', {
                url: '/editor/searchGrid/:variable',
                controller: 'productEditorMergeController',
                templateUrl: 'modules/users/client/views/productEditor/productEditor.searchGrid.html'
            })
    }
]);
