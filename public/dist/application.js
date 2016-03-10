'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload'];

  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider', 'envServiceProvider',
    function ($locationProvider, $httpProvider, envServiceProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

        $httpProvider.interceptors.push('authInterceptor');       //  MEANJS/Mongo interceptor
        $httpProvider.interceptors.push('oncueAuthInterceptor');  //  Oncue Auth Interceptor (which adds token) to outgoing HTTP requests


        //SET ENVIRONMENT

        // set the domains and variables for each environment
        envServiceProvider.config({
            domains: {
                local: ['localhost'],
                development: ['mystique.expertoncue.com', 'mystique.expertoncue.com:3000', 'betadashboard.expertoncue.com', 'dashboarddev.expertoncue.com'],
                production: ['dashboard.expertoncue.com', '*.herokuapp.com','testdashboard.expertoncue.com']
            },
            vars: {
                local: {
                    API_URL: 'http://localhost:7272'
                },
                development: {
                    API_URL: 'http://mystique.expertoncue.com:7272'
                },
                production: {
                    API_URL: 'https://api.expertoncue.com'
                }
            }
        });

        // run the environment check, so the comprobation is made
        // before controllers and services are built
        envServiceProvider.check();
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(["$rootScope", "$state", "Authentication", function ($rootScope, $state, Authentication) {

  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;
      toState.data.roles.forEach(function (role) {
        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
          allowed = true;
          return true;
        }
      });

      if (!allowed) {
        event.preventDefault();
        if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
          $state.go('forbidden');
        } else {
          $state.go('authentication.signin').then(function () {
            storePreviousState(toState, toParams);
          });
        }
      }
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    storePreviousState(fromState, fromParams);
  });

  // Store previous state
  function storePreviousState(state, params) {
    // only store this state if it shouldn't be ignored 
    if (!state.data || !state.data.ignoreState) {
      $state.previous = {
        state: state,
        params: params,
        href: $state.href(state, params)
      };
    }
  }
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core', ['ngAnimate', 'ngAria', 'ngMaterial', 'ngFileUpload', 'ui.sortable', 'ngCsv', 'ngSanitize', 'environment', 'toastr', 'chart.js']);
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);
ApplicationConfiguration.registerModule('core.supplier', ['core']);
ApplicationConfiguration.registerModule('core.supplier.routes', ['ui.router']);

ApplicationConfiguration.registerModule('core.manager', ['core']);
ApplicationConfiguration.registerModule('core.manager.routes', ['ui.router']);
ApplicationConfiguration.registerModule('core.storeOwner', ['core']);
ApplicationConfiguration.registerModule('core.storeOwner.routes', ['ui.router']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);
ApplicationConfiguration.registerModule('users.supplier', ['core.supplier']);
ApplicationConfiguration.registerModule('users.supplier.routes', ['core.supplier.routes']);
ApplicationConfiguration.registerModule('users.manager', ['core.manager']);
ApplicationConfiguration.registerModule('users.manager.routes', ['core.manager.routes']);
ApplicationConfiguration.registerModule('users.storeOwner', ['core.storeOwner']);
ApplicationConfiguration.registerModule('users.storeOwner.routes', ['core.storeOwner.routes']);

'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
      Menus.addMenuItem('topbar', {
          title: 'Admin',
          state: 'admin',
          type: 'dropdown',
          roles: ['admin']
      });
  }
]);

'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('admin', {
                abstract: true,
                url: '/admin',
                template: '<ui-view/>',
                data: {
                    roles: ['admin']
                }
            });
    }
]);

'use strict';

angular.module('core.manager').run(['Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', {
            title: 'Manager',
            state: 'manager',
            type: 'dropdown',
            roles: ['manager']
        });

    }
]);

'use strict';

// Setting up route
angular.module('core.manager.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('manager', {
                abstract: true,
                url: '',
                template: '<ui-view/>',
                data: {
                    roles: ['manager']
                }
            });
    }
]);

'use strict';

angular.module('core.storeOwner').run(['Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', {
            title: 'Store Owner',
            state: 'storeOwner',
            type: 'dropdown',
            roles: ['store owner']
        });

    }
]);

'use strict';

// Setting up route
angular.module('core.storeOwner.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('storeOwner', {
                abstract: true,
                url: '',
                template: '<ui-view/>',
                data: {
                    roles: ['store owner']
                }
            });
    }
]);

'use strict';

angular.module('core.supplier').run(['Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', {
            title: 'Supplier',
            state: 'supplier',
            type: 'dropdown',
            roles: ['supplier']
        });

    }
]);

'use strict';

// Setting up route
angular.module('core.supplier.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('supplier', {
                abstract: true,
                url: '',
                template: '<ui-view/>',
                data: {
                    roles: ['supplier']
                }
            });
    }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {



        // Redirect to 404 when route not found
        $urlRouterProvider.otherwise(function ($injector, $location) {
            $injector.get('$state').transitionTo('not-found', null, {
                location: false
            });
        });

        // Home state routing
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'modules/core/client/views/home.client.view.html',
                controller: 'HomeController'
            })
            .state('not-found', {
                url: '/not-found',
                templateUrl: 'modules/core/client/views/404.client.view.html',
                data: {
                    ignoreState: true
                }
            })
            .state('bad-request', {
                url: '/bad-request',
                templateUrl: 'modules/core/client/views/400.client.view.html',
                data: {
                    ignoreState: true
                }
            })
            .state('forbidden', {
                url: '/forbidden',
                templateUrl: 'modules/core/client/views/403.client.view.html',
                data: {
                    ignoreState: true
                }
            });
    }
]);


'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', '$http', '$window',
    function ($scope, Authentication, Menus, $http, $window) {
        $scope.authentication = Authentication;
        $scope.ui = {};

        var originatorEv;
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');

        $scope.toggleCollapsibleMenu = function () {
            $scope.isCollapsed = !$scope.isCollapsed;
        };
        $scope.openMenu = function($mdOpenMenu, ev) {
            console.log('hello')
            originatorEv = ev;
            $mdOpenMenu(ev);
        };
        $scope.signOut = function () {
            localStorage.clear();
            $http.get('/auth/signout')
                .success(function () {

                    $window.location.href = '/';
                })
                .error(function (err) {
                    console.log('error', err);
                })
        };

        //$scope.$watch('ui.toolbarOpened', function (opened) {
        //    if (!opened) {
        //        $scope.ui.toolbarOpened = true;
        //    }
        //});

        // Collapsing the menu after navigation
        //$scope.$on('$stateChangeSuccess', function () {
        //    $scope.isCollapsed = false;
        //});
    }
]);

'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$mdDialog', '$state',
    function ($scope, Authentication, $mdDialog, $state) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
        var check = false;
        //PERFECTLY FUNCTIONAL! DO NOT TOUCH
        if(!$scope.authentication.user != !check){
            $state.go('manager.dashboard')
        }
        $scope.userIsSupplier = function () {
            if (_.contains(Authentication.user.roles, 'supplier')) {
                return true;
            }
        };
        $scope.testFunction = function (ev) {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('This is an alert title')
                    .textContent('You can specify some description text in here.')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Got it!')
                    .targetEvent(ev)
            );
            console.log('test');
        };

    }
]);

'use strict';

/**
 * Edits by Ryan Hutchison
 * Credit: https://github.com/paulyoder/angular-bootstrap-show-errors */

angular.module('core')
  .directive('showErrors', ['$timeout', '$interpolate', function ($timeout, $interpolate) {
    var linkFn = function (scope, el, attrs, formCtrl) {
      var inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses,
        initCheck = false,
        showValidationMessages = false,
        blurred = false;

      options = scope.$eval(attrs.showErrors) || {};
      showSuccess = options.showSuccess || false;
      inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
      inputNgEl = angular.element(inputEl);
      inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

      if (!inputName) {
        throw 'show-errors element has no child input elements with a \'name\' attribute class';
      }

      var reset = function () {
        return $timeout(function () {
          el.removeClass('has-error');
          el.removeClass('has-success');
          showValidationMessages = false;
        }, 0, false);
      };

      scope.$watch(function () {
        return formCtrl[inputName] && formCtrl[inputName].$invalid;
      }, function (invalid) {
        return toggleClasses(invalid);
      });

      scope.$on('show-errors-check-validity', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          initCheck = true;
          showValidationMessages = true;

          return toggleClasses(formCtrl[inputName].$invalid);
        }
      });

      scope.$on('show-errors-reset', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          return reset();
        }
      });

      toggleClasses = function (invalid) {
        el.toggleClass('has-error', showValidationMessages && invalid);
        if (showSuccess) {
          return el.toggleClass('has-success', showValidationMessages && !invalid);
        }
      };
    };

    return {
      restrict: 'A',
      require: '^form',
      compile: function (elem, attrs) {
        if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
          if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
            throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
          }
        }
        return linkFn;
      }
    };
  }]);

angular.module('core').factory('authToken', ["$window", function ($window) {

  var me = this;
  var storage = $window.localStorage;
  var cachedToken;
  var userToken = 'token';

// Save Token to Storage as 'token'
  function setToken(token) {
    cachedToken = token;
    storage.setItem(userToken, token);

  }

// Get token 'token' from storage
  function getToken() {
    if (!cachedToken)
      cachedToken = storage.getItem(userToken);
    return cachedToken
  }

// Returns true or false based on whether or not token exists in storage
  function isAuthenticated() {
    return !!getToken();
  }

//Removes token
  function removeToken() {
    cachedToken = null;
    storage.removeItem(userToken)
  }

  me.setToken = setToken;
  me.getToken = getToken;
  me.isAuthenticated = isAuthenticated;
  me.removeToken = removeToken;

  return me;
}]);

'use strict';

