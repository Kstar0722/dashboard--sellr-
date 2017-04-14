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
      // GENERAL ROUTES
      //
      .state('home', {
        url: '/',
        templateUrl: 'modules/core/client/views/home.client.view.html',
        controller: 'HomeController',
        public: true
      })
      .state('not-found', {
        url: '/not-found',
        templateUrl: 'modules/core/client/views/404.client.view.html',
        data: {
          ignoreState: true
        },
        public: true
      })
      .state('bad-request', {
        url: '/bad-request',
        templateUrl: 'modules/core/client/views/400.client.view.html',
        data: {
          ignoreState: true
        },
        public: true
      })
      .state('forbidden', {
        url: '/forbidden',
        templateUrl: 'modules/core/client/views/403.client.view.html',
        data: {
          ignoreState: true
        },
        public: true
      })
      .state('productsUploader', {
        url: '/products/:accountId?',
        templateUrl: 'modules/users/client/views/admin/products-uploader.client.view.html'
      })
      .state('websiteBuilder', {
        url: '/website/:accountId/builder{builderPath:uriType}',
        templateUrl: 'modules/users/client/views/websiteBuilder/websiteBuilder.client.view.html',
        params: {
          resource: null
        }
      })
      .state('getStarted', {
        url: '/getstarted',
        templateUrl: 'modules/users/client/views/authentication/getStarted.client.view.html',
        public: true,
        params: {
          password: null,
          step: null
        }
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
        templateUrl: 'modules/users/client/views/admin/accountsManager.html',
        controller: 'AccountsManagerController'
      })
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/usersManager.html',
        controller: 'UsersManagerController'
      })
      .state('admin.device', {
        url: '/device',
        templateUrl: 'modules/users/client/views/admin/device-manager.client.view.html',
        controller: 'DeviceManagerController'
      })
      //
      // EDITOR ROUTES
      //
      .state('editor', {
        abstract: true,
        url: '/editor',
        template: '<ui-view/>',
        data: {
          roles: [ 1010, 1011, 1004 ]
        }
      })
      .state('editor.storeManagement', {
        url: '/storeManagement',
        templateUrl: 'modules/users/client/views/editor/editorStoreManagement.html',
        controller: 'EditorStoreManagementController'
      })
      .state('editor.history', {
        url: '/history',
        templateUrl: 'modules/users/client/views/editor/productHistory.html',
        controller: 'EditorProductHistoryController'
      })
      .state('editor.products', {
        url: '/products',
        templateUrl: 'modules/users/client/views/editor/products.html',
        controller: 'EditorProductsMasterController'
      })
      .state('editor.products.view', {
        url: '/view/:productId',
        views: {
          'sidepanel': {
            templateUrl: 'modules/users/client/views/editor/viewProduct.html',
            controller: 'EditorProductsViewController'
          }
        }
      })
      .state('editor.products.edit', {
        url: '/edit/:productId',
        views: {
          'sidepanel': {
            templateUrl: 'modules/users/client/views/editor/editProduct.html',
            controller: 'EditorProductsEditController'
          }
        }
      })
      .state('editor.products.merge', {
        url: '/merge',
        views: {
          'sidepanel': {
            templateUrl: 'modules/users/client/views/editor/mergeProducts.html',
            controller: 'EditorProductsMergeController'
          }
        }
      })
      .state('editor.products.match', {
        url: '/match/:storeId?status',
        views: {
          'match': {
            templateUrl: 'modules/users/client/views/editor/match.html',
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
            templateUrl: 'modules/users/client/views/editor/match.html',
            controller: 'EditorProductsMatchController'
          },
          'sidepanel': {
            templateUrl: 'modules/users/client/views/editor/viewProduct.html',
            controller: 'EditorProductsViewController'
          }
        }
      })
      .state('editor.products.matchedit', {
        url: '/match/:storeId/edit/:productId?status',
        views: {
          'match': {
            templateUrl: 'modules/users/client/views/editor/match.html',
            controller: 'EditorProductsMatchController'
          },
          'sidepanel': {
            templateUrl: 'modules/users/client/views/editor/editProduct.html',
            controller: 'EditorProductsEditController'
          }
        }
      })
      //
      // MANAGER ROUTES
      //
      .state('manager', {
        abstract: true,
        url: '',
        template: '<ui-view/>',
        data: {
          roles: [1002]
        }
      })
      .state('manager.ads', {
        url: '/ads/:accountId?',
        templateUrl: 'modules/users/client/views/manager/adsmanager.client.view.html',
        controller: 'AdsmanagerController'
      })
      .state('manager.uploads', {
        url: '/manager/uploader',
        templateUrl: 'modules/users/client/views/manager/managerUpload.client.view.html'

      })
      .state('manager.stores', {
        url: '/manager/stores',
        templateUrl: 'modules/users/client/views/manager/storeManager.client.view.html',
        controller: 'StoreManagerController'
      })
      .state('manager.stores.edit', {
        url: '/edit/:id',
        templateUrl: 'modules/users/client/views/manager/storeManager.edit.client.view.html'
      })
      .state('manager.stores.create', {
        url: '/new',
        templateUrl: 'modules/users/client/views/manager/storeManager.create.client.view.html'
      })
      .state('manager.accounts', {
        url: '/manager/accounts',
        templateUrl: 'modules/users/client/views/manager/accountManager.client.view.html',
        controller: 'AccountManagerController'
      })
      .state('manager.accounts.edit', {
        url: '/edit/:id',
        templateUrl: 'modules/users/client/views/manager/accountManager.edit.client.view.html'
      })
      .state('manager.accounts.create', {
        url: '/new',
        templateUrl: 'modules/users/client/views/manager/accountManager.create.client.view.html'
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
      .state('storeOwner.inviteUser', {
        url: '/invite',
        templateUrl: 'modules/users/client/views/storeOwner/userInvite.client.view.html',
        controller: 'StoreOwnerInviteController'
      })
      .state('storeOwner.orders', {
        url: '/orders/:accountId?',
        templateUrl: 'modules/users/client/views/storeOwner/orders.client.view.html',
        controller: 'StoreOwnerOrdersController'
      })
      .state('storeOwner.reports', {
        url: '/reports/:accountId?',
        templateUrl: 'modules/users/client/views/storeOwner/reports.html',
        controller: 'StoreOwnerReportsController'
      })
      .state('storeOwner.products', {
        url: '/products',
        templateUrl: 'modules/users/client/views/storeOwner/products.html',
        controller: 'StoreOwnerProductsController'
      })
      .state('storeOwner.products.listed', {
        url: '/listed',
        views: {
          'pagecontent': {
            templateUrl: 'modules/users/client/views/storeOwner/listedProducts.html',
            controller: 'StoreOwnerListedProductsController'
          }
        }
      })
      .state('storeOwner.products.promoted', {
        url: '/promoted',
        views: {
          'pagecontent': {
            templateUrl: 'modules/users/client/views/storeOwner/promotedProducts.html',
            controller: 'StoreOwnerPromotedProductsController'
          }
        }
      })
      //
      // SUPPLIER ROUTES
      //
      .state('supplier', {
        abstract: true,
        url: '',
        template: '<ui-view/>',
        data: {
          roles: [1007]
        }
      })
      .state('supplier.media', {
        url: '/supplier',
        templateUrl: 'modules/users/client/views/supplier/media.client.view.html'
      })
      .state('supplier.assets', {
        url: '/supplier/assets',
        templateUrl: 'modules/users/client/views/supplier/assets.client.view.html'
      })
      //
      // SETTINGS ROUTES
      //
      .state('settings', {
        url: '/account/:accountId?',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        controller: function ($state, $stateParams, $timeout) {
          if ($state.is('settings')) {
            $timeout(function () {
              $state.go('settings.profile', $stateParams)
            })
          }
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/my-profile.client.view.html'
      })
      .state('settings.store', {
        url: '/store',
        templateUrl: 'modules/users/client/views/settings/store-profile.client.view.html'
      })
      .state('settings.tablets', {
        url: '/tablets',
        templateUrl: 'modules/users/client/views/settings/tablets.client.view.html'
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
      })
      //
      // AUTHENTICATION ROUTES
      //
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html',
        public: true
      })
      .state('authentication.acceptInvitation', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/acceptInvitation.client.view.html',
        public: true
      })
      .state('authentication.reset', {
        url: '/reset',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html',
        public: true
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html',
        public: true,
        params: {
          email: null
        }
      })
      //
      // PASSWORD ROUTES
      //
      .state('mypassword.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html',
        public: true
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>',
        public: true
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
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
        templateUrl: 'modules/users/client/views/brand/plans.html',
        controller: 'BrandPlansController'
      })
      .state('brand.products', {
        url: '/products',
        templateUrl: 'modules/users/client/views/brand/products.html',
        controller: 'BrandProductsController'
      })
  }
])
