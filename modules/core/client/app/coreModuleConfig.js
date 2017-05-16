ApplicationConfiguration.registerModule('core',
  [
    'ngAnimate',
    'ngAria',
    'ngMaterial',
    'ngFileUpload',
    'ui.sortable',
    'ui.grid',
    'ngCsv',
    'ngSanitize',
    'environment',
    'toastr',
    'chart.js',
    'angular-medium-editor',
    'ui.grid.resizeColumns',
    'ui.grid.selection',
    'ui.grid.edit',
    'ui.grid.rowEdit',
    'ngUsStates'
  ])

angular.module('core').config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$urlMatcherFactoryProvider', '$compileProvider',
  function ($stateProvider, $urlRouterProvider, $httpProvider, $urlMatcherFactoryProvider, $compileProvider) {
    // To fix angular material datepicker issue with angular 1.6
    $compileProvider.preAssignBindingsEnabled(true)

    // ROOT Redirect
    $urlRouterProvider.when('/', '/authentication/signin')

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      })
    })

    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null

                // Redirect to signin page
                $location.path('signin')
                break
              case 403:
                // Add unauthorized behaviour
                break
            }

            return $q.reject(rejection)
          }
        }
      }
    ])

    var valToString = function (val) { return val && val.toString() }
    $urlMatcherFactoryProvider.type('uriType', {
      encode: valToString,
      decode: valToString,
      is: function (val) { return this.pattern.test(val) },
      pattern: /.*/
    })
    // ROUTES START
    // ROUTES START
    // ROUTES START
    $stateProvider
      //
      // UNPROTECTED PUBLIC ROUTES
      //
      .state('authentication', {
        url: '/authentication',
        templateUrl: 'modules/core/client/views/unprotected/authentication.html',
        controller: 'AuthenticationController',
        public: true,
        abstract: true
      })
      // There is a root '/' redirect to this state
      .state('authentication.signin', {
        url: '/signin?email',
        public: true,
        templateUrl: 'modules/core/client/views/unprotected/authentication.signin.html',
        params: {
          email: null
        }
      })
      .state('authentication.forgotPass', {
        url: '/forgotPass',
        public: true,
        templateUrl: 'modules/core/client/views/unprotected/authentication.forgotPass.html'
      })
      .state('authentication.reset', {
        url: '/reset?token&email',
        public: true,
        templateUrl: 'modules/core/client/views/unprotected/authentication.reset.html'
      })
      .state('getStarted', {
        url: '/getstarted',
        templateUrl: 'modules/core/client/views/unprotected/getStarted.html',
        controller: 'GetStartedController',
        public: true,
        params: {
          password: null,
          step: null
        }
      })
      .state('not-found', {
        url: '/not-found',
        templateUrl: 'modules/core/client/views/unprotected/404.html',
        data: {
          ignoreState: true
        },
        public: true
      })
      .state('bad-request', {
        url: '/bad-request',
        templateUrl: 'modules/core/client/views/unprotected/400.html',
        data: {
          ignoreState: true
        },
        public: true
      })
      .state('forbidden', {
        url: '/forbidden',
        templateUrl: 'modules/core/client/views/unprotected/403.html',
        data: {
          ignoreState: true
        },
        public: true
      })
      //
      // ADMIN ROUTES
      //
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: [1004]
        }
      })
      .state('admin.accounts', {
        url: '/accounts',
        templateUrl: 'modules/core/client/views/admin/accountsManager.html',
        controller: 'AccountsManagerController'
      })
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/core/client/views/admin/usersManager.html',
        controller: 'UsersManagerController'
      })
      .state('admin.types', {
        url: '/types',
        templateUrl: 'modules/core/client/views/admin/productTypesManager.html',
        controller: 'ProductTypesManagerController'
      })
      //
      // EDITOR ROUTES
      //
      .state('editor', {
        abstract: true,
        url: '/editor',
        template: '<ui-view/>',
        data: {
          roles: [ 1004, 1009, 1010, 1011 ]
        }
      })
      .state('editor.storeManagement', {
        url: '/storeManagement',
        templateUrl: 'modules/core/client/views/editor/editorStoreManagement.html',
        controller: 'EditorStoreManagementController'
      })
      .state('editor.history', {
        url: '/history',
        templateUrl: 'modules/core/client/views/editor/productHistory.html',
        controller: 'EditorProductHistoryController'
      })
      .state('editor.products', {
        url: '/products',
        templateUrl: 'modules/core/client/views/editor/products.html',
        controller: 'EditorProductsMasterController'
      })
      .state('editor.products.view', {
        url: '/view/:productId',
        views: {
          'sidepanel': {
            templateUrl: 'modules/core/client/views/editor/viewProduct.html',
            controller: 'EditorProductsViewController'
          }
        }
      })
      .state('editor.products.edit', {
        url: '/edit/:productId',
        views: {
          'sidepanel': {
            templateUrl: 'modules/core/client/views/editor/editProduct.html',
            controller: 'EditorProductsEditController'
          }
        }
      })
      .state('editor.products.merge', {
        url: '/merge',
        views: {
          'sidepanel': {
            templateUrl: 'modules/core/client/views/editor/mergeProducts.html',
            controller: 'EditorProductsMergeController'
          }
        }
      })
      .state('editor.products.match', {
        url: '/match/:storeId?status',
        views: {
          'match': {
            templateUrl: 'modules/core/client/views/editor/match.html',
            controller: 'EditorProductsMatchController'
          }
        },
        params: {
          status: null,
          storeId: null
        }
      })
      .state('editor.products.matchview', {
        url: '/match/:storeId/view/:productId?status',
        views: {
          'match': {
            templateUrl: 'modules/core/client/views/editor/match.html',
            controller: 'EditorProductsMatchController'
          },
          'sidepanel': {
            templateUrl: 'modules/core/client/views/editor/viewProduct.html',
            controller: 'EditorProductsViewController'
          }
        }
      })
      .state('editor.products.matchedit', {
        url: '/match/:storeId/edit/:productId?status',
        views: {
          'match': {
            templateUrl: 'modules/core/client/views/editor/match.html',
            controller: 'EditorProductsMatchController'
          },
          'sidepanel': {
            templateUrl: 'modules/core/client/views/editor/editProduct.html',
            controller: 'EditorProductsEditController'
          }
        }
      })
      .state('editor.products.matchmerge', {
        url: '/match/:storeId/merge/:productId?status',
        views: {
          'match': {
            templateUrl: 'modules/core/client/views/editor/match.html',
            controller: 'EditorProductsMatchController'
          },
          'sidepanel': {
            templateUrl: 'modules/core/client/views/editor/mergeProducts.html',
            controller: 'EditorProductsMergeController'
          }
        }
      })
      //
      // STORE OWNER ROUTES
      //
      .state('storeOwner', {
        abstract: true,
        url: '/storeOwner',
        template: '<ui-view/>',
        data: {
          roles: [ 1009, 1002, 1004 ]
        }
      })
      .state('storeOwner.home', {
        url: '/home',
        templateUrl: 'modules/core/client/views/storeOwner/home.html',
        controller: 'StoreOwnerHomeController'
      })
      .state('storeOwner.websiteEditor', {
        url: '/website/:accountId/builder{builderPath:uriType}',
        templateUrl: 'modules/core/client/views/storeOwner/websiteEditor.html',
        controller: 'StoreOwnerWebsiteEditorController',
        params: {
          resource: null
        }
      })
      .state('storeOwner.reports', {
        url: '/reports/:accountId?',
        templateUrl: 'modules/core/client/views/storeOwner/reports.html',
        controller: 'StoreOwnerReportsController'
      })
      .state('storeOwner.audience', {
        url: '/audience',
        templateUrl: 'modules/core/client/views/storeOwner/audience.html',
        controller: 'StoreOwnerAudienceController'
      })
      .state('storeOwner.products', {
        url: '/products',
        templateUrl: 'modules/core/client/views/storeOwner/products.html'
      })
      .state('storeOwner.products.listed', {
        url: '/listed',
        views: {
          'pagecontent': {
            templateUrl: 'modules/core/client/views/storeOwner/listedProducts.html',
            controller: 'StoreOwnerListedProductsController'
          }
        }
      })
      .state('storeOwner.products.promoted', {
        url: '/promoted',
        views: {
          'pagecontent': {
            templateUrl: 'modules/core/client/views/storeOwner/promotedProducts.html',
            controller: 'StoreOwnerPromotedProductsController'
          }
        }
      })
      .state('storeOwner.marketing', {
        url: '/marketing',
        templateUrl: 'modules/core/client/views/storeOwner/marketing.html'
      })
      .state('storeOwner.marketing.channels', {
        url: '/channels',
        views: {
          'pagecontent': {
            templateUrl: 'modules/core/client/views/storeOwner/marketingSettings.html',
            controller: 'StoreOwnerMarketingSettingsController'
          }
        }
      })
      .state('storeOwner.marketing.posts', {
        url: '/posts',
        views: {
          'pagecontent': {
            templateUrl: 'modules/core/client/views/storeOwner/marketingPosts.html',
            controller: 'StoreOwnerMarketingPostsController'
          }
        }
      })
      //
      // BRAND MANAGER ROUTES
      //
      .state('brand', {
        abstract: true,
        url: '/brandmanager',
        template: '<ui-view/>'
      })
      .state('brand.plans', {
        url: '/plans',
        templateUrl: 'modules/core/client/views/brand/plans.html',
        controller: 'BrandPlansController'
      })
      .state('brand.products', {
        url: '/products',
        templateUrl: 'modules/core/client/views/brand/products.html',
        controller: 'BrandProductsController'
      })
  }
])