angular.module('core').factory('authInterceptor', ['$q', '$injector',
  function ($q, $injector) {
    return {
      responseError: function(rejection) {
        if (!rejection.config.ignoreAuthModule) {
          switch (rejection.status) {
            case 401:
              $injector.get('$state').transitionTo('authentication.signin');
              break;
            case 403:
              $injector.get('$state').transitionTo('forbidden');
              break;
          }
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }
]);

angular.module('core')
    .factory('oncueAuthInterceptor', ["authToken", function (authToken) {

        return {
            request: function (config) {
                var token = authToken.getToken();  //Gets token from local storage
                if (token)
                    config.headers.Authorization = 'Bearer ' + token;  //Attaches token to header with Bearer tag

                return config

            },
            response: function (response) {
                return response

            }
        }
    }]);


'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function () {
    // Define a set of default roles
    this.defaultRoles = ['user', 'admin'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function (user) {
      if (!!~this.roles.indexOf('*')) {
        return true;
      } else {
        if(!user) {
          return false;
        }
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function (menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[menuId] = {
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function (menuId, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.state, options.items[i]);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      roles: ['*']
    });
  }
]);

'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function () {
      // Connect only when authenticated
      if (Authentication.user) {
        this.socket = io();
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function (eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function (eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);

'use strict';

// Configuring the Articles module
angular.module('users.manager').run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'manager', {
            title: 'Dashboard',
            state: 'manager.dashboard'
        });
        Menus.addSubMenuItem('topbar', 'manager', {
            title: 'Ads',
            state: 'manager.ads'
        });
        Menus.addSubMenuItem('topbar', 'manager', {
            title: 'Locations',
            state: 'manager.locations'
        });
        Menus.addSubMenuItem('topbar', 'manager', {
            title: 'Accounts',
            state: 'manager.accounts'
        });
    }
]);

'use strict';

// Setting up route
angular.module('users.manager.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('manager.dashboard', {
                url: '/dashboard',
                templateUrl: 'modules/users/client/views/manager/dashboard.client.view.html'
            })
            .state('manager.ads', {
                url: '/manager/admanager',
                templateUrl: 'modules/users/client/views/manager/admanager.client.view.html',
                controller:'AdmanagerController'
            })
            .state('manager.uploads', {
                url: '/manager/uploader',
                templateUrl: 'modules/users/client/views/manager/managerUpload.client.view.html'

            })
            .state('manager.locations', {
                url: '/manager/locations',
                templateUrl: 'modules/users/client/views/manager/locationManager.client.view.html',
                controller: 'LocationManagerController'
            })
            .state('manager.locations.edit', {
                url: '/edit/:id',
                templateUrl: 'modules/users/client/views/manager/locationManager.edit.client.view.html',
            })
            .state('manager.locations.create', {
                url: '/new',
                templateUrl: 'modules/users/client/views/manager/locationManager.create.client.view.html'
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

    }
]);

'use strict';

// Configuring the Articles module
angular.module('users.storeOwner').run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'storeOwner', {
            title: 'Invite User',
            state: 'storeOwner.inviteUser'
        });

    }
]);

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

'use strict';

// Configuring the Articles module
angular.module('users.supplier').run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'supplier', {
            title: 'Suppliers',
            state: 'supplier.media'
        });

    }
]);

'use strict';

// Setting up route
angular.module('users.supplier.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('supplier.media', {
                url: '/supplier',
                templateUrl: 'modules/users/client/views/supplier/media.client.view.html'
            })
            .state('supplier.assets', {
                url: '/supplier/assets',
                templateUrl: 'modules/users/client/views/supplier/assets.client.view.html'
            })


    }
]);

'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'admin', {
            title: 'Users',
            state: 'admin.users'
        });
        Menus.addSubMenuItem('topbar', 'admin', {
            title: 'Pricing',
            state: 'admin.pricing'
        });
    }
]);

'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('admin.users', {
                url: '/users',
                templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
                controller: 'UserListController'
            })
            .state('admin.users.edit', {
                url: '/:userId',
                templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
                controller: 'UserController',
                resolve: {
                    userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
                        return Admin.get({
                            userId: $stateParams.userId
                        });
                    }]
                }
            })
            .state('admin.users.store', {
                templateUrl: 'modules/users/client/views/admin/userInvite.client.view.html',
                controller: 'inviteUserController'

            })
            .state('admin.users.user-edit', {
                url: '/:userId/edit',
                templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
                controller: 'UserController',
                resolve: {
                    userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
                        return Admin.get({
                            userId: $stateParams.userId
                        });
                    }]
                }
            })
            .state('admin.pricing', {
                url: '/admin/pricing',
                templateUrl: 'modules/users/client/views/admin/pricing.client.view.html',
                controller: 'AdminPricingController'

            })
    }
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
        .state('admanager', {
          abstract: true,
          url: '/admanager',
          templateUrl: 'modules/users/client/views/settings/admanager.client.view.html',
          data: {
            roles: ['user']
          }
        })
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
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
      });

  }
]);

'use strict';

angular.module('users.admin').controller('inviteUserController', ['$scope', '$state', '$http', 'Authentication', 'constants', 'toastr', 'accountsService',
    function ($scope, $state, $http, Authentication, constants, toastr, accountsService) {

        $scope.myPermissions = localStorage.getItem('roles');
        $scope.accountsService = accountsService;
        $scope.authentication = Authentication;
        console.log('authentication %O', $scope.authentication)

        $scope.roles = [
            {text: 'admin', id: 1004},
            {text: 'store owner', id: 1006},
            {text: 'manager', id: 1002},
            {text: 'supplier', id: 1007},
            {text: 'user', id: 1003}
        ];
        $scope.user = {
            accountId: localStorage.getItem('accountId')
        };



        $scope.toggleRole = function (roleId) {
            $scope.user.roles = $scope.user.roles || [];

            //if role exists, remove it
            if ($scope.user.roles.indexOf(roleId) > -1) {
                $scope.user.roles.splice($scope.user.roles.indexOf(roleId), 1);

            }
            else {
                //insert role
                $scope.user.roles.push(roleId);
            }
        }
        console.log('userRoles %O', $scope.user.roles);

        $scope.invite = function (isValid) {
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'userForm');
                return false;
            }
            else {
                var payload = {
                    payload: $scope.user
                };

                $http.post(constants.API_URL + '/users', payload).then(onInviteSuccess, onInviteError);

            }
        };
        function onInviteSuccess(response) {
            toastr.success('User Invited', 'Invite Success!');
            console.dir(response);
            $state.go($state.previous.state.name || 'home', $state.previous.params);
        }

        function onInviteError(err) {
            toastr.error('There was a problem inviting this user.');
            console.error(err)
        }
    }
]);


'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin', '$http', '$state', 'CurrentUserService', 'constants',
    function ($scope, $filter, Admin, $http, $state, CurrentUserService, constants) {


        $scope.CurrentUserService = CurrentUserService;
        $scope.userview = $state.params;
        //CurrentUserService.user = '';
        $scope.locations = [];


        if (CurrentUserService.locations)
            $scope.locations = CurrentUserService.locations;
        else
            $scope.locations = ["No Locations"]
        $scope.addLocs = function () {
            console.log('helllo, %O', $scope.locations);
        }

        $scope.userEditView = function (user) {
            //debugger;

            $http.get(constants.API_URL + '/users?email=' + user.email).then(function (res, err) {
                if (err) {
                    console.log(err);
                }
                if (res) {
                    console.log(res);
                    CurrentUserService.userBeingEdited = res.data[0];
                    $state.go('admin.users.user-edit', {userId: user._id});
                    console.log('currentUserService userBeingEdited %O', CurrentUserService.userBeingEdited)
                }
            })
        };

        $scope.inviteStoreView = function () {
            $state.go('admin.users.store', {}, {reload: true})
        };


        $scope.buildPager = function () {
            $scope.pagedItems = [];
            $scope.itemsPerPage = 15;
            $scope.currentPage = 1;
            $scope.figureOutItemsToDisplay();
        };

        $scope.figureOutItemsToDisplay = function () {

            $scope.filteredItems = $filter('filter')(CurrentUserService.userList, {
                $: $scope.search
            });
            $scope.newUsers = $scope.filteredItems
        };
        $scope.buildPager();
        $scope.pageChanged = function () {
            $scope.figureOutItemsToDisplay();
        };
        $scope.removeLocationBox = false;
        $scope.addNewLocation = function (locs) {
            var newItemNo = $scope.locations.length + 1;
            $scope.locations.push({'id': 'location' + newItemNo});
            $scope.removeLocationBox = true;
        };
        $scope.removeLocation = function () {
            if ($scope.locations.length > 1) {
                var newItemNo = $scope.locations.length - 1;

                $scope.locations.pop();
            }
            if ($scope.locations.length == 1)
                $scope.removeLocationBox = false;


        };

        //$scope.invite = function (isValid) {
        //  if (!isValid) {
        //    $scope.$broadcast('show-errors-check-validity', 'storeForm');
        //    return false;
        //  }
        //
        //  else {
        //    var contactName = $scope.store.contactName;
        //    var storeName = $scope.store.storeName;
        //    var email = $scope.store.storeEmail;
        //    var role = $scope.stuffs;
        //    var locations = $scope.locations;
        //    var obj = {
        //      payload: {
        //        contactName: contactName,
        //        storeName: storeName,
        //        storeEmail: email,
        //        role:role,
        //        locations:locations
        //      }
        //    };
        //
        //
        //    $http.post(constants.API_URL + '/store', obj).then(function (response, err) {
        //      // If successful we assign the response to the global user model
        //      //$scope.authentication.user = response;
        //      // And redirect to the previous or home page
        //      console.dir(response);
        //      $state.go($state.previous.state.name || 'home', $state.previous.params);
        //      if (err) {
        //        console.log(err);
        //      }
        //    });
        //  }
        //};


    }
]);

'use strict';

angular.module('users.admin').controller('AdminPricingController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Admin', 'Upload', '$sce', 'ImageService', 'constants',
    function ($scope, $state, $http, Authentication, $timeout, Admin, Upload, $sce, ImageService, constants) {
        $scope.authentication = Authentication;
        Admin.query(function (data) {
            $scope.users = data;
            $scope.buildPager();
        });
        var self = this;


        $scope.amountDiscount = 0;
        $scope.itemPrice = [];
        $scope.deviceImage = 'dist/ipadair.jpeg';
        $scope.images = [];
        $scope.currentDiscount = 0;
        $scope.priceTotal = 0;

        var x;
        $scope.addPackage  = function(number){
            $scope.priceTotal = 0

            devices[0].qty = Math.round((.66 * number) * 1)/1;
            devices[1].qty = Math.round((.33 * number) * 1)/1;
            apps[0].qty = number;
            apps[1].qty = number;
            apps[2].qty = number;
            accessories[0].qty = Math.round((.66 * number) * 1)/1;
            accessories[1].qty = Math.round((.33 * number) * 1)/1;
            $scope.pricing.pricelist.totalDevices =number;
            $scope.pricing.pricelist.totalApps =number*3;
            $scope.pricing.pricelist.totalAccessories = number;

            var packageTotal = (devices[0].price * Math.round((.66 * number) * 1)/1) +(devices[1].price * Math.round((.33 * number) * 1)/1)
                +(apps[0].price * number)+(apps[1].price * number)+(apps[2].price * number) +(accessories[0].price * Math.round((.66 * number) * 1)/1)+(accessories[1].price * Math.round((.33 * number) * 1)/1)
            $scope.total(packageTotal);
        }
        $scope.formatNumber = function(i) {
            return Math.round(i * 1)/1;
        }
        $scope.total = function (price) {
            console.log(price)
            $scope.priceTotal += price;
        }
        $scope.addDiscount = function(amount){
            $scope.currentDiscount = Number(amount);

        }
        $scope.subtractTotal = function (price) {
            if($scope.priceTotal - price >= 0)
                $scope.priceTotal -= price ;
            else{
                $scope.priceTotal =0;
            }
        }
        //$scope.addItem = function (item, id) {
        //    var obj = item;
        //    if(id == 'device')
        //        $scope.pricing.pricelist.totalDevices += 1;
        //    if(id == 'apps' )
        //        $scope.pricing.pricelist.totalApps += 1;
        //    if(id == 'accessories')
        //        $scope.pricing.pricelist.totalAccessories += 1;
        //    if ($scope.itemPrice.length == 0) {
        //        obj.qty += 1;
        //        obj.total +=1;
        //        $scope.total(obj.price);
        //        if(obj.name == 'iPad') {
        //            $scope.images.push({name: obj.name, fileName: 'dist/ipadair.jpeg'});
        //        }
        //        if(obj.name == 'iPad Pro'){
        //            $scope.images.push({name:obj.name, fileName:'dist/ipad-pro-250x306.jpg'});
        //            }
        //        if(obj.name == 'VESA Shelf Mount') {
        //            $scope.images.push({name: obj.name, fileName: 'dist/vesa.jpg'});
        //        }
        //        if(obj.name == 'Floor Stand') {
        //            $scope.images.push({name: obj.name, fileName: 'dist/armodillo-floor.png'});
        //        }
        //        console.log('images %O', $scope.images);
        //        //$scope.sources.push({fileName:'dist/ipadair.jpeg'});git pull
        //
        //        return $scope.itemPrice.push(obj);
        //    }
        //    obj.qty += 1;
        //    obj.total +=1;
        //    if(obj.name == 'iPad')
        //        $scope.images.push({name:obj.name, fileName:'dist/ipadair.jpeg'});
        //    if(obj.name == 'iPad Pro')
        //        $scope.images.push({name:obj.name, fileName:'dist/ipad-pro-250x306.jpg'});
        //    if(obj.name == 'VESA Shelf Mount')
        //        $scope.images.push({name:obj.name, fileName:'dist/vesa.jpg'});
        //    if(obj.name == 'Floor Stand')
        //        $scope.images.push({name:obj.name, fileName:'dist/armodillo-floor.png'});
        //    console.log('images %O', $scope.images);
        //    $scope.total(obj.price);
        //    return $scope.itemPrice.push(obj);
        //}
        $scope.addItem = function (item, id) {

            var obj = item;
            if(id == 'device')
                $scope.pricing.pricelist.totalDevices += 1;
            if(id == 'apps' )
                $scope.pricing.pricelist.totalApps += 1;
            if(id == 'accessories')
                $scope.pricing.pricelist.totalAccessories += 1;
            if ($scope.itemPrice.length == 0) {
                //obj.qty += 1;
                obj.total +=1;
                $scope.total(obj.price);
                if (obj.name == 'iPad') {
                    devices[0].qty += 1;
                    $scope.images.push({name: obj.name, fileName: 'dist/ipadair.jpeg'});
                }
                if (obj.name == 'iPad Pro') {
                    devices[1].qty += 1;
                    $scope.images.push({name: obj.name, fileName: 'dist/ipad-pro-250x306.jpg'});
                }
                if (obj.name == 'VESA Shelf Mount') {
                    accessories[0].qty += 1;
                    $scope.images.push({name: obj.name, fileName: 'dist/vesa.jpg'});
                }
                if (obj.name == 'Floor Stand') {
                    accessories[1].qty += 1;
                    $scope.images.push({name: obj.name, fileName: 'dist/armodillo-floor.png'});
                }
                if (obj.name == '4g hotspot') {
                    accessories[2].qty += 1;
                }
                if (obj.name == 'Beer Lookup') {
                    apps[0].qty += 1;
                }
                if (obj.name == 'Wine Lookup') {
                    apps[1].qty += 1;
                }
                if (obj.name == 'Spirits Lookup') {
                    apps[2].qty += 1;
                }
                if (obj.name == 'Pharmacy ') {
                    apps[3].qty += 1;
                }
                if (obj.name == 'Digital Signage ') {
                    apps[4].qty += 1;
                }
                if (obj.name == 'Dashboard ') {
                    apps[5].qty += 1;
                }
                console.log('images %O', $scope.images);
                //$scope.sources.push({fileName:'dist/ipadair.jpeg'});git pull

                //return $scope.itemPrice.push(obj);
            }
            else {
                //obj.qty += 1;
                obj.total += 1;
                if (obj.name == 'iPad') {
                    devices[0].qty += 1;
                    $scope.images.push({name: obj.name, fileName: 'dist/ipadair.jpeg'});
                }
                if (obj.name == 'iPad Pro') {
                    devices[1].qty += 1;
                    $scope.images.push({name: obj.name, fileName: 'dist/ipad-pro-250x306.jpg'});
                }
                if (obj.name == 'VESA Shelf Mount') {
                    accessories[0].qty += 1;
                    $scope.images.push({name: obj.name, fileName: 'dist/vesa.jpg'});
                }
                if (obj.name == 'Floor Stand') {
                    accessories[1].qty += 1;
                    $scope.images.push({name: obj.name, fileName: 'dist/armodillo-floor.png'});
                }
                if (obj.name == '4g hotspot') {
                    accessories[2].qty += 1;
                }
                if (obj.name == 'Beer Lookup') {
                    apps[0].qty += 1;
                }
                if (obj.name == 'Wine Lookup') {
                    apps[1].qty += 1;
                }
                if (obj.name == 'Spirits Lookup') {
                    apps[2].qty += 1;
                }
                if (obj.name == 'Pharmacy ') {
                    apps[3].qty += 1;
                }
                if (obj.name == 'Digital Signage ') {
                    apps[4].qty += 1;
                }
                if (obj.name == 'Dashboard ') {
                    apps[5].qty += 1;
                }
                $scope.total(obj.price);
                //return $scope.itemPrice.push(obj);
            }
        }
        $scope.removeItem = function (item, id) {
            var obj = item;
            if(id == 'device' && $scope.pricing.pricelist.totalDevices != 0)
                $scope.pricing.pricelist.totalDevices -= 1;
            if(id == 'apps' && $scope.pricing.pricelist.totalApps != 0)
                $scope.pricing.pricelist.totalApps -= 1;
            if(id == 'accessories' && $scope.pricing.pricelist.totalAccessories != 0)
                $scope.pricing.pricelist.totalAccessories -= 1;
            for(var y in $scope.images){
                    if($scope.images[y].name == obj.name){
                        console.log('image deleted');
                        $scope.images.splice(y,1);
                    }
            }
            //if($scope.itemPrice) {
            //    for (x in $scope.itemPrice) {
            //        if ($scope.itemPrice[x].name == obj.name) {
            //            console.log('deleted')
            //            console.log('itemPrice1 %O', $scope.itemPrice)
            //            obj.qty -= 1;
            //            obj.total -= 1;
            //            $scope.subtractTotal(obj.price);
            //            return $scope.itemPrice.splice(x, 1);
            //        }
            //
            //        //if ($scope.itemPrice.hasOwnProperty(x) && $scope.itemPrice[x] === obj) {
            //        //    console.log('deleted')
            //        //    console.log('itemPrice1 %O', $scope.itemPrice)
            //            obj.qty -= 1;
            //            obj.total -=1;
            //            $scope.subtractTotal(obj.price);
            //        //    return $scope.itemPrice.splice(x, 1);
            //        //}
            //    }
            //}

            obj.total -=1;
            console.log('obj for removing %O', obj);
            console.log('pricing obj %O', $scope.pricing);
            $scope.subtractTotal(obj.price);
            if (obj.name == 'iPad') {
                devices[0].qty -=1;
            }
            if (obj.name == 'iPad Pro') {
                devices[1].qty -=1;
            }
            if (obj.name == 'VESA Shelf Mount') {
                accessories[0].qty -=1;
            }
            if (obj.name == 'Floor Stand') {
                accessories[1].qty -=1;
            }
            if (obj.name == '4g hotspot') {
                accessories[2].qty -= 1;
            }
            if (obj.name == 'Beer Lookup') {
                apps[0].qty -= 1;
            }
            if (obj.name == 'Wine Lookup') {
                apps[1].qty -= 1;
            }
            if (obj.name == 'Spirits Lookup') {
                apps[2].qty -= 1;
            }
            if (obj.name == 'Pharmacy ') {
                apps[3].qty -= 1;
            }
            if (obj.name == 'Digital Signage ') {
                apps[4].qty -= 1;
            }
            if (obj.name == 'Dashboard ') {
                apps[5].qty -= 1;
            }
        };
        $scope.appcheck;
        $scope.checkClick = function (item) {
            if ($scope.appcheck == false)
                $scope.addItem(item);
            else
                $scope.removeItem(item);
        }
        $scope.pricing = {
            pricelist: {
                devices: [
                    {
                        name: 'iPad',
                        price: 500,
                        qty:0
                    },
                    {
                        name: 'iPad Pro',
                        price: 1000,
                        qty:0
                    }],
                apps: [
                    {
                        'name': 'Beer Lookup',
                        'price': 1000,
                        'max-quantity': 1,
                        qty:0
                    },
                    {
                        'name': 'Wine Lookup',
                        'price': 1000,
                        'max-quantity': 1,
                        qty:0
                    },
                    {
                        'name': 'Spirits Lookup',
                        'price': 1000,
                        'max-quantity': 1,
                        qty:0
                    },
                    {
                        'name': 'Pharmacy',
                        'price': 1000,
                        'max-quantity': 1,
                        qty:0
                    },
                    {
                        'name': 'Digital Signage',
                        'price': 1000,
                        'max-quantity': 1,
                        qty:0
                    },
                    {
                        'name': 'Dashboard',
                        'price': 1000,
                        'max-quantity': 1,
                        qty:0
                    }],
                accessories: [
                    {
                        name: 'VESA Shelf Mount',
                        price: 100,
                        qty:0
                    },
                    {
                        name: 'Floor Stand',
                        price: 300,
                        qty:0
                    },
                    {
                        name: '4G Hotspot',
                        price: 600,
                        qty:0
                    }],
                totalDevices:0,
                totalApps:0,
                totalAccessories:0
            }
        }
        $scope.discounts = [
            {amount :0 , name:'0%'},
            {amount: .05, name:'5%'},
            {amount: .10, name:'10%'},
            {amount: .20, name:'20%'},
            {amount: .30, name:'30%'},
            {amount: .40, name:'40%'}];
        var devices = $scope.pricing.pricelist.devices
        var apps = $scope.pricing.pricelist.apps
        var accessories = $scope.pricing.pricelist.accessories
    }


]);


'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve', '$timeout', 'CurrentUserService', 'constants', '$http', 'toastr', '$q',
    function ($scope, $state, Authentication, userResolve, $timeout, CurrentUserService, constants, $http, toastr, $q) {


        $scope.authentication = Authentication;
        $scope.user = userResolve;

        console.log('userResolve %O', userResolve);

        $timeout(function () {
            $scope.roles = [
                {text: 'admin', id: 1004, selected: $scope.user.roles.indexOf('admin') > -1},
                {text: 'store owner', id: 1006, selected: $scope.user.roles.indexOf('store owner') > -1},
                {text: 'manager', id: 1002, selected: $scope.user.roles.indexOf('manager') > -1},
                {text: 'supplier', id: 1007, selected: $scope.user.roles.indexOf('supplier') > -1},
                {text: 'user', id: 1003, selected: $scope.user.roles.indexOf('user') > -1}
            ];
        }, 500);


        $scope.remove = function () {
            var user = userResolve;
            if (confirm('Are you sure you want to delete this user?')) {
                if (user) {
                    user.$remove();
                    CurrentUserService.update();

                } else {
                    $scope.user.$remove(function () {
                        $state.go('admin.users');
                    });
                }
            }
        };

        $scope.update = function (isValid) {
            console.dir(isValid);
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'userForm');
                return false;
            }
            updateMongo().then(function () {
                updateAPI();

            })
        };


        function updateMongo() {
            var defer = $q.defer();
            $scope.user.roles = [];
            $scope.roles.forEach(function (role) {
                if (role.selected) {
                    $scope.user.roles.push(role.text)
                }
            });
            var user = $scope.user;
            user.$update(function () {
                $state.go('admin.users.user-edit', {
                    userId: user._id
                });
                defer.resolve()
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
            return defer.promise;
        }

        function updateAPI() {
            $scope.user.roles = [];
            $scope.roles.forEach(function (role) {
                if (role.selected) {
                    $scope.user.roles.push(role.id)
                }
            });
            var user = $scope.user;
            var userBeingEdited = CurrentUserService.userBeingEdited;
            console.log('userBeingEditied %O', userBeingEdited)
            var url = constants.API_URL + '/users/' + userBeingEdited.userId;
            var payload = {
                payload: user
            };
            $http.put(url, payload).then(onUpdateSuccess, onUpdateError);

            function onUpdateSuccess(res) {
                toastr.success('User updated', 'Success!')
            }

            function onUpdateError(err) {
                toastr.error('There was an error updating this user');
                console.error(err)
            }
        }
    }
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator', 'constants', 'toastr', 'authToken',
    function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator, constants, toastr, authToken) {
        $scope.authentication = Authentication;
        $scope.popoverMsg = PasswordValidator.getPopoverMsg();

        var userInfo = {};

        //read userinfo from URL
        if ($location.search().r)
            userInfo = {
                accountId: Number($location.search().a),
                regCode: Number($location.search().u),
                roles: $location.search().r.split('~')
            };


        //switches between roleIds and strings for use in
        //mongoDB and OncueApi
        var roleTranslate = {
            1004: 'admin',
            1002: 'manager',
            1007: 'supplier',
            1003: 'user'
        };


        // If user is signed in then redirect back home
        if ($scope.authentication.user) {
            $location.path('/');
        }

        $scope.signup = function () {
            $http.get(constants.API_URL + '/users/validate/' + userInfo.regCode).then(onValidReg, onInvalidReg);
        };


        //Reg code (userId) exists in database, continue with creation
        function onValidReg(response) {
            var storeUpdate = {
                payload: {
                    email: $scope.credentials.email,
                    username: $scope.credentials.username,
                    userId: userInfo.regCode
                }
            };
            var url = constants.API_URL + '/users/' + userInfo.regCode
            $http.put(url, storeUpdate).then(onUpdateSuccess, onUpdateError)

        }

        //Reg code (userId) was invalid. Show error and reset credentials.
        function onInvalidReg(err) {
            toastr.error('User is not a valid user. Please contact support.');
            console.error(err);
            $scope.credentials = {}
        }

        //User updated users table in API successfully (registered in OnCue db) Update Mongo DB and sign in.
        function onUpdateSuccess(res) {
            if (res) {
                $scope.credentials.roles = [];
                userInfo.roles.forEach(function (role) {
                    $scope.credentials.roles.push(roleTranslate[role])
                });
                console.log('$scope credentials', $scope.credentials);
                $http.post('/api/auth/signup', $scope.credentials).then(function (response, err) {
                    console.log('mongoAPI says %O', response);
                    if (err) {
                        toastr.error('There was an error creating your account');
                        console.error(err)
                    }

                    //mock token for testing
                    response.data.token = 'definitelyarealtoken';
                    authToken.setToken(response.data.token);

                    // If successful we assign the response to the global user model
                    $scope.authentication.user = response.data;

                    var roles = [];
                    userInfo.roles.forEach(function (role) {
                        roles.push(Number(role.roleId))
                    });

                    localStorage.setItem('accountId', userInfo.accountId);
                    localStorage.setItem('roles', roles);

                    toastr.success('Success! User Created. Logging you in now...');
                    // And redirect to the previous or home page
                    $state.go($state.previous.state.name || 'home', $state.previous.params);
                })
            }
        }

        function onUpdateError(err) {
            toastr.error(err.message);
            console.error(err)
        }

        $scope.signin = function (isValid) {
            $scope.error = null;

            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'userForm');
                return false;
            }
            $http.post('/api/auth/signin', $scope.credentials).then(onSigninSuccess, onSigninError)
        };

        //We've signed into the mongoDB, now lets authenticate with OnCue's API.
        function onSigninSuccess(response) {
            // If successful we assign the response to the global user model
            $scope.authentication.user = response.data;
            var url = constants.API_URL + "/users/login";
            var payload = {
                payload: $scope.credentials
            };
            console.log('i hope I can sign in with %O',payload);
            $http.post(url, payload).then(function (res) {
                toastr.success('Welcome to the OnCue Dashboard', 'Success');
                console.log('response from OnCue API %O', res);

                //build roles array for user to store in local storage


                //set token in localStorage and memory
                authToken.setToken(res.data.token);

                //set roles
                localStorage.setItem('roles', res.data.roles);

                //store account Id in location storage
                localStorage.setItem('accountId', res.data.accountId);

                // And redirect to the previous or home page
                $state.go($state.previous.state.name || 'manager.dashboard', $state.previous.params);

            });
        }


        //We could not sign into mongo, so clear everything and show error.
        function onSigninError(err) {
            console.error(err);
            toastr.error(err.data.message);
            $scope.error = err.message;
            $scope.credentials = {};
        }

        // OAuth provider request
        $scope.callOauthProvider = function (url) {
            if ($state.previous && $state.previous.href) {
                url += '?redirect_to=' + encodeURIComponent($state.previous.href);
            }

            // Effectively call OAuth authentication route:
            $window.location.href = url;
        };
    }
]);

angular.module('users.manager').controller('AccountManagerController', ["$scope", "locationsService", "$state", "accountsService", "CurrentUserService", "Authentication", "$http", "constants", function ($scope, locationsService, $state, accountsService, CurrentUserService, Authentication, $http, constants) {

    accountsService.init();
    $scope.accountsService = accountsService;
    $scope.determinateValue = 0;
    $scope.accountLogo = '';
    $scope.account = {
        createdBy: Authentication.user.username
    };


    //changes the view, and sets current edit account
    $scope.editAccount = function (account) {
        accountsService.editAccount = account;
        console.log('editAccount %O', accountsService.editAccount);
        $state.go('manager.accounts.edit', {id: account.accountId})
    }


    //TODO: clean this up
    $scope.upload = function (file) {
        var mediaAssetId;
        var fileName = file[0].name;
        var obj = {
            payload: {
                fileName: file[0].name,
                userName: Authentication.user.username
            }
        };

        //TODO: change media route to ads
        $http.post(constants.API_URL + '/media', obj).then(function (response, err) {
            if (err) {
                console.log(err);
            }
            if (response) {
                console.log('oncue API response %O', response)
                mediaAssetId = response.data.assetId
                $scope.creds = {
                    bucket: 'beta.cdn.expertoncue.com',
                    access_key: 'AKIAICAP7UIWM4XZWVBA',
                    secret_key: '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'
                };
                // Configure The S3 Object
                AWS.config.update({
                    accessKeyId: $scope.creds.access_key,
                    secretAccessKey: $scope.creds.secret_key
                });
                AWS.config.region = 'us-east-1';
                var bucket = new AWS.S3({params: {Bucket: $scope.creds.bucket}});
                var params = {
                    Key: mediaAssetId + "-" + file[0].name,
                    ContentType: file[0].type,
                    Body: file[0],
                    ServerSideEncryption: 'AES256',
                    Metadata: {
                        fileKey: JSON.stringify(response.data.assetId)
                    }
                };

                bucket.putObject(params, function (err, data) {
                        $scope.loading = true;
                        if (err) {
                            // There Was An Error With Your S3 Config
                            alert(err.message);
                            return false;
                        }
                        else {
                            console.log('s3 response to upload %O', data);
                            // Success!
                            $scope.accountLogo = constants.ADS_URL + mediaAssetId + '-' + fileName;
                            console.log('logo %O', $scope.accountLogo);
                            $scope.$apply();
                            $scope.determinateValue = 0;

                        }
                    })
                    .on('httpUploadProgress', function (progress) {
                        // Log Progress Information
                        console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
                        $scope.determinateValue = Math.round(progress.loaded / progress.total * 100);
                        $scope.$apply();
                    });
            }
            else {
                // No File Selected
                alert('No File Selected');
            }
        });
    };

}]);

'use strict';

angular.module('users.manager').controller('AdmanagerController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav', 'constants', 'toastr',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav, constants, toastr) {
        $scope.authentication = Authentication;
        var self = this;
        $scope.links = [];
        $scope.sources = [];
        $scope.sortingLog = [];
        $scope.ads = false;
        $scope.activeAds = false;
        $scope.storeDevices = false;
        $scope.toggleLeft = buildDelayedToggler('left');
        $scope.profiles = [];
        function debounce(func, wait, context) {
            var timer;

            return function debounced() {
                var context = $scope,
                    args = Array.prototype.slice.call(arguments);
                $timeout.cancel(timer);
                timer = $timeout(function () {
                    timer = undefined;
                    func.apply(context, args);
                }, wait || 10);
            };
        }

        function buildDelayedToggler(navID) {
            return debounce(function () {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        console.log("toggle " + navID + " is done");
                    });
            }, 200);
        }

        $scope.init = function () {
            $scope.sources = [];
            $http.get(constants.API_URL + '/profiles?userName=' + "'" + $scope.authentication.user.username + "'").then(function (res, err) {
                if (err) {
                    console.log(err);
                }
                if (res) {
                    for (var i in res.data)
                        $scope.profiles.push({profileName: res.data[i].name, profileId: res.data[i].profileId});
                    $scope.currentProfile = res.data[0].profileId;
                    $scope.getAds($scope.currentProfile);
                }
            });
            $http.get(constants.API_URL + '/media/' + $scope.authentication.user.username).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    console.log(response)
                    for (var i in response.data) {
                        var myData = {value: response.data[i].mediaAssetId + "-" + response.data[i].fileName};
                        var re = /(?:\.([^.]+))?$/;
                        var ext = re.exec(myData.value)[1];
                        ext = ext.toLowerCase();
                        if (ext == 'jpg' || ext == 'png' || ext == 'svg') {
                            myData = {
                                name: response.data[i].fileName,
                                value: response.data[i].mediaAssetId + "-" + response.data[i].fileName,
                                ext: 'image',
                                adId: response.data[i].adId
                            };
                            $scope.sources.push(myData);
                        }
                        else if (ext == 'mp4' || ext == 'mov' || ext == 'm4v') {
                            myData = {
                                name: response.data[i].fileName,
                                value: response.data[i].mediaAssetId + "-" + response.data[i].fileName,
                                ext: 'video',
                                adId: response.data[i].adId
                            };
                            $scope.sources.push(myData);
                        }

                    }
                }
            });

        };
        $scope.getDevice = function (loc) {
            $http.get(constants.API_URL + '/devices/location/' + loc).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {

                    $scope.list_devices = response;
                }
            });
        };
        $scope.getAds = function (profileId) {

            $scope.links = [];
            $http.get(constants.API_URL + '/ads?profileId=' + profileId).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    $scope.ads = true;
                    for (var i in response.data) {
                        var myData = {value: response.data[i].mediaAssetId + "-" + response.data[i].fileName};

                        var re = /(?:\.([^.]+))?$/;
                        var ext = re.exec(myData.value)[1];
                        ext = ext.toLowerCase();
                        if (ext == 'jpg' || ext == 'png' || ext == 'svg') {
                            myData = {
                                name: response.data[i].fileName,
                                value: response.data[i].mediaAssetId + "-" + response.data[i].fileName,
                                ext: 'image',
                                adId: response.data[i].adId
                            };
                            $scope.links.push(myData);
                        }
                        else if (ext == 'mp4' || ext == 'mov' || ext == 'm4v') {
                            myData = {
                                name: response.data[i].fileName,
                                value: response.data[i].mediaAssetId + "-" + response.data[i].fileName,
                                ext: 'video',
                                adId: response.data[i].adId
                            };
                            $scope.links.push(myData);
                        }

                    }
                }
            });
        };
        $scope.setCurrentProfile = function (profileId) {
            $scope.currentProfile = profileId;
        };

        $scope.activateAd = function (adId, profileId) {

            var asset = {
                payload: {
                    adId: adId,
                    profileId: profileId
                }
            };
            $http.post(constants.API_URL + '/ads/profile', asset).then(function (response, err) {
                if (err) {
                    console.log(err);
                    toastr.error('Could not push ad to device. Please try again later.')
                }
                if (response) {
                    $scope.getAds(profileId);
                    toastr.success('Ad pushed to devices!')
                }
            });
        };
        $scope.deactivateAd = function (adId, profileId) {
            console.log(adId)
            console.log(profileId)
            $http.delete(constants.API_URL + '/ads/profile?profileId=' + profileId + '&adId=' + adId).then(function (response, err) {
                if (err) {
                    console.log(err);
                    toastr.error('Could not remove ad from devices.')
                }
                if (response) {
                    console.log(response);
                    $scope.getAds(profileId);
                    toastr.success('Ad removed from devices.')
                    //$scope.getAds(deviceId);
                }
            });
        };
        $scope.upload = function (file) {
            var obj = {
                payload: {
                    fileName: file[0].name,
                    userName: $scope.authentication.user.username
                }
            };
            $http.post(constants.API_URL + '/media', obj).then(function (response, err) {
                if (err) {
                    console.log(err);
                    toastr.error('There was a problem uploading your ad.')


                }
                if (response) {
                    $scope.creds = {
                        bucket: 'beta.cdn.expertoncue.com',
                        access_key: 'AKIAICAP7UIWM4XZWVBA',
                        secret_key: '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'
                    }
                    // Configure The S3 Object
                    AWS.config.update({
                        accessKeyId: $scope.creds.access_key,
                        secretAccessKey: $scope.creds.secret_key
                    });
                    AWS.config.region = 'us-east-1';
                    var bucket = new AWS.S3({params: {Bucket: $scope.creds.bucket}});
                    var params = {
                        Key: response.data.assetId + "-" + file[0].name,
                        ContentType: file[0].type,
                        Body: file[0],
                        ServerSideEncryption: 'AES256',
                        Metadata: {
                            fileKey: JSON.stringify(response.data.assetId)
                        }
                    };
                    console.dir(params.Metadata.fileKey)
                    bucket.putObject(params, function (err, data) {
                            $scope.loading = true;
                            if (err) {
                                // There Was An Error With Your S3 Config
                                alert(err.message);
                                toastr.error('There was a problem uploading your ad.')
                                return false;
                            }
                            else {
                                console.dir(data);
                                // Success!
                                self.determinateValue = 0;
                                toastr.success('New Ad Uploaded', 'Success!')
                                $scope.init();

                            }
                        })
                        .on('httpUploadProgress', function (progress) {
                            // Log Progress Information
                            console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
                            self.determinateValue = Math.round(progress.loaded / progress.total * 100);
                            $scope.$apply();
                        });
                }
                else {
                    // No File Selected
                    alert('No File Selected');
                }
            });
        };

        $scope.deleteAd = function (ad) {
            console.log('delete ad %O', ad)
            var url = constants.API_URL + '/ads/' + ad.adId;
            $http.delete(url).then(function () {
                toastr.success('Ad removed', 'Success');
                $scope.init()
            })
        }
    }
]);

angular.module("users.supplier").filter("trustUrl", ['$sce', function ($sce) {
    return function (recordingUrl) {
        return $sce.trustAsResourceUrl(recordingUrl);
    };
}]);

'use strict';

angular.module('users.manager').controller('DashboardController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav', 'constants', 'chartService',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav, constants, chartService) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;


        $scope.chartService = chartService;


        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };

        $scope.colors = [
            {
                fillColor: "#B4B7B9",
                strokeColor: "#B4B7B9",
                pointColor: "#B4B7B9",
                pointStrokeColor: "#B4B7B9",
                pointHighlightFill: "#B4B7B9",
                pointHighlightStroke: "#B4B7B9"

            },
            {
                fillColor: "#3299BB",
                strokeColor: "#3299BB",
                pointColor: "#3299BB",
                pointStrokeColor: "#3299BB",
                pointHighlightFill: "#3299BB",
                pointHighlightStroke: "#3299BB"

            }
        ]

        $scope.chartOptions = {}


        $scope.emails = [];
        $scope.phones = [];
        $scope.loyalty = [];
        $scope.analytics = [];
        var locations = [];
        var location;
        $scope.list_devices = [];
        $scope.stores = [];
        $scope.specificLoc = [];
        $scope.init = function () {
            $scope.sources = [];
            $http.get(constants.API_URL + '/store/location/' + $scope.authentication.user.username).then(function (res, err) {
                if (err) {
                    console.log(err);
                }
                if (res) {

                    locations = res.data;

                    for (var x in locations) {
                        location = locations[x].address;
                        $scope.specificLoc.push({locationName: locations[x].address, locationId: locations[x].locationId})
                        $http.get(constants.API_URL + '/devices/location/' + locations[x].locationId).then(function (response, err) {
                            if (err) {
                                console.log(err);
                            }
                            if (response) {
                                for (var i in response.data) {
                                    $scope.list_devices.push({
                                        deviceName: response.data[i].name,
                                        locationId: response.data[i].location_locationId
                                    });
                                }
                            }
                        });
                    }
                }

            })


            $http.get(constants.API_URL + '/loyalty/' + $scope.authentication.user.username).then(function (res, err) {
                if (err) {
                    console.log(err);
                }
                if (res) {
                    for (var i in res.data) {
                        var contact = JSON.parse(res.data[i].contactInfo);
                        if (contact["email"]) {
                            $scope.emails.push({email: contact['email']});
                        }
                        else {
                            $scope.phones.push({phone: contact['phone']});

                        }

                    }
                }
            });
            var accountId = localStorage.getItem('accountId');
            var url = constants.API_URL + '/analytics/top-products?account=' + accountId;
            $http.get(url).then(function (res, err) {
                if (err) {
                    console.log(err);
                }
                if (res) {
                    console.log('analytics topProducts %O', res);
                    for (var i in res.data) {
                        if (res.data[i].action == 'Product-Request') {
                            $scope.analytics.push(res.data[i])
                        }
                    }
                }
            });

        };
    }

]);

angular.module('users.manager').controller('LocationManagerController', ["$scope", "locationsService", "$state", "accountsService", "CurrentUserService", function ($scope, locationsService, $state, accountsService, CurrentUserService) {
    locationsService.init().then(function () {
        $scope.locationsService = locationsService;
        $scope.location = {};
        $scope.accountsService = accountsService;
        $scope.currentUserService = CurrentUserService;
    });


    //changes the view, and sets current edit location
    $scope.editLocation = function (location) {
        locationsService.editLocation = location;
        console.log('editLocation %O', locationsService.editLocation);
        $state.go('manager.locations.edit', {id: location.locationId})
    }

}]);

'use strict';

angular.module('users').controller('ManagerUploadController', ['$scope','$state','$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService','constants',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService,constants) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;
        //var files3 = '';
        $scope.links = [];
        $scope.list_categories = [];
        function encode(data) {
            var str = data.reduce(function (a, b) {
                return a + String.fromCharCode(b)
            }, '');
            return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
        }
        $scope.init = function () {

        }
        $scope.viewImage = function(image){
            ImageService.image = image;
            $state.go('supplier.assets',image);

        };

        $scope.getFile = function () {
            $http.get(constants.API_URL + '7272/media/' + $scope.authentication.user.username).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    for (var i in response.data) {
                        $scope.links.push(response.data[i].mediaAssetId + "-" + response.data[i].fileName);
                    }
                }
            });
        }

        $scope.upload = function (file) {


            var obj = {
                payload: {
                    fileName: file[0].name,
                    userName: $scope.authentication.user.username
                }
            };
            $http.post(constants.API_URL + '7272/media', obj).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    $scope.creds = {
                        bucket: 'beta.cdn.expertoncue.com',
                        access_key: 'AKIAICAP7UIWM4XZWVBA',
                        secret_key: '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'
                    }
                    // Configure The S3 Object
                    AWS.config.update({
                        accessKeyId: $scope.creds.access_key,
                        secretAccessKey: $scope.creds.secret_key
                    });
                    AWS.config.region = 'us-east-1';
                    var bucket = new AWS.S3({params: {Bucket: $scope.creds.bucket}});
                    console.log(response.data)
                    //if (file) {
                    var params = {
                        Key: response.data.assetId + "-" + file[0].name,
                        ContentType: file[0].type,
                        Body: file[0],
                        ServerSideEncryption: 'AES256',
                        Metadata: {
                            fileKey: JSON.stringify(response.data.assetId)
                        }
                    };
                    console.dir(params.Metadata.fileKey)
                    bucket.putObject(params, function (err, data) {
                            $scope.loading = true;
                            if (err) {
                                // There Was An Error With Your S3 Config
                                alert(err.message);
                                return false;
                            }
                            else {
                                console.dir(data);
                                // Success!


                                alert('Upload Done');

                            }
                        })
                        .on('httpUploadProgress', function (progress) {
                            // Log Progress Information

                            console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
                            self.determinateValue = Math.round(progress.loaded / progress.total *100);
                            $scope.$apply();
                            //$scope.$apply();
                            //console.log($scope.data.loading);
                            //$scope.loading = (progress.loaded / progress.total *100);

                        });
                }
                else {
                    // No File Selected
                    alert('No File Selected');
                }
            });
            //}

        };
    }

]);


'use strict';

angular.module('users.manager').controller('ProfileController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav','constants',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav,constants) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;
        var array = [];
        var assignAd;
        $scope.links = [];
        $scope.sources = [];
        $scope.sortingLog = [];
        //$scope.rightArray = [];
        //$scope.list_device = [];
        $scope.rightArray = [];
        $scope.leftArray = [];
        $scope.ads = false;
        $scope.activeAds = false;
        $scope.storeDevices = false;
        $scope.toggleLeft = buildDelayedToggler('left');

        function debounce(func, wait, context) {
            var timer;

            return function debounced() {
                var context = $scope,
                    args = Array.prototype.slice.call(arguments);
                $timeout.cancel(timer);
                timer = $timeout(function () {
                    timer = undefined;
                    func.apply(context, args);
                }, wait || 10);
            };
        }
        function buildDelayedToggler(navID) {
            return debounce(function () {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        console.log("toggle " + navID + " is done");
                    });
            }, 200);
        }
        $scope.init = function () {
            $scope.sources = [];
            $http.get(constants.API_URL + '/store/location/' + $scope.authentication.user.username).then(function (res, err) {
                if (err) {
                    console.log(err);
                }
                if (res) {

                    $scope.list_categories = res;
                    $scope.storeDevices = true;

                }
            });
            $http.get(constants.API_URL + '/media/' + $scope.authentication.user.username).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    console.log(response)
                    for (var i in response.data) {
                        var myData = {value: response.data[i].mediaAssetId + "-" + response.data[i].fileName};


                        var re = /(?:\.([^.]+))?$/;

                        var ext = re.exec(myData.value)[1];
                        console.log(ext);
                        ext = ext.toLowerCase();

                        if(ext =='jpg' ||ext =='png' ||ext =='svg' ) {
                            //$scope.media = 'image';
                            //self.news3image = "data:image/jpg;base64," + encode(data.Body);
                            myData = {value: response.data[i].mediaAssetId + "-" + response.data[i].fileName, ext:'image', adId:response.data[i].adId};
                            $scope.sources.push(myData);
                            //$scope.$apply();
                        }
                        else if(ext =='mp4' ||ext =='mov' || ext =='m4v') {
                            //console.log('video')
                            myData = {value: response.data[i].mediaAssetId + "-" + response.data[i].fileName, ext:'video', adId:response.data[i].adId};
                            //$scope.media = 'video';
                            $scope.sources.push(myData);
                            //self.news3image = $sce.trustAsResourceUrl('http://s3.amazonaws.com/beta.cdn.expertoncue.com/'+ImageService.image);
                            //$scope.$apply();
                        }
                        //$scope.links.push(myData);

                    }
                }
            });

        };
        $scope.getDevice = function (loc) {
            console.log('HELLO')
            $http.get(constants.API_URL + '/devices/location/' + loc).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    console.log(response)
                    $scope.list_devices = response;
                }
            });
        };
        $scope.getAds = function (deviceId) {

            $scope.currentDevice = deviceId;
            $scope.leftArray = [];
            $scope.rightArray = [];
            $scope.links =[];
            //$http.get(constants.API_URL + '/media/' + $scope.authentication.user.username).then(function (response, err) {
            //    if (err) {
            //        console.log(err);
            //    }
            //    if (response) {
            //    }
            //});
            $http.get(constants.API_URL + '/ads/device/' + deviceId).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    $scope.ads = true;
                    console.log(response);
                    for (var i in response.data) {
                        var myData = {value: response.data[i].mediaAssetId + "-" + response.data[i].fileName};


                        var re = /(?:\.([^.]+))?$/;

                        var ext = re.exec(myData.value)[1];
                        console.log(ext);
                        ext = ext.toLowerCase();
                        console.log(response.data)
                        if(ext =='jpg' ||ext =='png' ||ext =='svg' ) {
                            //$scope.media = 'image';
                            //self.news3image = "data:image/jpg;base64," + encode(data.Body);
                            myData = {value: response.data[i].mediaAssetId + "-" + response.data[i].fileName, ext:'image', adId:response.data[i].adId};
                            $scope.links.push(myData);
                            //$scope.$apply();
                        }
                        else if(ext =='mp4' ||ext =='mov' || ext =='m4v') {
                            //console.log('video')
                            myData = {value: response.data[i].mediaAssetId + "-" + response.data[i].fileName, ext:'video',  adId:response.data[i].adId};
                            //$scope.media = 'video';
                            $scope.links.push(myData);
                            //self.news3image = $sce.trustAsResourceUrl('http://s3.amazonaws.com/beta.cdn.expertoncue.com/'+ImageService.image);
                            //$scope.$apply();
                        }
                        //$scope.links.push(myData);
                        //var stuff = {value: response.data[i].mediaAsset_mediaAssetId + "-" + response.data[i].name, adId:response.data[i].adId, deviceId:response.data[i].deviceId};
                        //
                        ////$scope.links.push(myData.value.length);
                        //$scope.activeAds = true;
                        //$scope.rightArray.push(stuff);
                    }
                }
            });
        };
        $scope.activate = function(){
            console.log($scope.rightArray);
            var assets = $scope.rightArray;


        };
        $scope.sortableOptions = {
            connectWith: '.connectedItemsExample .list'
        };
        $scope.activateAd = function(adId, deviceId){
            console.log(deviceId);
            console.log(adId);
            var asset = {
                payload:{
                    adId:adId,
                    deviceId:deviceId
                }
            };
            $http.post(constants.API_URL + '/ads/', asset).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {

                    $scope.getAds(deviceId);
                }
            });
        };
        $scope.deactivateAd = function(adId, deviceId){

            $http.delete(constants.API_URL + '/ads/'+adId).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    $scope.getAds(deviceId);
                    //$scope.getAds(deviceId);
                }
            });
        };
        $scope.upload = function (file) {


            var obj = {
                payload: {
                    fileName: file[0].name,
                    userName: $scope.authentication.user.username
                }
            };
            $http.post(constants.API_URL + '/media', obj).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    $scope.creds = {
                        bucket: 'beta.cdn.expertoncue.com',
                        access_key: 'AKIAICAP7UIWM4XZWVBA',
                        secret_key: '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'
                    }
                    // Configure The S3 Object
                    AWS.config.update({
                        accessKeyId: $scope.creds.access_key,
                        secretAccessKey: $scope.creds.secret_key
                    });
                    AWS.config.region = 'us-east-1';
                    var bucket = new AWS.S3({params: {Bucket: $scope.creds.bucket}});
                    console.log(response.data)
                    //if (file) {
                    var params = {
                        Key: response.data.assetId + "-" + file[0].name,
                        ContentType: file[0].type,
                        Body: file[0],
                        ServerSideEncryption: 'AES256',
                        Metadata: {
                            fileKey: JSON.stringify(response.data.assetId)
                        }
                    };
                    console.dir(params.Metadata.fileKey)
                    bucket.putObject(params, function (err, data) {
                            $scope.loading = true;
                            if (err) {
                                // There Was An Error With Your S3 Config
                                alert(err.message);
                                return false;
                            }
                            else {
                                console.dir(data);
                                // Success!
                                self.determinateValue = 0;
                                $scope.init();

                            }
                        })
                        .on('httpUploadProgress', function (progress) {
                            // Log Progress Information

                            console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
                            self.determinateValue = Math.round(progress.loaded / progress.total *100);
                            $scope.$apply();
                            //$scope.$apply();
                            //console.log($scope.data.loading);
                            //$scope.loading = (progress.loaded / progress.total *100);

                        });
                }
                else {
                    // No File Selected
                    alert('No File Selected');
                }
            });
            //}

        };
        $scope.viewFile = function (file) {
            ImageService.image = file;

            $scope.creds = {
                bucket: 'beta.cdn.expertoncue.com',
                access_key: 'AKIAICAP7UIWM4XZWVBA',
                secret_key: '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',

            };
            var params = {
                Key: ImageService.image
            };

            // Configure The S3 Object
            AWS.config.update({
                accessKeyId: $scope.creds.access_key,
                secretAccessKey: $scope.creds.secret_key
            });
            AWS.config.region = 'us-east-1';
            var bucket = new AWS.S3({params: {Bucket: $scope.creds.bucket}});
            bucket.getObject(params, function (err, data) {
                $scope.loading = true;
                if (err) {
                    // There Was An Error With Your S3 Config
                    alert(err.message);
                    return false;
                }
                else {
                    var re = /(?:\.([^.]+))?$/;

                    var ext = re.exec(ImageService.image)[1];
                    console.log(ext);
                    ext = ext.toLowerCase();
                    self.imageName = JSON.stringify(ImageService.image);
                    if(ext =='jpg' ||ext =='png' ||ext =='svg' ) {
                        $scope.media = 'image';
                        //self.news3image = "data:image/jpg;base64," + encode(data.Body);
                        $scope.$apply();
                    }
                    else if(ext =='mp4' ||ext =='mov' || ext =='wmv') {
                        $scope.media = 'video';
                        //self.news3image = $sce.trustAsResourceUrl('http://s3.amazonaws.com/beta.cdn.expertoncue.com/'+ImageService.image);
                        $scope.$apply();
                    }

                    // Success!

                }
            })
        }
    }

]);

angular.module("users.supplier").filter("trustUrl", ['$sce', function ($sce) {
    return function (recordingUrl) {
        return $sce.trustAsResourceUrl(recordingUrl);
    };
}]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication', 'PasswordValidator',
  function ($scope, $http, Authentication, PasswordValidator) {
    $scope.user = Authentication.user;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');

        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
  function ($scope, $timeout, $window, Authentication, FileUploader) {
    $scope.user = Authentication.user;
    $scope.imageURL = $scope.user.profileImageURL;

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      // Populate user object
      $scope.user = Authentication.user = response;

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadProfilePicture = function () {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };
  }
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);

'use strict';

angular.module('users.admin').controller('StoreOwnerInviteController', [ '$scope','Authentication', '$filter', 'Admin', '$http', '$state', 'CurrentUserService', 'constants', 'accountsService',
    function ($scope,Authentication, $filter, Admin, $http, $state, CurrentUserService, constants, accountsService) {


        $scope.CurrentUserService = CurrentUserService;
        $scope.userview = $state.params;
        //CurrentUserService.user = '';
        $scope.locations = [];


        if (CurrentUserService.locations)
            $scope.locations = CurrentUserService.locations;
        else
            $scope.locations = ["No Locations"]
        $scope.addLocs = function () {
            console.log('helllo, %O', $scope.locations);
        }

        $scope.userEditView = function (user) {
            //debugger;

            $http.get(constants.API_URL + '/users?email=' + user.email).then(function (res, err) {
                if (err) {
                    console.log(err);
                }
                if (res) {
                    console.log(res);
                    CurrentUserService.userBeingEdited = res.data[0];
                    $state.go('admin.users.user-edit', {userId: user._id});
                    console.log('currentUserService userBeingEdited %O', CurrentUserService.userBeingEdited)
                }
            })
        };

        $scope.inviteStoreView = function () {
            $state.go('admin.users.store', {}, {reload: true})
        };


        $scope.buildPager = function () {
            $scope.pagedItems = [];
            $scope.itemsPerPage = 15;
            $scope.currentPage = 1;
            $scope.figureOutItemsToDisplay();
        };

        $scope.figureOutItemsToDisplay = function () {

            $scope.filteredItems = $filter('filter')(CurrentUserService.userList, {
                $: $scope.search
            });
            $scope.newUsers = $scope.filteredItems
        };
        $scope.buildPager();
        $scope.pageChanged = function () {
            $scope.figureOutItemsToDisplay();
        };
        $scope.removeLocationBox = false;
        $scope.addNewLocation = function (locs) {
            var newItemNo = $scope.locations.length + 1;
            $scope.locations.push({'id': 'location' + newItemNo});
            $scope.removeLocationBox = true;
        };
        $scope.removeLocation = function () {
            if ($scope.locations.length > 1) {
                var newItemNo = $scope.locations.length - 1;

                $scope.locations.pop();
            }
            if ($scope.locations.length == 1)
                $scope.removeLocationBox = false;


        };
        $scope.myPermissions = localStorage.getItem('roles');
        $scope.accountsService = accountsService;
        $scope.authentication = Authentication;
        console.log('authentication %O', $scope.authentication)

        $scope.roles = [
            {text: 'admin', id: 1004},
            {text: 'store owner', id: 1006},
            {text: 'manager', id: 1002},
            {text: 'supplier', id: 1007},
            {text: 'user', id: 1003}
        ];
        $scope.user = {
            accountId: localStorage.getItem('accountId')
        };



        $scope.toggleRole = function (roleId) {
            $scope.user.roles = $scope.user.roles || [];

            //if role exists, remove it
            if ($scope.user.roles.indexOf(roleId) > -1) {
                $scope.user.roles.splice($scope.user.roles.indexOf(roleId), 1);

            }
            else {
                //insert role
                $scope.user.roles.push(roleId);
            }
        }
        console.log('userRoles %O', $scope.user.roles);

        $scope.invite = function (isValid) {
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'userForm');
                return false;
            }
            else {
                var payload = {
                    payload: $scope.user
                };

                $http.post(constants.API_URL + '/users', payload).then(onInviteSuccess, onInviteError);

            }
        };
        function onInviteSuccess(response) {
            toastr.success('User Invited', 'Invite Success!');
            console.dir(response);
            $state.go($state.previous.state.name || 'home', $state.previous.params);
        }

        function onInviteError(err) {
            toastr.error('There was a problem inviting this user.');
            console.error(err)
        }
    }

]);

'use strict';

angular.module('users.supplier').controller('AssetController', ['$scope','$state','$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav','constants',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav,constants) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;

        $scope.links = [];

        $scope.toggleLeft = buildDelayedToggler('left');

        function debounce(func, wait, context) {
            var timer;

            return function debounced() {
                var context = $scope,
                    args = Array.prototype.slice.call(arguments);
                $timeout.cancel(timer);
                timer = $timeout(function () {
                    timer = undefined;
                    func.apply(context, args);
                }, wait || 10);
            };
        }
        function buildDelayedToggler(navID) {
            return debounce(function () {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        console.log("toggle " + navID + " is done");
                    });
            }, 200);
        }
        function encode(data) {
            var str = data.reduce(function (a, b) {
                return a + String.fromCharCode(b)
            }, '');
            return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
        }
       $scope.init = function(){
            $http.get(constants.API_URL + '/media/' + $scope.authentication.user.username).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    for (var i in response.data) {
                        $scope.links.push(response.data[i].mediaAssetId + "-" + response.data[i].fileName);
                    }
                }
            });
        }

        $scope.viewFile = function (file) {
            ImageService.image = file;

            $scope.creds = {
                bucket: 'beta.cdn.expertoncue.com',
                access_key: 'AKIAICAP7UIWM4XZWVBA',
                secret_key: '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',

            };
            var params = {
                Key: ImageService.image
            };

            // Configure The S3 Object
            AWS.config.update({
                accessKeyId: $scope.creds.access_key,
                secretAccessKey: $scope.creds.secret_key
            });
            AWS.config.region = 'us-east-1';
            var bucket = new AWS.S3({params: {Bucket: $scope.creds.bucket}});
            bucket.getObject(params, function (err, data) {
                $scope.loading = true;
                if (err) {
                    // There Was An Error With Your S3 Config
                    alert(err.message);
                    return false;
                }
                else {

                    var re = /(?:\.([^.]+))?$/;

                    var ext = re.exec(ImageService.image)[1];
                    console.log(ext);
                    ext = ext.toLowerCase();
                    self.imageName = JSON.stringify(ImageService.image);
                    if(ext =='jpg' ||ext =='png' ||ext =='svg' ) {
                        $scope.media = 'image';
                        self.news3image = "data:image/jpg;base64," + encode(data.Body);
                        $scope.$apply();
                    }
                    else if(ext =='mp4' ||ext =='mov' || ext =='wmv') {
                        $scope.media = 'video';
                        self.news3image = $sce.trustAsResourceUrl('http://s3.amazonaws.com/beta.cdn.expertoncue.com/'+ImageService.image);
                        $scope.$apply();
                    }

                    // Success!

                }
            })
        }

    }
]);


'use strict';

angular.module('users.supplier').controller('MediaController', ['$scope','$state','$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService','constants',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService,constants) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;
        //var files3 = '';
        $scope.links = [];
        function encode(data) {
            var str = data.reduce(function (a, b) {
                return a + String.fromCharCode(b)
            }, '');
            return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
        }


        $scope.upload = function (file) {
            var obj = {
                payload: {
                    fileName: file[0].name,
                    userName: $scope.authentication.user.username
                }
            };
            $http.post(constants.API_URL + '/media', obj).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    $scope.creds = {
                        bucket: 'beta.cdn.expertoncue.com',
                        access_key: 'AKIAICAP7UIWM4XZWVBA',
                        secret_key: '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'
                    }
                    // Configure The S3 Object
                    AWS.config.update({
                        accessKeyId: $scope.creds.access_key,
                        secretAccessKey: $scope.creds.secret_key
                    });
                    AWS.config.region = 'us-east-1';
                    var bucket = new AWS.S3({params: {Bucket: $scope.creds.bucket}});

                    //if (file) {
                    var params = {
                        Key: response.data.assetId + "-" + file[0].name,
                        ContentType: file[0].type,
                        Body: file[0],
                        ServerSideEncryption: 'AES256',
                        Metadata: {
                            fileKey: JSON.stringify(response.data.assetId)
                        }
                    };
                    console.dir(params.Metadata.fileKey)
                            bucket.putObject(params, function (err, data) {
                                    $scope.loading = true;
                                    if (err) {
                                        // There Was An Error With Your S3 Config
                                        alert(err.message);
                                        return false;
                                    }
                                    else {
                                        console.dir(data);
                                        // Success!


                                        alert('Upload Done');

                                    }
                                })
                                .on('httpUploadProgress', function (progress) {
                                    // Log Progress Information

                                    console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
                                    self.determinateValue = Math.round(progress.loaded / progress.total *100);
                                    $scope.$apply();
                                    //$scope.$apply();
                                    //console.log($scope.data.loading);
                                    //$scope.loading = (progress.loaded / progress.total *100);

                                });
                        }
                        else {
                            // No File Selected
                            alert('No File Selected');
                        }
            });
            //}

        };
    }

]);


'use strict';

angular.module('users')
  .directive('passwordValidator', ['PasswordValidator', function(PasswordValidator) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$validators.requirements = function (password) {
          var status = true;
          if (password) {
            var result = PasswordValidator.getResult(password);
            var requirementsIdx = 0;

            // Requirements Meter - visual indicator for users
            var requirementsMeter = [
              { color: 'danger', progress: '20' },
              { color: 'warning', progress: '40' },
              { color: 'info', progress: '60' },
              { color: 'primary', progress: '80' },
              { color: 'success', progress: '100' }
            ];

            if (result.errors.length < requirementsMeter.length) {
              requirementsIdx = requirementsMeter.length - result.errors.length - 1;
            }

            scope.requirementsColor = requirementsMeter[requirementsIdx].color;
            scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

            if (result.errors.length) {
              scope.popoverMsg = PasswordValidator.getPopoverMsg();
              scope.passwordErrors = result.errors;
              status = false;
            } else {
              scope.popoverMsg = '';
              scope.passwordErrors = [];
              status = true;
            }
          }
          return status;
        };
      }
    };
  }]);

'use strict';

angular.module('users')
  .directive('passwordVerify', [function() {
    return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ngModel) {
        var status = true;
        scope.$watch(function() {
          var combined;
          if (scope.passwordVerify || ngModel) {
            combined = scope.passwordVerify + '_' + ngModel;
          }
          return combined;
        }, function(value) {
          if (value) {
            ngModel.$validators.passwordVerify = function (password) {
              var origin = scope.passwordVerify;
              return (origin !== password) ? false : true;
            };
          }
        });
      }
    };
  }]);

'use strict';

// Users directive used to force lowercase input
angular.module('users').directive('lowercase', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  };
});

angular.module('users').service('accountsService', ["$http", "constants", "toastr", function ($http, constants, toastr) {
    var me = this;

    me.init = function () {
        me.accounts = [];
        me.editAccount = {};
        getAccounts();
    };

    me.init()


    function getAccounts() {
        $http.get(constants.API_URL + '/accounts').then(onGetAccountSuccess, onGetAccountError);
        function onGetAccountSuccess(res) {
            me.accounts = res.data;
            console.log('accounts Service, accounts %O', me.accounts)
        }

        function onGetAccountError(err) {
            console.error(err)
        }
    }

    me.createAccount = function (account) {
        var url = constants.API_URL + '/accounts';
        var payload = {
            payload: account
        };
        $http.post(url, payload).then(onCreateAccountSuccess, onCreateAccountError);
        function onCreateAccountSuccess(res) {
            toastr.success('New Account Created!');
            console.log('accounts Service, createAccount %O', res)
        }

        function onCreateAccountError(err) {
            toastr.error('There was a problem creating this account');
            console.error(err)
        }
    };

    me.generateAuthCode = function (authCode) {
        var url = constants.API_URL + '/accounts/auth'
        var payload = {
            payload: {
                accountId: me.editAccount.accountId,
                oldAuthCode: authCode
            }
        };
        //TODO: wait for API route
        debugger;
        $http.post(url, payload).then(function (res, err) {
            if (err) {
                console.error(err)
            } else {
                me.editAccount.authCode = res.data.authCode;
            }
        })
    };
    return me;
}]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users.supplier').factory('ImageService', [
    function () {
       var me = this;
        me.image = '';

        return me;
    }
]);

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);

angular.module('users').service('chartService', ["$http", "$q", "constants", function ($http, $q, constants) {
    var me = this;

    me.data = [[0], [0]];
    me.labels = [];
    me.series = ['Sku Scans', 'Page Views'];
    me.colors = [
        {
            fillColor: "#FE3A6D",
            strokeColor: "#FE3A6D",
            pointColor: "#FE3A6D",
            pointStrokeColor: "#FE3A6D",
            pointHighlightFill: "#FE3A6D",
            pointHighlightStroke: "#FE3A6D"

        },
        {
            fillColor: "#3299BB",
            strokeColor: "#3299BB",
            pointColor: "#3299BB",
            pointStrokeColor: "#3299BB",
            pointHighlightFill: "#3299BB",
            pointHighlightStroke: "#3299BB"

        }
    ]


    function getChartData() {
        //Get Analytics from API
        var defer = $q.defer();
        var results = {
            sku: [],
            page: []
        }

        $http.get(constants.API_URL + '/analytics?category=sku').then(function (res) {
            results.sku = res.data.reverse();
            //Get Analytics for Page Views, Second Array
            $http.get(constants.API_URL + '/analytics?category=pageview').then(function (pageViewRes) {
                results.page = pageViewRes.data.reverse();
                defer.resolve(results)
            });
        });


        return defer.promise
    }

    function groupAndFormatDate() {
        getChartData().then(function (results) {
            results.sku.forEach(function (analytic) {
                var message = analytic.analyticsId + ' ';
                var date = moment(analytic.createdDate.split('T')[0]).format('MMM DD');
                var i = me.labels.indexOf(date);
                if (i < 0) {
                    //add new label
                    me.labels.push(date)
                    i = me.labels.indexOf(date);
                    message += 'added new label '
                }
                if (me.data[0][i]) {
                    me.data[0][i]++
                    message += 'incremented data point '
                } else {
                    me.data[0][i] = 1
                    message += 'added new data point '
                }
                //console.log(message)
            });

            results.page.forEach(function (analytic) {
                var message = 'page: ' + analytic.analyticsId;
                var date = moment(analytic.createdDate.split('T')[0]).format('MMM DD');
                var i = me.labels.indexOf(date);
                if (i < 0) {
                    me.labels.push(date)
                    i = me.labels.indexOf(date);

                }
                if (me.data[1][i]) {
                    me.data[1][i]++;
                    message += 'incremented data point '
                } else {
                    me.data[1][i] = 1;
                    message += 'added new data point '
                }
                //console.log(message)

            })

            //add a 0 data point for every label point that doesnt have data
            for (var i = 0; i < me.labels.length; i++) {
                if (!me.data[0][i]) {
                    me.data[0][i] = 0
                }
                if (!me.data[1][i]) {
                    me.data[1][i] = 0
                }
            }
        })

    }

    groupAndFormatDate();


    return me;
}])
;

angular.module('core').service('constants', ["envService", function (envService) {
    var me = this;


    me.API_URL = envService.read('API_URL');
    me.ADS_URL = 'http://s3.amazonaws.com/beta.cdn.expertoncue.com/';
    console.log('constants %O', me)

    return me;
}]);

angular.module('users').service('CurrentUserService', ['Admin', '$state',
    function (Admin, $state) {
        var me = this;
        me.user = '';
        me.locations = '';
        me.currentUserRoles=[];
        me.userBeingEdited = {};
        me.myPermissions = localStorage.getItem('roles');
        Admin.query(function (data) {
            me.userList = data;
            console.log('admin returned %O', data)
        });
        me.update = function(){
            Admin.query(function (data) {
                me.userList = data;
                window.location.reload();
                //$state.go('admin.users',{} , {reload:true});
                //$state.go('admin.users.user-edit',{} , {reload:true})
                console.log('admin returned %O', data)
            });
        };

        return me;
    }
]);

angular.module('users').service('locationsService', ["$http", "constants", "toastr", "$q", function ($http, constants, toastr, $q) {
    var me = this;

    me.init = function () {
        var defer = $q.defer();
        me.locations = [];
        me.accountId = localStorage.getItem('accountId');
        me.editLocation = {};
        me.getLocations();

        defer.resolve();
        return defer.promise;
    };


    //MAIN CRUD OPERATIONS, Create, Get, Update, Delete

    me.createLocation = function (location) {
        var url = constants.API_URL + '/locations';
        var payload = {
            payload: location
        };
        debugger;
        $http.post(url, payload).then(onCreateLocationSuccess, onCreateLocationFail)
    };


    me.getLocations = function () {
        me.locations = [];

        var url = constants.API_URL + '/locations?account=' + me.accountId;
        return $http.get(url).then(function (res) {
            console.log('locationsService getLocations %O', res);
            me.locations = res.data
        })
    };


    me.updateLocation = function () {
        var url = constants.API_URL + '/locations/' + me.editLocation.locationId;
        var payload = {
            payload: me.editLocation
        };
        $http.put(url, payload).then(onUpdateLocationSuccess, onUpdateLocationFail)

    };


    me.deleteLocation = function (location) {
        var url = constants.API_URL + '/locations/' + location.locationId;
        if (location.name.includes('default_')) {
            toastr.error('Cannot delete the default location!', "I'm afraid I can't do that.");
            return
        } else {
            $http.delete(url).then(onDeleteSuccess, onDeleteFail)
        }
    };


    //API RESPONSE/ERROR HANDLING

    function onCreateLocationSuccess(res) {
        if (res.statusCode == 200) {
            toastr.success('New Location Created', 'Success!')
        }
    }

    function onCreateLocationFail(err) {
        console.error(err);
        toastr.error('Could not create new location.')
    }

    function onUpdateLocationSuccess(res) {
        if (res.statusCode == 200) {
            toastr.success('Location Updated', 'Success!')
        }
    }

    function onUpdateLocationFail(err) {
        console.error(err);
        toastr.error('Could not update location.')
    }

    function onDeleteSuccess(res) {
        if (res.statusCode == 200) {
            toastr.success('Location deleted', 'Success!')
        }
    }

    function onDeleteFail(err) {
        console.error(err);
        toastr.error('Could not delete location.')
    }


    return me;
}]);

'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;
    owaspPasswordStrengthTest.config({
      allowPassphrases       : true,
      maxLength              : 128,
      minLength              : 5,
      minPhraseLength        : 20,
      minOptionalTestsToPass : 1,
    });
    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Please enter a passphrase or password greater than 6 characters.';
        return popoverMsg;
      }
    };
  }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  //function ($http) {
  //  var me = this;
  //
  //  me.get = function(){
  //    return $http.get('/api/users')
  //  };
  //
  //  me.put = function(){
  //    return $http.put('/api/users/:userId')
  //  }
  //
  //  return me;
  //}
    function ($resource) {
      return $resource('api/users/:userId', {
        userId: '@_id'
      }, {
        update: {
          method: 'PUT'
        }
      });
    }
]);
//


