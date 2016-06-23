'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
    var applicationModuleVendorDependencies = [ 'ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.utils', 'angularFileUpload' ];

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
;
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config([ '$locationProvider', '$httpProvider', 'envServiceProvider',
    function ($locationProvider, $httpProvider, envServiceProvider) {
        $locationProvider.html5Mode({ enabled: true, requireBase: false }).hashPrefix('!');

        $httpProvider.interceptors.push('authInterceptor');       //  MEANJS/Mongo interceptor
        $httpProvider.interceptors.push('oncueAuthInterceptor');  //  Oncue Auth Interceptor (which adds token) to outgoing HTTP requests
        $httpProvider.interceptors.push('errorInterceptor');     //   Error Interceptor for tracking errors.

        //SET ENVIRONMENT

        if (JSON.parse(localStorage.getItem('userObject'))) {
            var email = JSON.parse(localStorage.getItem('userObject')).email;
            var displayName = JSON.parse(localStorage.getItem('userObject')).displayName
        }
        if (window.rg4js) {
            rg4js('setUser', {
                identifier: localStorage.getItem('userId'),
                isAnonymous: false,
                email: email,
                fullName: displayName
            });
        }


        // set the domains and variables for each environment
        envServiceProvider.config({
            domains: {
                docker: [ 'docker' ],
                local: [ 'localhost' ],
                development: [ 'dashdev.expertoncue.com', 'dashdev.sllr.io' ],
                staging: [ 'dashqa.expertoncue.com', 'dashqa.sllr.io', 'dashboard.sllr.io' ],
                production: [ 'dashboard.expertoncue.com', 'www.sellrdashboard.com', 'sellrdashboard.com' ],
                heroku: [ 'sellrdashboard.herokuapp.com' ]
            },
            vars: {
                local: {
                    API_URL: 'http://localhost:7272',
                    BWS_API: 'http://localhost:7171',
                    env:'local'
                },
                docker: {
                    API_URL: 'docker:7272',
                    BWS_API: 'docker:7171',
                    env: 'dev'
                },
                development: {
                    API_URL: 'https://apidev.sllr.io',
                    BWS_API: 'https://bwsdev.sllr.io',
                    env:'dev'
                },
                staging: {
                    API_URL: 'https://apiqa.sllr.io',
                    BWS_API: 'https://bwsqa.sllr.io',
                    env:'staging'
                },
                production: {
                    API_URL: 'https://api.expertoncue.com',
                    BWS_API: 'https://bws.expertoncue.com',
                    env:'production'
                },
                heroku: {
                    API_URL: 'https://oncue-api.herokuapp.com',
                    BWS_API: 'https://sellr-bws.herokuapp.com',
                    env: 'dev'
                }
            }
        });

        // run the environment check, so the comprobation is made
        // before controllers and services are built
        envServiceProvider.check();
    }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(function ($rootScope, $state, Authentication) {

    $rootScope.$stateClass = cssClassOf($state.current.name);

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
        console.log('changed state from %O to %O', fromState, toState)
        storePreviousState(fromState, fromParams);
        $rootScope.$stateClass = cssClassOf(toState.name);
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

    function cssClassOf(name) {
        if (typeof name != 'string') return name;
        return name.replace(/[^a-z0-9\-]+/gi, '-');
    }
});

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
    angular.bootstrap(document, [ ApplicationConfiguration.applicationModuleName ]);
});
;
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core', [ 'ngAnimate', 'ngAria', 'ngMaterial', 'ngFileUpload', 'ui.sortable', 'ngCsv', 'ngSanitize', 'environment', 'toastr', 'chart.js', 'angular-medium-editor' ]);
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);
ApplicationConfiguration.registerModule('core.supplier', ['core']);
ApplicationConfiguration.registerModule('core.supplier.routes', ['ui.router']);
ApplicationConfiguration.registerModule('core.editor', ['core']);
ApplicationConfiguration.registerModule('core.editor.routes', ['ui.router']);
ApplicationConfiguration.registerModule('core.curator', ['core']);
ApplicationConfiguration.registerModule('core.curator.routes', ['ui.router']);
ApplicationConfiguration.registerModule('core.manager', ['core']);
ApplicationConfiguration.registerModule('core.manager.routes', ['ui.router']);
ApplicationConfiguration.registerModule('core.storeOwner', ['core']);
ApplicationConfiguration.registerModule('core.storeOwner.routes', ['ui.router']);
;
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);
ApplicationConfiguration.registerModule('users.supplier', ['core.supplier']);
ApplicationConfiguration.registerModule('users.supplier.routes', ['core.supplier.routes']);
ApplicationConfiguration.registerModule('users.curator', ['core.curator']);
ApplicationConfiguration.registerModule('users.curator.routes', ['core.curator.routes']);
ApplicationConfiguration.registerModule('users.editor', ['core.editor']);
ApplicationConfiguration.registerModule('users.editor.routes', ['core.editor.routes']);
ApplicationConfiguration.registerModule('users.manager', ['core.manager']);
ApplicationConfiguration.registerModule('users.manager.routes', ['core.manager.routes']);
ApplicationConfiguration.registerModule('users.storeOwner', ['core.storeOwner']);
ApplicationConfiguration.registerModule('users.storeOwner.routes', ['core.storeOwner.routes']);
;
'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
      Menus.addMenuItem('topbar', {
          title: 'Admin',
          state: 'admin',
          type: 'dropdown',
          roles: [ 1004 ],
          position: 3
      });
      Menus.addMenuItem('topbar', {
          title: 'Dashboard',
          state: 'dashboard',
          type: 'button',
          roles: [ 1004, 1003, 1007, 1009 ],
          position: 0
      });

  }
]);
;
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
                    roles: [1004]
                }
            });
    }
]);
;
'use strict';

angular.module('core.editor').run([ 'Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', {
            title: 'Product Editor',
            state: 'editor',
            type: 'dropdown',
            roles: [ 1010, 1011, 1004 ],
            position: 4
        });
        Menus.addMenuItem('editor', {
            title: 'Beer Editor',
            state: 'editor.products({type:"beer",status:"new"})',
            type: 'button',
            roles: [ 1010, 1011, 1004 ],
            position: 0
        });
        Menus.addMenuItem('editor', {
            title: 'Spirits Editor',
            state: 'editor.products({type:"spirits",status:"new"})',
            type: 'button',
            roles: [ 1010, 1011, 1004 ],
            position: 2
        });
        Menus.addMenuItem('editor', {
            title: 'Wine Editor',
            state: 'editor.products({type:"wine",status:"new"})',
            type: 'button',
            roles: [ 1010, 1011, 1004 ],
            position: 1
        });
    }
]);
;
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
                // template: '<ui-view/>',
                data: {
                    roles: [ 1010, 1011, 1004 ]
                }
            });
    }
]);
;
'use strict';

angular.module('core.manager').run(['Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', {
            title: 'Manager',
            state: 'manager',
            type: 'dropdown',
            roles: [1002],
            position:0
        });

    }
]);
;
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
                    roles: [1002]
                }
            });
    }
]);
;
'use strict';

angular.module('core.storeOwner').run(['Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', {
            title: 'Store Owner',
            state: 'storeOwner',
            type: 'dropdown',
            roles: [1009],
            position:1
        });

    }
]);
;
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
                    roles: [1009]
                }
            });
    }
]);
;
'use strict';

angular.module('core.supplier').run(['Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', {
            title: 'Supplier',
            state: 'supplier',
            type: 'dropdown',
            roles: [1007],
            position:2
        });

    }
]);
;
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
                    roles: [1007]
                }
            });
    }
]);
;
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
            .state('stats', {
                url: '/stats/{account}',
                templateUrl: 'modules/core/client/views/stats.client.view.html',
                controller: 'statsController'
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
;

'use strict';

angular.module('core').controller('HeaderController', [ '$scope', 'Authentication', 'Menus', '$http', '$window', '$state', '$stateParams',
    function ($scope, Authentication, Menus, $http, $window, $state, $stateParams) {
        console.log('HELLO FROM THE HEADER')
        $scope.authentication = Authentication;
        $scope.ui = {};
        $scope.$state = $state;

        var originatorEv;
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');
        $scope.editorMenu = Menus.getMenu('editor');
        console.log('editor Menu %O', $scope.editorMenu)
        $scope.toggleCollapsibleMenu = function () {
            $scope.isCollapsed = !$scope.isCollapsed;
        };
        $scope.openMenu = function($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };
        $scope.signOut = function () {
            window.localStorage.clear();
            localStorage.clear();
            $window.localStorage.clear();
            $window.location.href = '/';
        };

    }
]);
;
'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$mdDialog', '$state','$http','toastr', 'constants',
    function ($scope, Authentication, $mdDialog, $state, $http, toastr, constants) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
        $scope.stuff = {};
        var check = false;

        function redirect() {
            if (hasRole(1002) || hasRole(1004) || hasRole(1007) || hasRole(1009)) {
                $state.go('dashboard')
            } else if (hasRole(1010) || hasRole(1011)) {
                $state.go('editor.products')
            } else if (hasRole(1012)) {
                $state.go('supplier.media')
            }
        }

        function hasRole(role) {
            return (_.contains(Authentication.user.roles, role))
        }

        if(Authentication.user){
            redirect()
        }


        $scope.askForPasswordReset = function (isValid) {
            console.log('ask for password called %O',$scope.stuff )
            $scope.success = $scope.error = null;

            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

                return false;
            }
            $scope.stuff.username = $scope.stuff.passuser;
            var payload={payload:{
                username:$scope.stuff.username
            }
            }
            $http.post(constants.API_URL+'/users/auth/forgot', payload).then(function (response, err) {
                if(err)
                    toastr.error('Can not reset password. Please contact Support')
                // Show user success message and clear form
                $scope.credentials = null;
                var mailOptions = {payload:{
                    source:'password',
                    email: response.data.email,
                    title: 'Password Reset Success',
                    body: "<body> <p>Dear "+$scope.stuff.username+",</p> <br /> <p>You have requested to have your password reset for your account at the Sellr Dashboard </p> <p>Please visit this url to reset your password:</p> <p>"+"https://sellrdashboard.com/authentication/reset?token="+response.data.token+"&username="+response.data.username+"</p> <strong>If you didn't make this request, you can ignore this email.</strong> <br /> <br /> <p>The Sellr Support Team</p> </body>"
                }};
                if(response){
                    $http.post(constants.API_URL+'/emails', mailOptions).then(function(res, err){
                        if(err)
                            toastr.error('Can not reset password. Please contact Support');
                        $scope.reset =false;
                        toastr.success("Reset Password Email Sent")
                    })
                }

            })
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
;
angular.module('core').controller('statsController', function ($scope, $http, $stateParams, constants, chartService, $timeout) {
    $scope.chartService = chartService;
    $scope.locations = [];
    var accountId = $stateParams.account;       //set by the URL
    var refreshInterval = 60;                   //how often data refreshes, in seconds;

    function refreshData() {
        $scope.locations = [];
        getDevicesLocations();
        chartService.groupAndFormatDate(accountId);

        //after 30 seconds, recursively refresh data
        $timeout(function () {
            refreshData()
        }, refreshInterval * 1000)
    }

    localStorage.clear()

    function getDevicesLocations() {
        $http.get(constants.API_URL + '/locations?account=' + accountId).then(function (res, err) {
            if (err) {
                console.log(err);
            }
            if (res.data.length > 0) {
                //this account has at least one location
                res.data.forEach(function (thisLocation) {
                    thisLocation.devices = [];
                    $http.get(constants.API_URL + '/devices/location/' + thisLocation.locationId).then(function (response, err) {
                        if (err) {
                            console.log(err);
                        }
                        if (response.data.length > 0) {
                            //this location has devices, add to that location
                            response.data.forEach(function (device) {
                                console.log(device);
                                console.log(device.niceDate);

                                //check to see if device is unhealthy
                                var rightNow = moment();
                                var time = moment(device.lastCheck).subtract(4, 'hours');
                                device.moment = moment(time).fromNow();

                                //determines what classifies as 'unhealthy'
                                var timeDiff = time.diff(rightNow, 'minutes');
                                device.unhealthy = timeDiff <= -60;

                            });
                            thisLocation.devices = response.data || [];
                            $scope.locations.push(thisLocation)
                        }
                    });
                })
            }
        })
    }


    //call the function on load to start the loop.
    refreshData()


});
;
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
;
angular.module('core').factory('authToken', function ($window) {

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
});
;
'use strict';

angular.module('core').factory('authInterceptor', ['$q', '$injector',
  function ($q, $injector) {
    return {
      responseError: function(rejection) {
          if (rejection.config) {
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
          }

          // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }
]);
;
angular.module('core')
    .factory('oncueAuthInterceptor', function (authToken) {

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
    });

;
angular.module('core')
    .factory('errorInterceptor', function ($q, Authentication) {
        return {
            'requestError': function (rejection) {
                if (rejection.data) {
                    var title = rejection.data.message || JSON.stringify(rejection.data);
                }
                Raygun.send(new Error(title), { error: rejection, user: Authentication.user });
                return $q.reject(rejection);

            },
            'responseError': function (rejection) {
                if (rejection.data) {
                    var title = rejection.data.message || JSON.stringify(rejection.data);
                }
                Raygun.send(new Error(title), { error: rejection, user: Authentication.user });
                return $q.reject(rejection);
            }
        }
    });
;
'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function () {
    // Define a set of default roles
    this.defaultRoles = [ 'user', 'admin' ];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function (user) {
      if (!!~this.roles.indexOf('*')) {
        return true;
      } else {
        if (!user) {
          return false;
        }
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[ roleIndex ] === user.roles[ userRoleIndex ]) {
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
        if (this.menus[ menuId ]) {
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
      return this.menus[ menuId ];
    };

    // Add new menu object by menu id
    this.addMenu = function (menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[ menuId ] = {
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[ menuId ];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[ menuId ];
    };

    // Add menu item object
    this.addMenuItem = function (menuId, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[ menuId ].items.push({
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
          this.addSubMenuItem(menuId, options.state, options.items[ i ]);
        }
      }

      // Return the menu object
      return this.menus[ menuId ];
    };

    // Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[ menuId ].items) {
        if (this.menus[ menuId ].items[ itemIndex ].state === parentItemState) {
          // Push new submenu item
          this.menus[ menuId ].items[ itemIndex ].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[ menuId ].items[ itemIndex ].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[ menuId ];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[ menuId ].items) {
        if (this.menus[ menuId ].items[ itemIndex ].state === menuItemState) {
          this.menus[ menuId ].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[ menuId ];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[ menuId ].items) {
        for (var subitemIndex in this.menus[ menuId ].items[ itemIndex ].items) {
          if (this.menus[ menuId ].items[ itemIndex ].items[ subitemIndex ].state === submenuItemState) {
            this.menus[ menuId ].items[ itemIndex ].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[ menuId ];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      roles: [ 1004 ]
    });
    this.addMenu('editor', {
      roles: [ 1010 ]
    });
  }
]);
;
angular.module('core').config(function ($provide) {
    $provide.decorator("$exceptionHandler", [ '$delegate', 'Authentication', function ($delegate, Authentication) {
        return function (exception, cause) {
            Raygun.send(exception, { cause: cause, user: Authentication.user });
            $delegate(exception, cause);
        }
    } ])
});

;
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
;
'use strict';

// Configuring the Articles module
angular.module('users.editor').run([ 'Menus', 'productEditorService',
    function (Menus, productEditorService) {
        Menus.addSubMenuItem('topbar', 'editor', {
            title: 'Wine',
            state: 'editor.products({type:"wine",status:"new"})',
            position: 9
        });
        Menus.addSubMenuItem('topbar', 'editor', {
            title: 'Beer',
            state: 'editor.products({type:"beer",status:"new"})',
            position: 9
        });
        Menus.addSubMenuItem('topbar', 'editor', {
            title: 'Spirits',
            state: 'editor.products({type:"spirits",status:"new"})',
            position: 9
        });
    }
]);
;
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
;
'use strict';

// Configuring the Articles module
angular.module('users.manager').run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'manager', {
            title: 'Ad Manager',
            state: 'manager.ads'
        });
        Menus.addSubMenuItem('topbar', 'manager', {
            title: 'Location Manager',
            state: 'manager.locations'
        });
        
    }
]);
;
'use strict';

// Setting up route
angular.module('users.manager.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('dashboard', {
                url: '/dashboard/:accountId',
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
;
'use strict';

// Configuring the Articles module
angular.module('users.storeOwner').run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'storeOwner', {
            title: 'Invite User',
            state: 'storeOwner.inviteUser',
            position:8
        });

    }
]);
;
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
;
'use strict';

// Configuring the Articles module
angular.module('users.supplier').run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'supplier', {
            title: 'Suppliers',
            state: 'supplier.media',
            position:2
        });
    }
]);
;
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
;
'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'admin', {
            title: 'Account Manager',
            state: 'admin.accounts',
            position: 3
        });
        Menus.addSubMenuItem('topbar', 'admin', {
            title: 'User Management',
            state: 'admin.users',
            position: 5
        });
        Menus.addSubMenuItem('topbar', 'admin', {
            title: 'Pricing Calculator',
            state: 'admin.pricing',
            position: 6
        });
        Menus.addSubMenuItem('topbar', 'admin', {
            title: 'Device Management',
            state: 'admin.device',
            position: 7
        });
    }
]);
;
'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('admin.accounts', {
                url: '/accounts',
                templateUrl: 'modules/users/client/views/admin/accountManager.client.view.html',
                controller: 'AccountManagerController'
            })
            .state('admin.accounts.edit', {
                url: '/edit/:id',
                templateUrl: 'modules/users/client/views/admin/accountManager.edit.client.view.html'
            })
            .state('admin.accounts.create', {
                url: '/new',
                templateUrl: 'modules/users/client/views/admin/accountManager.create.client.view.html'
            })
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
                templateUrl: 'modules/users/client/views/admin/invite-user.client.view.html',
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
            .state('admin.device', {
                url: '/admin/device',
                templateUrl: 'modules/users/client/views/admin/device-manager.client.view.html',
                controller: 'DeviceManagerController'

            })
    }
]);
;
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
;
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
        .state('authentication.reset', {
          url: '/reset',
          templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
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
      .state('mypassword.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
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
      });

  }
]);
;
angular.module('users.admin').controller('AccountManagerController', function ($scope, locationsService, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr) {
    accountsService.init();
    $scope.accountsService = accountsService;
    $scope.determinateValue = 0;
    $scope.accountLogo = '';
    $scope.account = {
        createdBy: ''
    };
    if (Authentication.user) {
        $scope.account.createdBy = Authentication.user.username
    }
    console.log($scope.account);

    //changes the view, and sets current edit account
    $scope.editAccount = function (account) {
        console.log('editing account %O', account)
        $scope.currentAccountLogo = '';
        accountsService.editAccount = account;
        //accountsService.editAccount.style = JSON.parse(account.preferences).style
        console.log('editAccount is now %O', accountsService.editAccount)
        $state.go('admin.accounts.edit', {id: account.accountId})
    }


    $scope.upload = function (files, accountId) {
        var mediaConfig = {
            mediaRoute: 'media',
            folder:'logo',
            type:'LOGO',
            accountId: accountId
        }
        uploadService.upload(files[0], mediaConfig).then(function(response, err ){
            if(response) {
                accountsService.editAccount.logo = constants.ADS_URL + 'logo/'+response[0].mediaAssetId + '-' + response[0].fileName;
                $scope.currentAccountLogo = accountsService.editAccount.logo;
                toastr.success('Logo Updated', 'Success!');
            }
        })
    };

});
;
'use strict';

angular.module('users.admin').controller('DeviceManagerController', ['$scope', '$state', '$http', 'Authentication', 'constants', 'toastr', 'accountsService', '$stateParams',
    function ($scope, $state, $http, Authentication, constants, toastr, accountsService, $stateParams) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;
        $scope.myPermissions = localStorage.getItem('roles');
        if ($stateParams.accountId)
            $scope.selectAccountId = $stateParams.accountId;
        else
            $scope.selectAccountId = localStorage.getItem('accountId');

        $scope.accountsService = accountsService;
        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };
        $scope.chartOptions = {}
        $scope.init = function () {
            $state.go('.', {accountId: $scope.selectAccountId}, {notify: false})
            $scope.emails = [];
            $scope.phones = [];
            $scope.loyalty = [];
            $scope.analytics = [];
            $scope.locations = [];
            $scope.stores = [];
            $scope.specificLoc = [];

            console.log('state params %O', $stateParams)
            //$scope.selectAccountId = $stateParams.accountId;
            $scope.sources = [];
            $http.get(constants.API_URL + '/locations?account=' + $scope.selectAccountId).then(function (res, err) {
                if (err) {
                    console.log(err);
                    toastr.error("We're experiencing some technical difficulties with our database, please check back soon")


                }
                if (res.data.length > 0) {
                    //this account has at least one location
                    res.data.forEach(function (thisLocation) {
                        thisLocation.devices = [];
                        $http.get(constants.API_URL + '/devices/location/' + thisLocation.locationId).then(function (response, err) {
                            if (err) {
                                console.log(err);
                            }
                            if (response.data.length > 0) {
                                //this location has devices, add to that location
                                response.data.forEach(function (device) {
                                    var rightNow = moment();
                                    // var time = moment(device.lastCheck).subtract(4, 'hours');
                                    var time = moment(device.lastCheck);
                                    device.moment = moment(time).fromNow();
                                    var timeDiff = time.diff(rightNow, 'hours');
                                    device.unhealthy = timeDiff <= -3;

                                });
                                thisLocation.devices = response.data || [];
                                $scope.locations.push(thisLocation)
                            }
                        });
                    })
                }
            })
            $http.get(constants.API_URL + '/loyalty?account=' + $scope.selectAccountId).then(function (res, err) {
                if (err) {
                    console.log(err);
                    toastr.error("We're experiencing some technical difficulties with our database, please check back soon")
                }
                if (res) {
                    for (var i in res.data) {
                        var contact = JSON.parse(res.data[i].contactInfo);
                        if (contact["email"]) {
                            $scope.emails.push({
                                email: contact['email']
                            });
                        } else {
                            $scope.phones.push({
                                phone: contact['phone']
                            });

                        }

                    }
                }
            });

            var url = constants.API_URL + '/analytics/top-products?account=' + $scope.selectAccountId;
            $http.get(url).then(function (res, err) {
                if (err) {
                    console.log(err);
                    toastr.error("We're experiencing some technical difficulties with our database, please check back soon")
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

;
'use strict';

angular.module('users.admin').controller('inviteUserController', ['$scope', '$state', '$http', 'Authentication', 'constants', 'toastr', 'accountsService',
    function ($scope, $state, $http, Authentication, constants, toastr, accountsService) {

        $scope.myPermissions = localStorage.getItem('roles');
        $scope.accountsService = accountsService;
        $scope.authentication = Authentication;
        console.log('authentication %O', $scope.authentication)
        $scope.allRoles = [
            {text: 'admin', id: 1004},
            {text: 'owner', id: 1009},
            {text: 'manager', id: 1002},
            {text: 'supplier', id: 1007},
            { text: 'user', id: 1003 },
            { text: 'editor', id: 1010 },
            { text: 'curator', id: 1011 }
        ];
        $scope.roles = [
            {text: 'admin', id: 1004},
            {text: 'owner', id: 1009},
            {text: 'manager', id: 1002},
            {text: 'supplier', id: 1007},
            { text: 'editor', id: 1010 },
            { text: 'curator', id: 1011 }
        ];
        $scope.user = {
            accountId: localStorage.getItem('accountId')
        };

        $scope.invite = function (isValid) {

            switch ($scope.selected) {
                case 1004:
                    $scope.user.roles = [1004, 1009, 1002, 1007, 1003, 1010, 1011];
                    break;
                case 1009:
                    $scope.user.roles = [1009, 1002, 1003];
                    break;
                case 1002:
                    $scope.user.roles = [1002, 1007, 1003];
                    break;
                case 1007:
                    $scope.user.roles = [1007 , 1003];
                    break;
                case 1010:
                    $scope.user.roles = [1010 , 1003];
                    break;
                case 1011:
                    $scope.user.roles = [1011 , 1010, 1003];
                    break;
                default:
                    $scope.user.roles = [1003];
            }


            console.log('user roes', $scope.user.roles);
            if (!isValid) {
                console.log('failed')
                $scope.$broadcast('show-errors-check-validity', 'userForm');
                return false;
            }
            else {
                var payload = {
                    payload: $scope.user
                };
                console.log(payload.payload)
                $http.post(constants.API_URL + '/users', payload).then(onInviteSuccess, onInviteError);
                //onInviteSuccess('true')
            }
        };
        function onInviteSuccess(response) {
            console.log('success!')
            toastr.success('User Invited', 'Invite Success!');
            console.dir(response);
            $scope.success = true;
            $state.go($state.previous.state.name || 'home', $state.previous.params);
        }

        function onInviteError(err) {
            console.log('error')
            toastr.error('There was a problem inviting this user.');
            console.error(err)
        }
    }
]);

;
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
                    $state.go('admin.users.user-edit', {userId: user.userId});
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
;
'use strict';

angular.module('users.admin').controller('AdminPricingController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Admin', 'Upload', '$sce', 'ImageService', 'constants',
    function ($scope, $state, $http, Authentication, $timeout, Admin, Upload, $sce, ImageService, constants) {
        $scope.authentication = Authentication;
        Admin.query(function (data) {
            $scope.users = data;
        });
        var self = this;
        $scope.amountDiscount = 0;
        $scope.itemPrice = [];
        $scope.deviceImage = 'dist/ipadair.jpeg';
        $scope.images = [];
        $scope.currentDiscount = 0;
        $scope.priceTotal = 0;
        $scope.addPackage  = function(number){
            $scope.priceTotal = 0

            devices[0].qty = Math.round((.66 * number) * 1)/1;
            devices[1].qty = Math.round((.33 * number) * 1)/1;
            apps[0].qty = number;
            accessories[0].qty = Math.round((.66 * number) * 1)/1;
            accessories[1].qty = number;
            accessories[2].qty = Math.round((.33 * number) * 1)/1;
            $scope.cart.pricelist.totalDevices =number;
            $scope.cart.pricelist.totalApps =number;
            $scope.cart.pricelist.totalAccessories = number*2;
            var packageTotal = (devices[0].price * Math.round((.66 * number) * 1)/1) +(devices[1].price * Math.round((.33 * number) * 1)/1)
                +(apps[0].price * number) +(accessories[0].price * Math.round((.66 * number) * 1)/1)+((accessories[1].price * number * 1)/1)+(accessories[2].price * Math.round((.33 * number) * 1)/1)
            $scope.total(packageTotal);
        };
        $scope.clear = function(){
            console.log('hit');
            angular.merge($scope.cart, $scope.emptyCart);
            $scope.priceTotal = 0;
        };
        $scope.formatNumber = function(i) {
            return Math.round(i * 1)/1;
        };
        $scope.total = function (price) {
            console.log(price)
            $scope.priceTotal += price;
        };
        $scope.addDiscount = function(amount){
            $scope.currentDiscount = Number(amount);

        };
        $scope.sendOrder = function(){
            $http.post(constants.API_URL + '/media', obj).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {

                }
            })
        }
        $scope.subtractTotal = function (price) {
            if($scope.priceTotal - price >= 0)
                $scope.priceTotal -= price ;
            else{
                $scope.priceTotal =0;
            }
        };
        $scope.switchItem = function(cart, mod) {
            switch (cart.name) {
                case 'iPad Air 16GB':
                    if(mod == 'add')
                        devices[0].qty += 1;
                    else if(devices[0].qty != 0)
                        devices[0].qty -= 1;
                    $scope.images.push({name: cart.name, fileName: 'dist/ipadair.jpeg'});
                    break;
                case 'iPad Pro 32GB':
                    if(mod == 'add')
                        devices[1].qty += 1;
                    else if(devices[1].qty != 0)
                        devices[1].qty -= 1;
                    $scope.images.push({name: cart.name, fileName: 'dist/ipad-pro-250x306.jpg'});
                    break;
                case 'iPad Air 16GB 4G':
                    if(mod == 'add')
                        devices[2].qty += 1;
                    else if(devices[2].qty != 0)
                        devices[2].qty -= 1;
                    $scope.images.push({name: cart.name, fileName: 'dist/ipadair.jpeg'});
                    break;
                case 'iPad Pro 128GB 4G':
                    if(mod == 'add')
                        devices[3].qty += 1;
                    else if(devices[3].qty != 0)
                        devices[3].qty -= 1;
                    break;
                case 'BWS bundle':
                    if(mod == 'add')
                        apps[0].qty += 1;
                    else if(apps[0].qty != 0)
                        apps[0].qty -= 1;
                    break;
                case 'Beer Lookup':
                    if(mod == 'add')
                        apps[1].qty += 1;
                    else if(apps[1].qty != 0)
                        apps[1].qty -= 1;
                    break;
                case 'Wine Lookup':
                    if(mod == 'add')
                        apps[2].qty += 1;
                    else if(apps[2].qty != 0)
                        apps[2].qty -= 1;
                    break;
                case 'Spirits Lookup':
                    if(mod == 'add')
                        apps[3].qty += 1;
                    else if(apps[3].qty != 0)
                        apps[3].qty -= 1;
                    break;
                case 'Pharmacy':
                    if(mod == 'add')
                        apps[4].qty += 1;
                    else if(apps[4].qty != 0)
                        apps[4].qty -= 1;
                    break;
                case 'Digital Signage':
                    if(mod == 'add')
                        apps[5].qty += 1;
                    else if(apps[5].qty != 0)
                        apps[5].qty -= 1;
                    break;
                case 'Dashboard':
                    if(mod == 'add')
                        apps[6].qty += 1;
                    else if(apps[6].qty != 0)
                        apps[6].qty -= 1;
                    break;

                case 'VESA Shelf Mount':
                    if(mod == 'add')
                        accessories[0].qty += 1;
                    else if(accessories[0].qty != 0)
                        accessories[0].qty -= 1;
                    $scope.images.push({name: cart.name, fileName: 'dist/vesa.jpg'});
                    break;
                case '2D Scanner':
                    if(mod == 'add')
                        accessories[1].qty += 1;
                    else if(accessories[1].qty != 0)
                        accessories[1].qty -= 1;
                    break;
                case 'Floor Stand':
                    if(mod == 'add')
                        accessories[2].qty += 1;
                    else if(accessories[2].qty != 0)
                        accessories[2].qty -= 1;
                    $scope.images.push({name: cart.name, fileName: 'dist/armodillo-floor.png'});
                    break;
                case '4G Hotspot':
                    if(mod == 'add')
                        accessories[3].qty += 1;
                    else if(accessories[3].qty != 0)
                        accessories[3].qty -= 1;
                    break;
                default:
            }
        };
        $scope.addItem = function (item, id) {
            var obj = item;
            if(id == 'device')
                $scope.cart.pricelist.totalDevices += 1;
            if(id == 'apps' )
                $scope.cart.pricelist.totalApps += 1;
            if(id == 'accessories')
                $scope.cart.pricelist.totalAccessories += 1;
            if ($scope.itemPrice.length == 0) {
                obj.total +=1;
                $scope.total(obj.price);
                $scope.switchItem(item, 'add');
            }
            else {
                obj.total += 1;
                $scope.switchItem(item, 'add');
                $scope.total(obj.price);
            }
        };
        $scope.removeItem = function (item, id) {
            var obj = item;
            if(id == 'device' && item.qty != 0)
                $scope.cart.pricelist.totalDevices -= 1;
            if(id == 'apps' && item.qty != 0)
                $scope.cart.pricelist.totalApps -= 1;
            if(id == 'accessories' && item.qty != 0)
                $scope.cart.pricelist.totalAccessories -= 1;
            for(var y in $scope.images){
                    if($scope.images[y].name == obj.name){
                        $scope.images.splice(y,1);
                    }
            }
            obj.total -=1;
            if(obj.qty != 0)
                $scope.subtractTotal(obj.price);
            $scope.switchItem(item, 'subtract');
        };
        $scope.appcheck;
        $scope.checkClick = function (item) {
            if ($scope.appcheck == false)
                $scope.addItem(item);
            else
                $scope.removeItem(item);
        };

        $scope.cart = {};
        $scope.emptyCart = {
            pricelist: {
                devices: [
                    {
                        name: 'iPad Air 16GB',
                        price: 499,
                        qty:0
                    },
                    {
                        name: 'iPad Pro 32GB',
                        price: 799,
                        qty:0
                    },
                    {
                        name: 'iPad Air 16GB 4G',
                        price: 629,
                        qty:0
                    },
                    {
                        name: 'iPad Pro 128GB 4G',
                        price: 1079,
                        qty:0
                    }],
                apps: [
                    {
                        'name': 'BWS bundle',
                        'price': 2500,
                        'max-quantity': 1,
                        qty:0
                    },
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
                        price: 130,
                        qty:0
                    },
                    {
                        name: '2D Scanner',
                        price: 275,
                        qty:0
                    },
                    {
                        name: 'Floor Stand',
                        price: 350,
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

        angular.copy($scope.emptyCart, $scope.cart);
        var devices = $scope.cart.pricelist.devices;
        var apps = $scope.cart.pricelist.apps;
        var accessories = $scope.cart.pricelist.accessories;
    }


]);

;
'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve', '$timeout', 'CurrentUserService', 'constants', '$http', 'toastr', '$q',
    function ($scope, $state, Authentication, userResolve, $timeout, CurrentUserService, constants, $http, toastr, $q) {


        $scope.authentication = Authentication;
        $scope.user = userResolve;

        console.log('userResolve %O', userResolve);

        $timeout(function () {
            $scope.roles = [
                {text: 'admin', id: 1004, selected: $scope.user.roles.indexOf(1004) > -1},
                {text: 'owner', id: 1009, selected: $scope.user.roles.indexOf(1009) > -1},
                {text: 'manager', id: 1002, selected: $scope.user.roles.indexOf(1002) > -1},
                {text: 'supplier', id: 1007, selected: $scope.user.roles.indexOf(1007) > -1},
                { text: 'user', id: 1003, selected: $scope.user.roles.indexOf(1003) > -1 },
                { text: 'editor', id: 1010, selected: $scope.user.roles.indexOf(1010) > -1 },
                { text: 'curator', id: 1011, selected: $scope.user.roles.indexOf(1011) > -1 }
            ];
        }, 500);



        $scope.update = function (isValid) {
            console.dir(isValid);
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'userForm');
                return false;
            }

                updateAPI();

        };

        function updateAPI() {
            $scope.user.roles = [];
            $scope.roles.forEach(function (role) {
                if (role.selected) {
                    $scope.user.roles.push(role.id)
                }
            });
            var user = $scope.user;

            console.log('userBeingEditied %O', user);
            var url = constants.API_URL + '/users/' + user.userId;
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
;
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator', 'constants', 'toastr', 'authToken', 'intercomService',
    function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator, constants, toastr, authToken, intercomService) {
        $scope.reset = false;
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

        // If user is signed in then redirect back home
        if ($scope.authentication.user) {
            $location.path('/');
        }

        $scope.signup = function () {
            $http.get(constants.API_URL + '/users/validate/' + userInfo.regCode).then(onValidReg, onInvalidReg);
        };


        //Reg code (userId) exists in database, continue with creation
        function onValidReg(response) {
            var userUpdate = {
                payload: {
                    email: $scope.credentials.email,
                    firstName:$scope.credentials.firstName,
                    lastName:$scope.credentials.lastName,
                    username: $scope.credentials.username,
                    password: $scope.credentials.password,
                    roles:userInfo.roles,
                    userId: userInfo.regCode,
                    accountId:userInfo.accountId
                }
            };
            var url = constants.API_URL + '/users/signup/' + userInfo.regCode;
            $http.put(url, userUpdate).then(onUpdateSuccess, onUpdateError)

        }

        //Reg code (userId) was invalid. Show error and reset credentials.
        function onInvalidReg(err) {
            toastr.error('User is not a valid user. Please contact support.');
            console.error(err);
            $scope.credentials = {}
        }

        //User updated users table in API successfully (registered in OnCue db) Update Mongo DB and sign in.
        function onUpdateSuccess(apiRes) {
            if (apiRes) {
                authToken.setToken(apiRes.data.token);
                //set roles
                localStorage.setItem('roles', apiRes.data.roles);
                //store account Id in location storage
                localStorage.setItem('accountId', apiRes.data.accountId);
                //set userId
                localStorage.setItem('roles', apiRes.data.roles)
                localStorage.setItem('userId', apiRes.data.userId);
                localStorage.setItem('userObject', JSON.stringify(apiRes.data));
                $scope.authentication.user = apiRes.data;
                userInfo.roles.forEach(function(role){
                    $scope.authentication.user.roles.push(Number(role))
                })
                console.log($scope.authentication)
                toastr.success('Success! User Created. Logging you in now...');
                 //And redirect to the previous or home page

                if ($scope.authentication.user.roles.indexOf(1002) < 0 && $scope.authentication.user.roles.indexOf(1009) < 0 && $scope.authentication.user.roles.indexOf(1004) < 0) {
                    console.log('1')
                    if ($scope.authentication.user.roles.indexOf(1010) >= 0) {
                        console.log('2')
                        $state.go('editor.products', {type: "wine", status: "new"})
                    }
                } else {
                    $state.go('dashboard', $state.previous.params);
                }

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
            var url = constants.API_URL + "/users/login";
            var payload = {
                payload: $scope.credentials
            };
            console.log(payload);
            $http.post(url, payload).then(onSigninSuccess, onSigninError);
        };

        //We've signed into the mongoDB, now lets authenticate with OnCue's API.
        function onSigninSuccess(response) {

            // If successful we assign the response to the global user model
            authToken.setToken(response.data.token);
            //set roles
            localStorage.setItem('roles', response.data.roles);
            //store account Id in location storage
            localStorage.setItem('accountId', response.data.accountId);
            //set userId
            localStorage.setItem('roles', response.data.roles)
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('userObject', JSON.stringify(response.data));
            $scope.authentication.user = response.data;


            if ($scope.authentication.user.roles.indexOf(1002) < 0 && $scope.authentication.user.roles.indexOf(1009) < 0 && $scope.authentication.user.roles.indexOf(1004) < 0) {
                if ($scope.authentication.user.roles.indexOf(1010) >= 0) {
                    $state.go('editor.products', {type: "wine", status: "new"})
                }
            } else {
                $state.go('dashboard', $state.previous.params);
            }

        }

        //We could not sign into mongo, so clear everything and show error.
        function onSigninError(err) {
            console.error(err);
            toastr.error('Failed To Connect, Please Contact Support.');
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
;
'use strict';

angular.module('users.manager').controller('AdmanagerController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav', 'constants', 'toastr', 'accountsService', 'uploadService',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav, constants, toastr, accountsService, uploadService) {
        $scope.authentication = Authentication;
        var self = this;
        $scope.activeAds = [];
        $scope.allMedia = [];
        $scope.allAccountMedia = [];
        $scope.sortingLog = [];
        $scope.ads = false;
        $scope.activeAds = false;
        $scope.storeDevices = false;
        $scope.selectAccountId = localStorage.getItem('accountId');
        $scope.toggleLeft = buildDelayedToggler('left');
        $scope.profiles = [];
        $scope.myPermissions = localStorage.getItem('roles');
        $scope.accountsService = accountsService;
        $scope.files = [];

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
            $scope.getProfiles();
            $scope.getAllMedia();

        };
        $scope.getProfiles = function () {
            $scope.profiles = [];
            $http.get(constants.API_URL + '/profiles?accountId=' + $scope.selectAccountId).then(function (res, err) {
                if (err) {
                    console.log(err);
                }
                if (res.data.length > 0) {
                    $scope.profiles = res.data;
                    $scope.currentProfile = res.data[0].profileId;
                    $scope.getActiveAds($scope.currentProfile);
                }
            });
        }
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
        $scope.getActiveAds = function (profileId) {
            $scope.activeAds = [];
            $http.get(constants.API_URL + '/ads?profileId=' + profileId).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response.data.length > 0) {

                    $scope.ads = true;
                    for (var i in response.data) {
                        var myData = {
                            value: response.data[i].mediaAssetId + "-" + response.data[i].fileName
                        };

                        var re = /(?:\.([^.]+))?$/;
                        var ext = re.exec(myData.value)[1];
                        ext = ext.toLowerCase();
                        if (ext == 'jpg' || ext == 'jpeg' || ext == 'png' || ext == 'gif') {
                            myData = {
                                name: response.data[i].fileName,
                                value: response.data[i].mediaAssetId + "-" + response.data[i].fileName,
                                ext: 'image',
                                adId: response.data[i].adId
                            };
                            for (var i in $scope.allMedia) {
                                if ($scope.allMedia[i].name == myData.name) {
                                    $scope.allMedia.splice(i, 1);
                                }
                            }
                            $scope.activeAds.push(myData);
                        } else if (ext == 'mp4' || ext == 'mov' || ext == 'm4v') {
                            myData = {
                                name: response.data[i].fileName,
                                value: response.data[i].mediaAssetId + "-" + response.data[i].fileName,
                                ext: 'video',
                                adId: response.data[i].adId
                            };
                            for (var i in $scope.allMedia) {
                                if ($scope.allMedia[i].name == myData.name) {
                                    $scope.allMedia.splice(i, 1);
                                }
                            }
                            $scope.activeAds.push(myData);
                        }

                    }
                }
            });
        };
        $scope.getAllMedia = function () {
            $scope.allMedia = [];

            $http.get(constants.API_URL + '/ads?accountId=' + $scope.selectAccountId).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    console.log(response)
                    for (var i in response.data) {
                        var myData = {
                            value: response.data[i].mediaAssetId + "-" + response.data[i].fileName
                        };
                        var re = /(?:\.([^.]+))?$/;
                        var ext = re.exec(myData.value)[1];
                        ext = ext.toLowerCase();
                        if (ext == 'jpg' || ext == 'jpeg' || ext == 'png' || ext == 'gif') {
                            myData = {
                                name: response.data[i].fileName,
                                value: response.data[i].mediaAssetId + "-" + response.data[i].fileName,
                                ext: 'image',
                                adId: response.data[i].adId
                            };
                            $scope.allMedia.push(myData);

                        } else if (ext == 'mp4' || ext == 'mov' || ext == 'm4v') {
                            myData = {
                                name: response.data[i].fileName,
                                value: response.data[i].mediaAssetId + "-" + response.data[i].fileName,
                                ext: 'video',
                                adId: response.data[i].adId
                            };
                            $scope.allMedia.push(myData);
                        }

                    }
                }
            });

        }
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
                    $scope.getActiveAds(profileId);
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
                    $scope.getActiveAds(profileId);
                    toastr.success('Ad removed from devices.');
                    $scope.getAllMedia();

                }
            });
        };
        $scope.$watch('files', function () {
            $scope.upload($scope.files);
        });
        $scope.$watch('file', function () {
            if ($scope.file != null) {
                $scope.files = [$scope.file];
            }
        });

        $scope.upload = function (files) {
            var responses = [];
            for (var i = 0; i < files.length; i++) {
                var mediaConfig = {
                    mediaRoute: 'ads',
                    folder: 'ads',
                    accountId: $scope.selectAccountId
                };
                uploadService.upload(files[i], mediaConfig).then(function (response, err) {
                    if (response) {
                        toastr.success('New Ad Uploaded', 'Success!');
                        responses.push(response)
                        if(responses.length == files.length)
                            $scope.getAllMedia();
                    }
                })
            }
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

;
'use strict';


angular.module('users.manager').controller('DashboardController', ['$scope', '$stateParams','$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav', 'constants', 'chartService', 'accountsService',
	function($scope, $stateParams, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav, constants, chartService, accountsService) {
		$scope.authentication = Authentication;

        var self = this;
		$scope.myPermissions = localStorage.getItem('roles');
		if($stateParams.accountId)
			$scope.selectAccountId = $stateParams.accountId;
		else
			$scope.selectAccountId = localStorage.getItem('accountId');
		$scope.chartService = chartService;
		$scope.accountsService = accountsService;
		$scope.onClick = function(points, evt) {
			console.log(points, evt);
		};
		$scope.chartOptions = {};
		$scope.init = function() {
			$state.go('.', {accountId: $scope.selectAccountId}, {notify: false})
			$scope.emails = [];
			$scope.phones = [];
			$scope.loyalty = [];
			$scope.analytics = [];
			$scope.locations = [];
			$scope.stores = [];
			$scope.specificLoc = [];
			chartService.groupAndFormatDate($scope.selectAccountId)
			console.log('state params %O', $stateParams)
			//$scope.selectAccountId = $stateParams.accountId;
			$scope.sources = [];
			$http.get(constants.API_URL + '/locations?account=' + $scope.selectAccountId).then(function(res, err) {
					if (err) {
						console.log(err);
						toastr.error("We're experiencing some technical difficulties with our database, please check back soon")


					}
					if (res.data.length > 0) {
						//this account has at least one location
						res.data.forEach(function(thisLocation) {
							thisLocation.devices = [];
							$http.get(constants.API_URL + '/devices/location/' + thisLocation.locationId).then(function(response, err) {
								if (err) {
									console.log(err);
								}
								if (response.data.length > 0) {
									//this location has devices, add to that location
									response.data.forEach(function(device) {
										var rightNow = moment();
                                        // var time = moment(device.lastCheck).subtract(4, 'hours');
                                        var time = moment(device.lastCheck);
										device.moment = moment(time).fromNow();
                                        var timeDiff = time.diff(rightNow, 'hours');
                                        device.unhealthy = timeDiff <= -3;

                                    });
									thisLocation.devices = response.data || [];
									$scope.locations.push(thisLocation)
								}
							});
						})
					}
				})
			$http.get(constants.API_URL + '/loyalty?account=' + $scope.selectAccountId).then(function(res, err) {
				if (err) {
					console.log(err);
					toastr.error("We're experiencing some technical difficulties with our database, please check back soon")
				}
				if (res) {
					for (var i in res.data) {
						var contact = JSON.parse(res.data[i].contactInfo);
						if (contact["email"]) {
							$scope.emails.push({
								email: contact['email']
							});
						} else {
							$scope.phones.push({
								phone: contact['phone']
							});

						}

					}
				}
			});

			var url = constants.API_URL + '/analytics/top-products?account=' + $scope.selectAccountId;
			$http.get(url).then(function(res, err) {
				if (err) {
					console.log(err);
					toastr.error("We're experiencing some technical difficulties with our database, please check back soon")
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
;
angular.module('users.manager').controller('LocationManagerController', function ($scope, locationsService, $state, accountsService, CurrentUserService) {
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

});
;
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
;
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator', 'constants', 'toastr', 'authToken', '$state',
    function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator, constants, toastr, authToken, $state) {
        $scope.authentication = Authentication;
        $scope.popoverMsg = PasswordValidator.getPopoverMsg();

        //If user is signed in then redirect back home
        if ($scope.authentication.user) {
            $location.path('/');
        }


        // Change user password
        $scope.resetUserPassword = function (isValid) {
            $scope.success = $scope.error = null;
            var resetObj = {
                payload: {
                    token: $location.search().token,
                    username: $location.search().username,
                    newPass: $scope.passwordDetails.newPassword
                }
            };
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

                return false;
            }
            console.log('new pass details %0', resetObj);
            $http.post(constants.API_URL + '/users/auth/reset', resetObj).then(function (response, err) {
                if (err) {
                    toastr.error('Invalid Token. Please contact support at support@getsellr.com')
                }
                var userLogin = {
                    payload: {
                        username: resetObj.payload.username,
                        password: resetObj.payload.newPass
                    }
                };

                $http.post(constants.API_URL + '/users/login', userLogin).then(function (response, err) {
                    if (err) {
                        toastr.error('Invalid Token. Please contact support at support@getsellr.com')
                    }
                    // If successful we assign the response to the global user model
                    authToken.setToken(response.data.token);
                    //set roles
                    localStorage.setItem('roles', response.data.roles);
                    //store account Id in location storage
                    localStorage.setItem('accountId', response.data.accountId);
                    //set userId
                    localStorage.setItem('roles', response.data.roles)
                    localStorage.setItem('userId', response.data.userId);
                    localStorage.setItem('userObject', JSON.stringify(response.data));
                    $scope.authentication.user = response.data;


                    $state.go('dashboard', $state.previous.params);
                })
            })
        };
        function onSigninSuccess(response) {
            console.log('hello')
            // If successful we assign the response to the global user model
            authToken.setToken(response.data.token);
            //set roles
            localStorage.setItem('roles', response.data.roles);
            //store account Id in location storage
            localStorage.setItem('accountId', response.data.accountId);
            //set userId
            localStorage.setItem('roles', response.data.roles)
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('userObject', JSON.stringify(response.data));
            $scope.authentication.user = response.data;


            $state.go('dashboard', $state.previous.params);
        }

        //We could not sign into mongo, so clear everything and show error.
        function onSigninError(err) {
            console.error(err);
            toastr.error('Failed To Connect, Please Contact Support.');
            $scope.error = err.message;
            $scope.credentials = {};
        }
    }
]);
;
angular.module('users').controller('productEditorController', function ($scope, Authentication, productEditorService, $location, $state, $stateParams, Countries, $mdMenu, constants, MediumS3ImageUploader) {

    Authentication.user = Authentication.user || { roles: '' };
    $scope.$state = $state;
    $scope.pes = productEditorService;
    // $scope.userId = Authentication.userId || localStorage.getItem('userId') || 407;
    $scope.userId = localStorage.getItem('userId');
    $scope.detail = {
        template: 'modules/users/client/views/productEditor/productEditor.detail.html'
    };
    $scope.display = {
        myProducts: false,
        feedback: true
    };

    $scope.permissions = {
        editor: Authentication.user.roles.indexOf(1010) > -1 || Authentication.user.roles.indexOf(1004) > -1,
        curator: Authentication.user.roles.indexOf(1011) > -1 || Authentication.user.roles.indexOf(1004) > -1
    };

    $scope.mediumEditorOptions = {
        imageDragging: false,
        extensions: {
            's3-image-uploader': new MediumS3ImageUploader()
        }
    };

    $scope.search = {};
    $scope.searchLimit = 15;

    $scope.showMore = function () {
        $scope.searchLimit += 15;
    };


    $scope.Countries = Countries.allCountries;
    $scope.selectProductType = function (type) {
        productEditorService.currentType = type;
        $state.go('editor.products', { type: type.name, status: productEditorService.currentStatus.value });
        productEditorService.updateProductList()
    };

    $scope.selectProductStatus = function (status) {
        productEditorService.currentStatus = status;
        productEditorService.updateProductList()
    };
    function init() {
        console.log('init controller. Account is %s', productEditorService.currentAccount)
        var type;
        switch ($stateParams.type) {
            case 'wine':
                type = { name: 'wine', productTypeId: 1 };
                break;
            case 'beer':
                type = { name: 'beer', productTypeId: 2 };
                break;
            case 'spirits':
                type = { name: 'spirits', productTypeId: 3 };
                break;
            default:
                type = { name: 'wine', productTypeId: 1 };
                break;
        }
        var status;
        switch ($stateParams.status) {
            case 'new':
                status = { name: 'Available', value: 'new' };
                break;
            case 'inprogress':
                status = { name: 'In Progress', value: 'inprogress' };
                break;
            case 'done':
                status = { name: 'Done', value: 'done' };
                break;
            case 'approved':
                status = { name: 'Approved', value: 'approved' };
                break;
            default:
                status = { name: 'Available', value: 'new' };
                break;

        }

        productEditorService.currentType = type;
        productEditorService.currentStatus = status;
        productEditorService.updateProductList();
        if ($stateParams.productId) {
            if ($stateParams.task === 'view') {
                $scope.viewProduct($stateParams)
            }
            if ($stateParams.task === 'edit') {
                $scope.editProduct($stateParams)
            }
        }
    }

    $scope.claimProduct = function (prod) {
        var options = {
            userId: $scope.userId,
            productId: prod.productId
        };
        productEditorService.claim(options);
        var i = _.findIndex(productEditorService.productList, function (p) {
            return p.productId === prod.productId
        });

        productEditorService.productList[ i ].username = Authentication.user.username;
        productEditorService.productList[ i ].userId = $scope.userId;
        // $scope.editProduct(prod)
    };

    $scope.removeClaim = function (product, i) {
        var options = {
            userId: $scope.userId,
            productId: product.productId
        };
        productEditorService.removeClaim(options);
        productEditorService.productList[ i ].username = null;
        productEditorService.productList[ i ].userId = null;
        $scope.detail.template = 'modules/users/client/views/productEditor/productEditor.detail.html'
    }

    $scope.viewProduct = function (product) {
        productEditorService.setCurrentProduct(product);
        $state.go('editor.products.detail', { productId: product.productId, task: 'view' });
        $scope.detail.template = 'modules/users/client/views/productEditor/productEditor.detail.view.html'
    };
    $scope.editProduct = function (product) {
        productEditorService.setCurrentProduct(product);
        productEditorService.currentStatus = { name: 'In Progress', value: 'inprogress' };
        console.log('editProduct sees type as ', productEditorService.currentType.name)
        $state.go('editor.products.detail', {
            type: productEditorService.currentType.name,
            status: 'inprogress',
            productId: product.productId,
            task: 'edit'
        });
        $scope.detail.template = 'modules/users/client/views/productEditor/productEditor.detail.edit.html'
    };

    $scope.quickEdit = function (product) {
        var options = {
            userId: $scope.userId,
            productId: product.productId,
            status: 'done'
        };
        productEditorService.claim(options);
        productEditorService.setCurrentProduct(product);
        productEditorService.currentStatus = { name: 'Done', value: 'done' };
        $state.go('editor.products.detail', {
            type: productEditorService.currentType.name,
            status: 'done',
            productId: product.productId,
            task: 'edit'
        });
        $scope.detail.template = 'modules/users/client/views/productEditor/productEditor.detail.edit.html'

    }

    $scope.sendBack = function (product, feedback) {
        product.feedback = feedback;
        product.status = 'inprogress';
        productEditorService.save(product);
    };

    $scope.submitForApproval = function (product) {
        product.status = 'done';
        productEditorService.save(product);
        $scope.viewProduct(product);
        $('.modal-backdrop').remove()

    };

    $scope.approveProduct = function (product) {
        product.status = 'approved';
        productEditorService.save(product);
    };

    $scope.save = function (product) {
        product.status = 'inprogress';
        productEditorService.save(product)
    };

    $scope.updateProduct = function (product) {
        if (product.status != 'done') {
            product.status = 'inprogress';
        }
        productEditorService.save(product)
    };

    $scope.flagAsDuplicate = function (product, comments) {
        product.description += ' | DUPLICATE:' + comments;
        product.status = 'duplicate';
        productEditorService.save(product)
    };

    $scope.updateCounts = function () {
        productEditorService.getStats()
    }


    $scope.playAudio = function () {
        productEditorService.currentProduct.audio.play()
    };
    $scope.pauseAudio = function () {
        productEditorService.currentProduct.audio.pause()
    };
    $scope.removeAudio = function () {
        var currentAudio = productEditorService.currentProduct.audio.mediaAssetId;
        productEditorService.removeAudio(currentAudio)
    };
    $scope.seekAudio = function () {
        productEditorService.currentProduct.audio.currentTime = productEditorService.currentProduct.audio.progress * productEditorService.currentProduct.audio.duration

    };
    //ignore this
    $scope.removeImage = function (current) {
        productEditorService.removeImage(current)
    };
    $(window).bind('keydown', function (event) {
        if (event.ctrlKey || event.metaKey) {
            var prod = productEditorService.currentProduct;

            switch (String.fromCharCode(event.which).toLowerCase()) {
                case 's':
                    event.preventDefault();
                    $scope.updateProduct(prod);
                    break;
                case 'd':
                    event.preventDefault();
                    $scope.submitForApproval(prod)

            }
        }
    });

    $scope.buttonDisplay = function (button, product) {
        var bool = false;
        switch (button) {
            case 'Edit':
                if (product.status !== 'done' && product.userId == $scope.userId) {
                    bool = true;
                }
                if (product.status == 'approved') {
                    bool = false;
                }
                break;
            case 'Unassign':
                if (product.status !== 'done' && product.userId == $scope.userId) {
                    bool = true;
                }
                if (product.status == 'approved') {
                    bool = false;
                }
                break;
            case 'Claim':
                if (product.status == 'new' && !product.userId) {
                    bool = true;
                }
                break;
            case 'Quick Edit':
                if ($scope.permissions.curator && product.status == 'done') {
                    bool = true
                }
        }

        return bool

    };

    $scope.showProduct = function (product) {
        var display = true;
        if (product.status == 'inprogress' || product.status == 'done') {
            display = (product.userId == $scope.userId || $scope.permissions.curator);
        }
        if ($scope.display.myProducts) {
            display = product.userId == $scope.userId
        }
        return display;
    };


    init();



});
;
angular.module('users').controller('productEditorDetailController', function ($scope, Authentication, productEditorService, $location, $state, $stateParams, type, status) {

    $scope.userId = Authentication.userId || localStorage.getItem('userId');

    // $scope.permissions.editor = JSON.parse(localStorage.getItem('roles')).indexOf(1010) > -1;
    // $scope.permissions.curator = JSON.parse(localStorage.getItem('roles')).indexOf(1011) > -1;
    $scope.permissions = {
        editor: Authentication.user.roles.indexOf('editor') > -1,
        curator: Authentication.user.roles.indexOf('curator') > -1
    };
    console.log('state params %O', type, status);

    console.log('starting product detail controller');
    $scope.productEditorService = productEditorService;
});
;
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
;
'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
  function ($scope, $timeout, $window, Authentication, FileUploader) {
      $scope.user = Authentication.user || { profileImageUrl: '' };
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
;
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
;
'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);
;
'use strict';

angular.module('users.admin').controller('StoreOwnerInviteController', [ '$scope','Authentication', '$filter', 'Admin', '$http', '$state', 'CurrentUserService', 'constants', 'accountsService', 'toastr',
    function ($scope,Authentication, $filter, Admin, $http, $state, CurrentUserService, constants, accountsService, toastr) {


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
            {text: 'owner', id: 1009},
            {text: 'manager', id: 1002},
            {text: 'supplier', id: 1007},
            { text: 'user', id: 1003 },
            { text: 'editor', id: 1010 },
            { text: 'curator', id: 1011 }
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
;
'use strict';

angular.module('users.supplier').controller('MediaController', ['$scope','$state','$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService','constants', 'toastr', 'uploadService',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService,constants,toastr, uploadService) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;
        $scope.files = [];
        $scope.links = [];

        $scope.$watch('files', function () {
            $scope.upload($scope.files);
        });
        $scope.$watch('file', function () {
            if ($scope.file != null) {
                $scope.files = [$scope.file];
            }
        });

        

        $scope.upload = function(files) {
            for (var i = 0; i < files.length; i++) {
                var mediaConfig = {
                    mediaRoute: 'ads',
                    folder: 'supplier',
                    accountId: localStorage.getItem('accountId')
                };
                uploadService.upload(files[i], mediaConfig).then(function (response, err) {
                    if (response) {
                        toastr.success('New Ad Uploaded', 'Success!');
                    }
                    else {
                        toastr.error('There was a problem uploading ads')
                    }
                })
            }
        }
    }

]);

;
(function () {
    var indexOf = [].indexOf || function (item) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (i in this && this[ i ] === item) return i;
            }
            return -1;
        };

    angular.module('users').directive('countrySelect', function () {
        var allCountries;
        allCountries = [
            {
                code: 'AF',
                name: 'Afghanistan'
            }, {
                code: 'AL',
                name: 'Albania'
            }, {
                code: 'DZ',
                name: 'Algeria'
            }, {
                code: 'AS',
                name: 'American Samoa'
            }, {
                code: 'AD',
                name: 'Andorre'
            }, {
                code: 'AO',
                name: 'Angola'
            }, {
                code: 'AI',
                name: 'Anguilla'
            }, {
                code: 'AQ',
                name: 'Antarctica'
            }, {
                code: 'AG',
                name: 'Antigua and Barbuda'
            }, {
                code: 'AR',
                name: 'Argentina'
            }, {
                code: 'AM',
                name: 'Armenia'
            }, {
                code: 'AW',
                name: 'Aruba'
            }, {
                code: 'AU',
                name: 'Australia'
            }, {
                code: 'AT',
                name: 'Austria'
            }, {
                code: 'AZ',
                name: 'Azerbaijan'
            }, {
                code: 'BS',
                name: 'Bahamas'
            }, {
                code: 'BH',
                name: 'Bahrain'
            }, {
                code: 'BD',
                name: 'Bangladesh'
            }, {
                code: 'BB',
                name: 'Barbade'
            }, {
                code: 'BY',
                name: 'Belarus'
            }, {
                code: 'BE',
                name: 'Belgium'
            }, {
                code: 'BZ',
                name: 'Belize'
            }, {
                code: 'BJ',
                name: 'Benin'
            }, {
                code: 'BM',
                name: 'Bermuda'
            }, {
                code: 'BT',
                name: 'Bhutan'
            }, {
                code: 'BO',
                name: 'Bolivia'
            }, {
                code: 'BQ',
                name: 'Bonaire, Sint Eustatius and Saba'
            }, {
                code: 'BA',
                name: 'Bosnia and Herzegovina'
            }, {
                code: 'BW',
                name: 'Botswana'
            }, {
                code: 'BV',
                name: 'Bouvet Island'
            }, {
                code: 'BR',
                name: 'Brazil'
            }, {
                code: 'IO',
                name: 'British Indian Ocean Territory'
            }, {
                code: 'VG',
                name: 'British Virgin Islands'
            }, {
                code: 'BN',
                name: 'Brunei'
            }, {
                code: 'BG',
                name: 'Bulgaria'
            }, {
                code: 'BF',
                name: 'Burkina Faso'
            }, {
                code: 'BI',
                name: 'Burundi'
            }, {
                code: 'KH',
                name: 'Cambodia'
            }, {
                code: 'CM',
                name: 'Cameroon'
            }, {
                code: 'CA',
                name: 'Canada'
            }, {
                code: 'CV',
                name: 'Cape Verde'
            }, {
                code: 'KY',
                name: 'Cayman Islands'
            }, {
                code: 'CF',
                name: 'Central African Republic'
            }, {
                code: 'TD',
                name: 'Chad'
            }, {
                code: 'CL',
                name: 'Chile'
            }, {
                code: 'CN',
                name: 'China'
            }, {
                code: 'CX',
                name: 'Christmas Island'
            }, {
                code: 'CC',
                name: 'Cocos (Keeling) Islands'
            }, {
                code: 'CO',
                name: 'Colombia'
            }, {
                code: 'KM',
                name: 'Comoros'
            }, {
                code: 'CG',
                name: 'Congo'
            }, {
                code: 'CD',
                name: 'Congo (Dem. Rep.)'
            }, {
                code: 'CK',
                name: 'Cook Islands'
            }, {
                code: 'CR',
                name: 'Costa Rica'
            }, {
                code: 'ME',
                name: 'Crna Gora'
            }, {
                code: 'HR',
                name: 'Croatia'
            }, {
                code: 'CU',
                name: 'Cuba'
            }, {
                code: 'CW',
                name: 'Curaçao'
            }, {
                code: 'CY',
                name: 'Cyprus'
            }, {
                code: 'CZ',
                name: 'Czech Republic'
            }, {
                code: 'CI',
                name: "Côte D'Ivoire"
            }, {
                code: 'DK',
                name: 'Denmark'
            }, {
                code: 'DJ',
                name: 'Djibouti'
            }, {
                code: 'DM',
                name: 'Dominica'
            }, {
                code: 'DO',
                name: 'Dominican Republic'
            }, {
                code: 'TL',
                name: 'East Timor'
            }, {
                code: 'EC',
                name: 'Ecuador'
            }, {
                code: 'EG',
                name: 'Egypt'
            }, {
                code: 'SV',
                name: 'El Salvador'
            }, {
                code: 'GQ',
                name: 'Equatorial Guinea'
            }, {
                code: 'ER',
                name: 'Eritrea'
            }, {
                code: 'EE',
                name: 'Estonia'
            }, {
                code: 'ET',
                name: 'Ethiopia'
            }, {
                code: 'FK',
                name: 'Falkland Islands'
            }, {
                code: 'FO',
                name: 'Faroe Islands'
            }, {
                code: 'FJ',
                name: 'Fiji'
            }, {
                code: 'FI',
                name: 'Finland'
            }, {
                code: 'FR',
                name: 'France'
            }, {
                code: 'GF',
                name: 'French Guiana'
            }, {
                code: 'PF',
                name: 'French Polynesia'
            }, {
                code: 'TF',
                name: 'French Southern Territories'
            }, {
                code: 'GA',
                name: 'Gabon'
            }, {
                code: 'GM',
                name: 'Gambia'
            }, {
                code: 'GE',
                name: 'Georgia'
            }, {
                code: 'DE',
                name: 'Germany'
            }, {
                code: 'GH',
                name: 'Ghana'
            }, {
                code: 'GI',
                name: 'Gibraltar'
            }, {
                code: 'GR',
                name: 'Greece'
            }, {
                code: 'GL',
                name: 'Greenland'
            }, {
                code: 'GD',
                name: 'Grenada'
            }, {
                code: 'GP',
                name: 'Guadeloupe'
            }, {
                code: 'GU',
                name: 'Guam'
            }, {
                code: 'GT',
                name: 'Guatemala'
            }, {
                code: 'GG',
                name: 'Guernsey and Alderney'
            }, {
                code: 'GN',
                name: 'Guinea'
            }, {
                code: 'GW',
                name: 'Guinea-Bissau'
            }, {
                code: 'GY',
                name: 'Guyana'
            }, {
                code: 'HT',
                name: 'Haiti'
            }, {
                code: 'HM',
                name: 'Heard and McDonald Islands'
            }, {
                code: 'HN',
                name: 'Honduras'
            }, {
                code: 'HK',
                name: 'Hong Kong'
            }, {
                code: 'HU',
                name: 'Hungary'
            }, {
                code: 'IS',
                name: 'Iceland'
            }, {
                code: 'IN',
                name: 'India'
            }, {
                code: 'ID',
                name: 'Indonesia'
            }, {
                code: 'IR',
                name: 'Iran'
            }, {
                code: 'IQ',
                name: 'Iraq'
            }, {
                code: 'IE',
                name: 'Ireland'
            }, {
                code: 'IM',
                name: 'Isle of Man'
            }, {
                code: 'IL',
                name: 'Israel'
            }, {
                code: 'IT',
                name: 'Italy'
            }, {
                code: 'JM',
                name: 'Jamaica'
            }, {
                code: 'JP',
                name: 'Japan'
            }, {
                code: 'JE',
                name: 'Jersey'
            }, {
                code: 'JO',
                name: 'Jordan'
            }, {
                code: 'KZ',
                name: 'Kazakhstan'
            }, {
                code: 'KE',
                name: 'Kenya'
            }, {
                code: 'KI',
                name: 'Kiribati'
            }, {
                code: 'KP',
                name: 'Korea (North)'
            }, {
                code: 'KR',
                name: 'Korea (South)'
            }, {
                code: 'KW',
                name: 'Kuwait'
            }, {
                code: 'KG',
                name: 'Kyrgyzstan'
            }, {
                code: 'LA',
                name: 'Laos'
            }, {
                code: 'LV',
                name: 'Latvia'
            }, {
                code: 'LB',
                name: 'Lebanon'
            }, {
                code: 'LS',
                name: 'Lesotho'
            }, {
                code: 'LR',
                name: 'Liberia'
            }, {
                code: 'LY',
                name: 'Libya'
            }, {
                code: 'LI',
                name: 'Liechtenstein'
            }, {
                code: 'LT',
                name: 'Lithuania'
            }, {
                code: 'LU',
                name: 'Luxembourg'
            }, {
                code: 'MO',
                name: 'Macao'
            }, {
                code: 'MK',
                name: 'Macedonia'
            }, {
                code: 'MG',
                name: 'Madagascar'
            }, {
                code: 'MW',
                name: 'Malawi'
            }, {
                code: 'MY',
                name: 'Malaysia'
            }, {
                code: 'MV',
                name: 'Maldives'
            }, {
                code: 'ML',
                name: 'Mali'
            }, {
                code: 'MT',
                name: 'Malta'
            }, {
                code: 'MH',
                name: 'Marshall Islands'
            }, {
                code: 'MQ',
                name: 'Martinique'
            }, {
                code: 'MR',
                name: 'Mauritania'
            }, {
                code: 'MU',
                name: 'Mauritius'
            }, {
                code: 'YT',
                name: 'Mayotte'
            }, {
                code: 'MX',
                name: 'Mexico'
            }, {
                code: 'FM',
                name: 'Micronesia'
            }, {
                code: 'MD',
                name: 'Moldova'
            }, {
                code: 'MC',
                name: 'Monaco'
            }, {
                code: 'MN',
                name: 'Mongolia'
            }, {
                code: 'MS',
                name: 'Montserrat'
            }, {
                code: 'MA',
                name: 'Morocco'
            }, {
                code: 'MZ',
                name: 'Mozambique'
            }, {
                code: 'MM',
                name: 'Myanmar'
            }, {
                code: 'NA',
                name: 'Namibia'
            }, {
                code: 'NR',
                name: 'Nauru'
            }, {
                code: 'NP',
                name: 'Nepal'
            }, {
                code: 'NL',
                name: 'Netherlands'
            }, {
                code: 'AN',
                name: 'Netherlands Antilles'
            }, {
                code: 'NC',
                name: 'New Caledonia'
            }, {
                code: 'NZ',
                name: 'New Zealand'
            }, {
                code: 'NI',
                name: 'Nicaragua'
            }, {
                code: 'NE',
                name: 'Niger'
            }, {
                code: 'NG',
                name: 'Nigeria'
            }, {
                code: 'NU',
                name: 'Niue'
            }, {
                code: 'NF',
                name: 'Norfolk Island'
            }, {
                code: 'MP',
                name: 'Northern Mariana Islands'
            }, {
                code: 'NO',
                name: 'Norway'
            }, {
                code: 'OM',
                name: 'Oman'
            }, {
                code: 'PK',
                name: 'Pakistan'
            }, {
                code: 'PW',
                name: 'Palau'
            }, {
                code: 'PS',
                name: 'Palestine'
            }, {
                code: 'PA',
                name: 'Panama'
            }, {
                code: 'PG',
                name: 'Papua New Guinea'
            }, {
                code: 'PY',
                name: 'Paraguay'
            }, {
                code: 'PE',
                name: 'Peru'
            }, {
                code: 'PH',
                name: 'Philippines'
            }, {
                code: 'PN',
                name: 'Pitcairn'
            }, {
                code: 'PL',
                name: 'Poland'
            }, {
                code: 'PT',
                name: 'Portugal'
            }, {
                code: 'PR',
                name: 'Puerto Rico'
            }, {
                code: 'QA',
                name: 'Qatar'
            }, {
                code: 'RO',
                name: 'Romania'
            }, {
                code: 'RU',
                name: 'Russia'
            }, {
                code: 'RW',
                name: 'Rwanda'
            }, {
                code: 'RE',
                name: 'Réunion'
            }, {
                code: 'BL',
                name: 'Saint Barthélemy'
            }, {
                code: 'SH',
                name: 'Saint Helena'
            }, {
                code: 'KN',
                name: 'Saint Kitts and Nevis'
            }, {
                code: 'LC',
                name: 'Saint Lucia'
            }, {
                code: 'MF',
                name: 'Saint Martin'
            }, {
                code: 'PM',
                name: 'Saint Pierre and Miquelon'
            }, {
                code: 'VC',
                name: 'Saint Vincent and the Grenadines'
            }, {
                code: 'WS',
                name: 'Samoa'
            }, {
                code: 'SM',
                name: 'San Marino'
            }, {
                code: 'SA',
                name: 'Saudi Arabia'
            }, {
                code: 'SN',
                name: 'Senegal'
            }, {
                code: 'RS',
                name: 'Serbia'
            }, {
                code: 'SC',
                name: 'Seychelles'
            }, {
                code: 'SL',
                name: 'Sierra Leone'
            }, {
                code: 'SG',
                name: 'Singapore'
            }, {
                code: 'SX',
                name: 'Sint Maarten'
            }, {
                code: 'SK',
                name: 'Slovakia'
            }, {
                code: 'SI',
                name: 'Slovenia'
            }, {
                code: 'SB',
                name: 'Solomon Islands'
            }, {
                code: 'SO',
                name: 'Somalia'
            }, {
                code: 'ZA',
                name: 'South Africa'
            }, {
                code: 'GS',
                name: 'South Georgia and the South Sandwich Islands'
            }, {
                code: 'SS',
                name: 'South Sudan'
            }, {
                code: 'ES',
                name: 'Spain'
            }, {
                code: 'LK',
                name: 'Sri Lanka'
            }, {
                code: 'SD',
                name: 'Sudan'
            }, {
                code: 'SR',
                name: 'Suriname'
            }, {
                code: 'SJ',
                name: 'Svalbard and Jan Mayen'
            }, {
                code: 'SZ',
                name: 'Swaziland'
            }, {
                code: 'SE',
                name: 'Sweden'
            }, {
                code: 'CH',
                name: 'Switzerland'
            }, {
                code: 'SY',
                name: 'Syria'
            }, {
                code: 'ST',
                name: 'São Tomé and Príncipe'
            }, {
                code: 'TW',
                name: 'Taiwan'
            }, {
                code: 'TJ',
                name: 'Tajikistan'
            }, {
                code: 'TZ',
                name: 'Tanzania'
            }, {
                code: 'TH',
                name: 'Thailand'
            }, {
                code: 'TG',
                name: 'Togo'
            }, {
                code: 'TK',
                name: 'Tokelau'
            }, {
                code: 'TO',
                name: 'Tonga'
            }, {
                code: 'TT',
                name: 'Trinidad and Tobago'
            }, {
                code: 'TN',
                name: 'Tunisia'
            }, {
                code: 'TR',
                name: 'Turkey'
            }, {
                code: 'TM',
                name: 'Turkmenistan'
            }, {
                code: 'TC',
                name: 'Turks and Caicos Islands'
            }, {
                code: 'TV',
                name: 'Tuvalu'
            }, {
                code: 'UG',
                name: 'Uganda'
            }, {
                code: 'UA',
                name: 'Ukraine'
            }, {
                code: 'AE',
                name: 'United Arab Emirates'
            }, {
                code: 'GB',
                name: 'United Kingdom'
            }, {
                code: 'UM',
                name: 'United States Minor Outlying Islands'
            }, {
                code: 'US',
                name: 'United States of America'
            }, {
                code: 'UY',
                name: 'Uruguay'
            }, {
                code: 'UZ',
                name: 'Uzbekistan'
            }, {
                code: 'VU',
                name: 'Vanuatu'
            }, {
                code: 'VA',
                name: 'Vatican City'
            }, {
                code: 'VE',
                name: 'Venezuela'
            }, {
                code: 'VN',
                name: 'Vietnam'
            }, {
                code: 'VI',
                name: 'Virgin Islands of the United States'
            }, {
                code: 'WF',
                name: 'Wallis and Futuna'
            }, {
                code: 'EH',
                name: 'Western Sahara'
            }, {
                code: 'YE',
                name: 'Yemen'
            }, {
                code: 'ZM',
                name: 'Zambia'
            }, {
                code: 'ZW',
                name: 'Zimbabwe'
            }, {
                code: 'AX',
                name: 'Åland Islands'
            }
        ];
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                priorities: '@csPriorities',
                only: '@csOnly',
                except: '@csExcept'
            },
            template: '<select ng-options="country.name as country.name for country in countries"> <option value="" ng-if="isSelectionOptional"></option> </select>',
            controller: [
                '$scope', '$attrs', function ($scope, $attrs) {
                    var countryCodesIn, findCountriesIn, includeOnlyRequestedCountries, removeCountry, removeExcludedCountries, separator, updateWithPriorityCountries;
                    separator = {
                        code: '-',
                        name: '────────────────────',
                        disabled: true
                    };
                    countryCodesIn = function (codesString) {
                        var codes;
                        codes = codesString ? codesString.split(',') : [];
                        return codes.map(function (code) {
                            return code.trim();
                        });
                    };
                    findCountriesIn = (function (_this) {
                        return function (codesString) {
                            var country, countryCodes, i, len, ref, ref1, results;
                            countryCodes = countryCodesIn(codesString);
                            ref = _this.countries;
                            results = [];
                            for (i = 0, len = ref.length; i < len; i++) {
                                country = ref[ i ];
                                if (ref1 = country.code, indexOf.call(countryCodes, ref1) >= 0) {
                                    results.push(country);
                                }
                            }
                            return results;
                        };
                    })(this);
                    removeCountry = (function (_this) {
                        return function (country) {
                            return _this.countries.splice(_this.countries.indexOf(country), 1);
                        };
                    })(this);
                    includeOnlyRequestedCountries = (function (_this) {
                        return function () {
                            if (!$scope.only) {
                                return;
                            }
                            return _this.countries = findCountriesIn($scope.only);
                        };
                    })(this);
                    removeExcludedCountries = function () {
                        var country, i, len, ref, results;
                        if (!$scope.except) {
                            return;
                        }
                        ref = findCountriesIn($scope.except);
                        results = [];
                        for (i = 0, len = ref.length; i < len; i++) {
                            country = ref[ i ];
                            results.push(removeCountry(country));
                        }
                        return results;
                    };
                    updateWithPriorityCountries = (function (_this) {
                        return function () {
                            var i, len, priorityCountries, priorityCountry, ref, results;
                            priorityCountries = findCountriesIn($scope.priorities);
                            if (priorityCountries.length === 0) {
                                return;
                            }
                            _this.countries.unshift(separator);
                            ref = priorityCountries.reverse();
                            results = [];
                            for (i = 0, len = ref.length; i < len; i++) {
                                priorityCountry = ref[ i ];
                                removeCountry(priorityCountry);
                                results.push(_this.countries.unshift(priorityCountry));
                            }
                            return results;
                        };
                    })(this);
                    this.countries = allCountries.slice();
                    includeOnlyRequestedCountries();
                    removeExcludedCountries();
                    updateWithPriorityCountries();
                    $scope.countries = this.countries;
                    return $scope.isSelectionOptional = $attrs.csRequired === void 0;
                }
            ]
        };
    });

}).call(this);
;
'use strict';

angular.module('users').directive('mediumInsert', function ($location, $timeout) {
    var IFRAMELY_API_KEY = '2d78c263b01d3413bf50d3'; // logistics@getsellr.com account

    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, iElement, iAttrs, ngModel) {
            var $mediumInsertCompatible = iElement.filter(withoutLinksInHierarchy);
            if ($mediumInsertCompatible.length == 0) return;

            var embedproxy_url = $location.protocol() + '://iframe.ly/api/oembed?iframe=1&api_key=' + IFRAMELY_API_KEY;
            iElement.not($mediumInsertCompatible).data('plugin_mediumInsert', {
                disable: $.noop
            });

            ngModel.$parsers.push(function (html) {
                var $tmp = $('<div>').html(html || '');
                $tmp.find('.medium-insert-buttons').remove();
                $tmp.find('.image.uploading').remove();
                $tmp.find('.image > img').unwrap();
                $tmp.find('.medium-insert-active').removeClass('medium-insert-active');
                return $tmp.html();
            });

            $timeout(function () {
                $mediumInsertCompatible.mediumInsert({
                    editor: ngModel.editor,
                    addons: {
                        embeds: {
                            placeholder: 'Paste a link and press Enter',
                            oembedProxy: embedproxy_url
                        }
                    }
                });
            });

            function withoutLinksInHierarchy(element) {
                var $e = $(element);
                return !$e.is('a') && $e.closest('a').length == 0 && $e.find('a').length == 0;
            }
        }
    };
});
;
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
;
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
;
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
;
angular.module('users').service('accountsService', function ($http, constants, toastr, intercomService) {
    var me = this;


    me.init = function () {
        me.selectAccountId = localStorage.getItem('accountId');
        me.accounts = [];
        me.editAccount = {};
        me.currentAccount = {};
        getAccounts();
    };

    me.init()


    function getAccounts() {
        me.accounts = [];
        console.log('selectAccountId %O', me.selectAccountId)
        $http.get(constants.API_URL + '/accounts?status=1').then(onGetAccountSuccess, onGetAccountError);
        function onGetAccountSuccess(res) {
            me.accounts = [];
            res.data.forEach(function (account) {
                if (account.preferences != "undefined") {
                    account.logo = JSON.parse(account.preferences).s3url || JSON.parse(account.preferences).logo
                }
                if (account.accountId == me.selectAccountId) {
                    me.currentAccount = account;
                    intercomService.intercomActivation();
                    console.log('setting current account %O', me.currentAccount)
                }
            });
            me.accounts = res.data;
        }

        function onGetAccountError(err) {
            toastr.error("We're experiencing some technical difficulties with our database, please check back soon")
            console.error(err)
        }
    }
    me.deleteAccount = function (account) {
        var url = constants.API_URL + '/accounts/deactivate/'+account;


        $http.put(url).then(onCreateAccountSuccess, onCreateAccountError);
        function onCreateAccountSuccess(res) {
            toastr.success('Account Deactivated!');
            console.log('accounts Service, createAccount %O', res)
            getAccounts()
        }

        function onCreateAccountError(err) {
            toastr.error('There was a problem deactivating this account');
            console.error(err)
        }
    };
    me.createAccount = function (account) {
        var url = constants.API_URL + '/accounts';
        account.status = 1;
        var payload = {
            payload: account
        };
        $http.post(url, payload).then(onCreateAccountSuccess, onCreateAccountError);
        function onCreateAccountSuccess(res) {
            toastr.success('New Account Created!');
            console.log('accounts Service, createAccount %O', res)
            getAccounts()
        }

        function onCreateAccountError(err) {
            toastr.error('There was a problem creating this account');
            console.error(err)
        }
    };

    me.updateAccount = function () {
        me.editAccount.preferences = {
            logo: me.editAccount.logo,
            style: me.editAccount.style
        };
        var payload = {
            payload: me.editAccount
        };
        console.log('about to update %O', me.editAccount);
        var url = constants.API_URL + '/accounts/' + me.editAccount.accountId;
        console.log('putting to ' + url);
        $http.put(url, payload).then(onUpdateSuccess, onUpdateError);
        function onUpdateSuccess(res) {
            console.log('updated account response %O', res)
            toastr.success('Account Updated!')
        }

        function onUpdateError(err) {
            console.error('Error updating account %O', err)
            toastr.error('There was a problem updating this account')
        }
    };

    me.generateAuthCode = function (authCode) {
        var url = constants.API_URL + '/accounts/auth';
        var payload = {
            payload: {
                accountId: me.editAccount.accountId,
                authCode: authCode
            }
        };
        console.log('authCode Payload %O', payload)
        $http.post(url, payload).then(function (res, err) {
            if (err) {
                console.error(err)
            } else {
                me.editAccount.authCode = res.data.authCode;
            }
        })
    };


    return me;
});

;
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users.supplier').factory('ImageService', [
    function () {
       var me = this;
        me.image = '';

        return me;
    }
]);
;
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function () {
    var auth = {
      user: JSON.parse(localStorage.getItem('userObject'))
    };

    return auth;
  }
]);
;
angular.module('core').service('chartService', function ($http, $q, constants) {
    var me = this;
    me.groupAndFormatDate = groupAndFormatDate;
    me.data = [
        [0],
        [0]
    ];
    me.labels = [];
    me.series = ['Sku Scans', 'Page Views'];
    me.colors = [{
        fillColor: "#B4B7B9",
        strokeColor: "#B4B7B9",
        pointColor: "#B4B7B9",
        pointStrokeColor: "#B4B7B9",
        pointHighlightFill: "#B4B7B9",
        pointHighlightStroke: "#B4B7B9"

    }, {
        fillColor: "#3299BB",
        strokeColor: "#3299BB",
        pointColor: "#3299BB",
        pointStrokeColor: "#3299BB",
        pointHighlightFill: "#3299BB",
        pointHighlightStroke: "#3299BB"

    }]



    function getChartData(accountId) {
        me.data = [
            [0],
            [0]
        ];
        me.labels = [];
        accountId = accountId || localStorage.getItem('accountId');
            //Get Analytics from API
        var defer = $q.defer();
        var results = {
            sku: [],
            page: []
        }

        $http.get(constants.API_URL + '/analytics?category=sku&account=' + accountId).then(function(res) {
            me.skuData = res.data;
            console.log('skus by account %O', res)
            results.sku = res.data.reverse();
            //Get Analytics for Page Views, Second Array
            $http.get(constants.API_URL + '/analytics?category=pageview&account=' + accountId).then(function(pageViewRes) {
                me.pageData = pageViewRes.data
                results.page = pageViewRes.data.reverse();
                defer.resolve(results)
            });
        });


        return defer.promise
    }

    function groupAndFormatDate(accountId) {
        getChartData(accountId).then(function(results) {
            results.sku.forEach(function(analytic) {
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

            results.page.forEach(function(analytic) {
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
});
;
angular.module('core').service('constants', function (envService) {
    var me = this;


    me.API_URL = envService.read('API_URL');
    me.BWS_API=envService.read('BWS_API');
    me.env=envService.read('env');
    me.ADS_URL = 'http://s3.amazonaws.com/cdn.expertoncue.com/';
    console.log('constants %O', me)

    return me;
});
;
angular.module('users').service('Countries', function () {
    var me = this;
    me.allCountries = [
        {
            code: 'AF',
            name: 'Afghanistan'
        }, {
            code: 'AL',
            name: 'Albania'
        }, {
            code: 'DZ',
            name: 'Algeria'
        }, {
            code: 'AS',
            name: 'American Samoa'
        }, {
            code: 'AD',
            name: 'Andorre'
        }, {
            code: 'AO',
            name: 'Angola'
        }, {
            code: 'AI',
            name: 'Anguilla'
        }, {
            code: 'AQ',
            name: 'Antarctica'
        }, {
            code: 'AG',
            name: 'Antigua and Barbuda'
        }, {
            code: 'AR',
            name: 'Argentina'
        }, {
            code: 'AM',
            name: 'Armenia'
        }, {
            code: 'AW',
            name: 'Aruba'
        }, {
            code: 'AU',
            name: 'Australia'
        }, {
            code: 'AT',
            name: 'Austria'
        }, {
            code: 'AZ',
            name: 'Azerbaijan'
        }, {
            code: 'BS',
            name: 'Bahamas'
        }, {
            code: 'BH',
            name: 'Bahrain'
        }, {
            code: 'BD',
            name: 'Bangladesh'
        }, {
            code: 'BB',
            name: 'Barbade'
        }, {
            code: 'BY',
            name: 'Belarus'
        }, {
            code: 'BE',
            name: 'Belgium'
        }, {
            code: 'BZ',
            name: 'Belize'
        }, {
            code: 'BJ',
            name: 'Benin'
        }, {
            code: 'BM',
            name: 'Bermuda'
        }, {
            code: 'BT',
            name: 'Bhutan'
        }, {
            code: 'BO',
            name: 'Bolivia'
        }, {
            code: 'BQ',
            name: 'Bonaire, Sint Eustatius and Saba'
        }, {
            code: 'BA',
            name: 'Bosnia and Herzegovina'
        }, {
            code: 'BW',
            name: 'Botswana'
        }, {
            code: 'BV',
            name: 'Bouvet Island'
        }, {
            code: 'BR',
            name: 'Brazil'
        }, {
            code: 'IO',
            name: 'British Indian Ocean Territory'
        }, {
            code: 'VG',
            name: 'British Virgin Islands'
        }, {
            code: 'BN',
            name: 'Brunei'
        }, {
            code: 'BG',
            name: 'Bulgaria'
        }, {
            code: 'BF',
            name: 'Burkina Faso'
        }, {
            code: 'BI',
            name: 'Burundi'
        }, {
            code: 'KH',
            name: 'Cambodia'
        }, {
            code: 'CM',
            name: 'Cameroon'
        }, {
            code: 'CA',
            name: 'Canada'
        }, {
            code: 'CV',
            name: 'Cape Verde'
        }, {
            code: 'KY',
            name: 'Cayman Islands'
        }, {
            code: 'CF',
            name: 'Central African Republic'
        }, {
            code: 'TD',
            name: 'Chad'
        }, {
            code: 'CL',
            name: 'Chile'
        }, {
            code: 'CN',
            name: 'China'
        }, {
            code: 'CX',
            name: 'Christmas Island'
        }, {
            code: 'CC',
            name: 'Cocos (Keeling) Islands'
        }, {
            code: 'CO',
            name: 'Colombia'
        }, {
            code: 'KM',
            name: 'Comoros'
        }, {
            code: 'CG',
            name: 'Congo'
        }, {
            code: 'CD',
            name: 'Congo (Dem. Rep.)'
        }, {
            code: 'CK',
            name: 'Cook Islands'
        }, {
            code: 'CR',
            name: 'Costa Rica'
        }, {
            code: 'ME',
            name: 'Crna Gora'
        }, {
            code: 'HR',
            name: 'Croatia'
        }, {
            code: 'CU',
            name: 'Cuba'
        }, {
            code: 'CW',
            name: 'Curaçao'
        }, {
            code: 'CY',
            name: 'Cyprus'
        }, {
            code: 'CZ',
            name: 'Czech Republic'
        }, {
            code: 'CI',
            name: "Côte D'Ivoire"
        }, {
            code: 'DK',
            name: 'Denmark'
        }, {
            code: 'DJ',
            name: 'Djibouti'
        }, {
            code: 'DM',
            name: 'Dominica'
        }, {
            code: 'DO',
            name: 'Dominican Republic'
        }, {
            code: 'TL',
            name: 'East Timor'
        }, {
            code: 'EC',
            name: 'Ecuador'
        }, {
            code: 'EG',
            name: 'Egypt'
        }, {
            code: 'SV',
            name: 'El Salvador'
        }, {
            code: 'GQ',
            name: 'Equatorial Guinea'
        }, {
            code: 'ER',
            name: 'Eritrea'
        }, {
            code: 'EE',
            name: 'Estonia'
        }, {
            code: 'ET',
            name: 'Ethiopia'
        }, {
            code: 'FK',
            name: 'Falkland Islands'
        }, {
            code: 'FO',
            name: 'Faroe Islands'
        }, {
            code: 'FJ',
            name: 'Fiji'
        }, {
            code: 'FI',
            name: 'Finland'
        }, {
            code: 'FR',
            name: 'France'
        }, {
            code: 'GF',
            name: 'French Guiana'
        }, {
            code: 'PF',
            name: 'French Polynesia'
        }, {
            code: 'TF',
            name: 'French Southern Territories'
        }, {
            code: 'GA',
            name: 'Gabon'
        }, {
            code: 'GM',
            name: 'Gambia'
        }, {
            code: 'GE',
            name: 'Georgia'
        }, {
            code: 'DE',
            name: 'Germany'
        }, {
            code: 'GH',
            name: 'Ghana'
        }, {
            code: 'GI',
            name: 'Gibraltar'
        }, {
            code: 'GR',
            name: 'Greece'
        }, {
            code: 'GL',
            name: 'Greenland'
        }, {
            code: 'GD',
            name: 'Grenada'
        }, {
            code: 'GP',
            name: 'Guadeloupe'
        }, {
            code: 'GU',
            name: 'Guam'
        }, {
            code: 'GT',
            name: 'Guatemala'
        }, {
            code: 'GG',
            name: 'Guernsey and Alderney'
        }, {
            code: 'GN',
            name: 'Guinea'
        }, {
            code: 'GW',
            name: 'Guinea-Bissau'
        }, {
            code: 'GY',
            name: 'Guyana'
        }, {
            code: 'HT',
            name: 'Haiti'
        }, {
            code: 'HM',
            name: 'Heard and McDonald Islands'
        }, {
            code: 'HN',
            name: 'Honduras'
        }, {
            code: 'HK',
            name: 'Hong Kong'
        }, {
            code: 'HU',
            name: 'Hungary'
        }, {
            code: 'IS',
            name: 'Iceland'
        }, {
            code: 'IN',
            name: 'India'
        }, {
            code: 'ID',
            name: 'Indonesia'
        }, {
            code: 'IR',
            name: 'Iran'
        }, {
            code: 'IQ',
            name: 'Iraq'
        }, {
            code: 'IE',
            name: 'Ireland'
        }, {
            code: 'IM',
            name: 'Isle of Man'
        }, {
            code: 'IL',
            name: 'Israel'
        }, {
            code: 'IT',
            name: 'Italy'
        }, {
            code: 'JM',
            name: 'Jamaica'
        }, {
            code: 'JP',
            name: 'Japan'
        }, {
            code: 'JE',
            name: 'Jersey'
        }, {
            code: 'JO',
            name: 'Jordan'
        }, {
            code: 'KZ',
            name: 'Kazakhstan'
        }, {
            code: 'KE',
            name: 'Kenya'
        }, {
            code: 'KI',
            name: 'Kiribati'
        }, {
            code: 'KP',
            name: 'Korea (North)'
        }, {
            code: 'KR',
            name: 'Korea (South)'
        }, {
            code: 'KW',
            name: 'Kuwait'
        }, {
            code: 'KG',
            name: 'Kyrgyzstan'
        }, {
            code: 'LA',
            name: 'Laos'
        }, {
            code: 'LV',
            name: 'Latvia'
        }, {
            code: 'LB',
            name: 'Lebanon'
        }, {
            code: 'LS',
            name: 'Lesotho'
        }, {
            code: 'LR',
            name: 'Liberia'
        }, {
            code: 'LY',
            name: 'Libya'
        }, {
            code: 'LI',
            name: 'Liechtenstein'
        }, {
            code: 'LT',
            name: 'Lithuania'
        }, {
            code: 'LU',
            name: 'Luxembourg'
        }, {
            code: 'MO',
            name: 'Macao'
        }, {
            code: 'MK',
            name: 'Macedonia'
        }, {
            code: 'MG',
            name: 'Madagascar'
        }, {
            code: 'MW',
            name: 'Malawi'
        }, {
            code: 'MY',
            name: 'Malaysia'
        }, {
            code: 'MV',
            name: 'Maldives'
        }, {
            code: 'ML',
            name: 'Mali'
        }, {
            code: 'MT',
            name: 'Malta'
        }, {
            code: 'MH',
            name: 'Marshall Islands'
        }, {
            code: 'MQ',
            name: 'Martinique'
        }, {
            code: 'MR',
            name: 'Mauritania'
        }, {
            code: 'MU',
            name: 'Mauritius'
        }, {
            code: 'YT',
            name: 'Mayotte'
        }, {
            code: 'MX',
            name: 'Mexico'
        }, {
            code: 'FM',
            name: 'Micronesia'
        }, {
            code: 'MD',
            name: 'Moldova'
        }, {
            code: 'MC',
            name: 'Monaco'
        }, {
            code: 'MN',
            name: 'Mongolia'
        }, {
            code: 'MS',
            name: 'Montserrat'
        }, {
            code: 'MA',
            name: 'Morocco'
        }, {
            code: 'MZ',
            name: 'Mozambique'
        }, {
            code: 'MM',
            name: 'Myanmar'
        }, {
            code: 'NA',
            name: 'Namibia'
        }, {
            code: 'NR',
            name: 'Nauru'
        }, {
            code: 'NP',
            name: 'Nepal'
        }, {
            code: 'NL',
            name: 'Netherlands'
        }, {
            code: 'AN',
            name: 'Netherlands Antilles'
        }, {
            code: 'NC',
            name: 'New Caledonia'
        }, {
            code: 'NZ',
            name: 'New Zealand'
        }, {
            code: 'NI',
            name: 'Nicaragua'
        }, {
            code: 'NE',
            name: 'Niger'
        }, {
            code: 'NG',
            name: 'Nigeria'
        }, {
            code: 'NU',
            name: 'Niue'
        }, {
            code: 'NF',
            name: 'Norfolk Island'
        }, {
            code: 'MP',
            name: 'Northern Mariana Islands'
        }, {
            code: 'NO',
            name: 'Norway'
        }, {
            code: 'OM',
            name: 'Oman'
        }, {
            code: 'PK',
            name: 'Pakistan'
        }, {
            code: 'PW',
            name: 'Palau'
        }, {
            code: 'PS',
            name: 'Palestine'
        }, {
            code: 'PA',
            name: 'Panama'
        }, {
            code: 'PG',
            name: 'Papua New Guinea'
        }, {
            code: 'PY',
            name: 'Paraguay'
        }, {
            code: 'PE',
            name: 'Peru'
        }, {
            code: 'PH',
            name: 'Philippines'
        }, {
            code: 'PN',
            name: 'Pitcairn'
        }, {
            code: 'PL',
            name: 'Poland'
        }, {
            code: 'PT',
            name: 'Portugal'
        }, {
            code: 'PR',
            name: 'Puerto Rico'
        }, {
            code: 'QA',
            name: 'Qatar'
        }, {
            code: 'RO',
            name: 'Romania'
        }, {
            code: 'RU',
            name: 'Russia'
        }, {
            code: 'RW',
            name: 'Rwanda'
        }, {
            code: 'RE',
            name: 'Réunion'
        }, {
            code: 'BL',
            name: 'Saint Barthélemy'
        }, {
            code: 'SH',
            name: 'Saint Helena'
        }, {
            code: 'KN',
            name: 'Saint Kitts and Nevis'
        }, {
            code: 'LC',
            name: 'Saint Lucia'
        }, {
            code: 'MF',
            name: 'Saint Martin'
        }, {
            code: 'PM',
            name: 'Saint Pierre and Miquelon'
        }, {
            code: 'VC',
            name: 'Saint Vincent and the Grenadines'
        }, {
            code: 'WS',
            name: 'Samoa'
        }, {
            code: 'SM',
            name: 'San Marino'
        }, {
            code: 'SA',
            name: 'Saudi Arabia'
        }, {
            code: 'SN',
            name: 'Senegal'
        }, {
            code: 'RS',
            name: 'Serbia'
        }, {
            code: 'SC',
            name: 'Seychelles'
        }, {
            code: 'SL',
            name: 'Sierra Leone'
        }, {
            code: 'SG',
            name: 'Singapore'
        }, {
            code: 'SX',
            name: 'Sint Maarten'
        }, {
            code: 'SK',
            name: 'Slovakia'
        }, {
            code: 'SI',
            name: 'Slovenia'
        }, {
            code: 'SB',
            name: 'Solomon Islands'
        }, {
            code: 'SO',
            name: 'Somalia'
        }, {
            code: 'ZA',
            name: 'South Africa'
        }, {
            code: 'GS',
            name: 'South Georgia and the South Sandwich Islands'
        }, {
            code: 'SS',
            name: 'South Sudan'
        }, {
            code: 'ES',
            name: 'Spain'
        }, {
            code: 'LK',
            name: 'Sri Lanka'
        }, {
            code: 'SD',
            name: 'Sudan'
        }, {
            code: 'SR',
            name: 'Suriname'
        }, {
            code: 'SJ',
            name: 'Svalbard and Jan Mayen'
        }, {
            code: 'SZ',
            name: 'Swaziland'
        }, {
            code: 'SE',
            name: 'Sweden'
        }, {
            code: 'CH',
            name: 'Switzerland'
        }, {
            code: 'SY',
            name: 'Syria'
        }, {
            code: 'ST',
            name: 'São Tomé and Príncipe'
        }, {
            code: 'TW',
            name: 'Taiwan'
        }, {
            code: 'TJ',
            name: 'Tajikistan'
        }, {
            code: 'TZ',
            name: 'Tanzania'
        }, {
            code: 'TH',
            name: 'Thailand'
        }, {
            code: 'TG',
            name: 'Togo'
        }, {
            code: 'TK',
            name: 'Tokelau'
        }, {
            code: 'TO',
            name: 'Tonga'
        }, {
            code: 'TT',
            name: 'Trinidad and Tobago'
        }, {
            code: 'TN',
            name: 'Tunisia'
        }, {
            code: 'TR',
            name: 'Turkey'
        }, {
            code: 'TM',
            name: 'Turkmenistan'
        }, {
            code: 'TC',
            name: 'Turks and Caicos Islands'
        }, {
            code: 'TV',
            name: 'Tuvalu'
        }, {
            code: 'UG',
            name: 'Uganda'
        }, {
            code: 'UA',
            name: 'Ukraine'
        }, {
            code: 'AE',
            name: 'United Arab Emirates'
        }, {
            code: 'GB',
            name: 'United Kingdom'
        }, {
            code: 'UM',
            name: 'United States Minor Outlying Islands'
        }, {
            code: 'US',
            name: 'United States'
        }, {
            code: 'UY',
            name: 'Uruguay'
        }, {
            code: 'UZ',
            name: 'Uzbekistan'
        }, {
            code: 'VU',
            name: 'Vanuatu'
        }, {
            code: 'VA',
            name: 'Vatican City'
        }, {
            code: 'VE',
            name: 'Venezuela'
        }, {
            code: 'VN',
            name: 'Vietnam'
        }, {
            code: 'VI',
            name: 'Virgin Islands of the United States'
        }, {
            code: 'WF',
            name: 'Wallis and Futuna'
        }, {
            code: 'EH',
            name: 'Western Sahara'
        }, {
            code: 'YE',
            name: 'Yemen'
        }, {
            code: 'ZM',
            name: 'Zambia'
        }, {
            code: 'ZW',
            name: 'Zimbabwe'
        }, {
            code: 'AX',
            name: 'Åland Islands'
        }
    ];

    return me;
});
;
angular.module('users').service('CurrentUserService', ['Admin', '$state',
    function (Admin, $state) {
        var me = this;
        me.user = '';
        me.locations = '';
        me.currentUserRoles=[];
        me.userBeingEdited = {};
        me.myPermissions = localStorage.getItem('roles');
        Admin.query().then(function (data,err) {
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
;
angular.module('users').service('intercomService', function ($http, constants, toastr, Authentication, $q) {
    var me = this;


    me.intercomActivation = function () {
        console.log('intercom service called!')
        window.Intercom('boot', {
            app_id: 'ugnow3fn',
            name: Authentication.user.displayName,
            email: Authentication.user.email,
            created_at: Authentication.user.created,
            widget: {
                activator: '#IntercomDefaultWidget'
            }
        });
    };





    return me;
});

;
angular.module('users').service('locationsService', function ($http, constants, toastr, $q) {
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
        console.log('location service location object %O', location)
        var url = constants.API_URL + '/locations';
        location.accountId = localStorage.getItem('accountId');
        location.defaultLoc = 0;
        var payload = {
            payload: location
        };
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
        $http.put(url, payload).then(onUpdateLocationSuccess, onUpdateLocationFail,  getLocations)

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
        if (res.status == 200) {
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
});
;
'use strict';

(function() {
    var _createLink = MediumEditor.util.createLink;
    MediumEditor.util.createLink = function (document, textNodes, href, target) {
        var anchor = _createLink.apply(this, arguments);
        anchor.setAttribute('href', '#');
        anchor.setAttribute('onclick', "window.open('" + url(href) + "', '_system', 'location=yes'); return false;");
        return anchor;
    };

    var _createLinkPro = MediumEditor.prototype.createLink;
    MediumEditor.prototype.createLink = function (opts) {
        var result = _createLinkPro.apply(this, arguments);
        var $sel = $(MediumEditor.selection.getSelectedElements(document));
        var $a = $sel.is('a') ? $sel : $sel.find('a');
        if ($a.length) {
            var href = url($a.attr('href'));
            $a.attr('onclick', "window.open('" + href + "', '_system', 'location=yes'); return false;");
            $a.attr('href', '#');
            this.events.enableCustomEvent('editableInput');
        }
        return result;
    };

    function url(addr) {
        if (typeof addr != 'string') return addr;
        if (!addr.trim().match(/^(http|#|\/)/)) addr = 'http://' + addr;
        return addr;
    }
})();
;
'use strict';

angular.module('users').factory('MediumS3ImageUploader', ['$window', 'uploadService', 'toastr', function($window, uploadService, toastr) {
    var isContentEmpty = function(element) {
        var $element = $(element);
        return $element.length == 0 || $element.text().trim() == '' && $element.find('img').length == 0;
    };

    var handleGlobalDragAndDrop = function(callback) {
        window.addEventListener('dragover', function(e) {
            e = e || event;
            e.preventDefault();
        }, false);

        window.addEventListener('drop', function(e) {
            e = e || event;
            e.preventDefault();
            var handled = (callback || $.noop)(event);
            if (handled) e.stopPropagation();
        }, false);
    };

    return $window.MediumEditor.Extension.extend({
        name: 'image-dropping-to-s3',
        init: function() {
            this.subscribe('editableDrag', this.handleDrag.bind(this));
            this.subscribe('editableDrop', this.handleDrop.bind(this));

            handleGlobalDragAndDrop((function(event) {
                var editor = $(this.base.getFocusedElement()).closest('.editable');
                if (editor.length) {
                    this.handleDrop(event, editor);
                    return true;
                }
            }).bind(this));

            var self = this;
            var pluginName = 'mediumInsert';
            var oldImagesFn = $.fn[pluginName + 'Images'];

            $.fn[pluginName + 'Images'] = function(options) {
                oldImagesFn.apply(this, arguments);
                return this.each(function() {
                    var plugin = $(this).data('plugin_' + pluginName + 'Images');
                    return plugin.uploadAdd = function(e, data) {
                        return self.upload(data.files);
                    };
                });
            };
        },
        handleDrag: function(event) {
            var className = 'medium-editor-dragover';
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
            if (event.type == 'dragover') {
                event.target.classList.add(className);
                this.base.selectElement(event.target);
            } else if (event.type == 'dragleave') {
                event.target.classList.remove(className);
            }
        },
        handleDrop: function(event, editor) {
            var className = 'medium-editor-dragover';
            event.preventDefault();
            event.stopPropagation();
            event.target.classList.remove(className);
            $(editor).find('.medium-editor-dragover').removeClass('medium-editor-dragover');
            this.upload(event.dataTransfer.files);
            event.target.classList.remove(className);
        },
        upload: function(files) {
            if (!files) return;
            files = Array.prototype.slice.call(files, 0);

            return files.some(function(file) {
                if (!file.type.match('image')) return;

                var id = 'medium-img-' + +(new Date);
                var fileReader = new FileReader();
                fileReader.readAsDataURL(file);

                var focused = this.base.getFocusedElement();
                if (focused && !isContentEmpty(focused)) {
                    var selection = this.base.exportSelection();
                    selection.start = selection.end;
                    this.base.importSelection(selection);
                }

                $(this.base.elements).data('plugin_mediumInsert').hideButtons();
                this.base.pasteHTML('<img class="medium-image-loading" id="' + id + '">');
                $('#' + id).wrap('<span class="image">');

                return fileReader.onload = function() {
                    var img = this.base.options.ownerDocument.getElementById(id);
                    if (!img) return;

                    img.removeAttribute('id');
                    img.removeAttribute('class');
                    img.src = fileReader.result;

                    var $image = $(img).closest('.image').addClass('uploading');
                    var $progress = $('<span>').addClass('progress').text('Uploading... 0%').appendTo($image);

                    var mediaConfig = {
                        mediaRoute: 'media',
                        folder: 'editor',
                        fileType: 'IMAGE',
                        type: 'SUPPLIER',
                        accountId: localStorage.getItem('accountId')
                    };
                    //log('product config %0', mediaConfig)
                    return uploadService.upload(file, mediaConfig).then(function (response, err) {
                        var url = response[0].publicUrl;
                        img.src = url;
                        $(img).trigger('change');
                        return url;
                    }, function(err) {
                        $image.remove();
                        console.error(err);
                        toastr.error('Failed to upload image');
                    }, function(progress) {
                        $progress.text('Uploading... ' + progress + '%');
                        $(img).trigger('change');
                    }).finally(function() {
                        $image.removeClass('uploading');
                        $progress.remove();
                        this.base.trigger('editableInput', null, this.base.elements[0]);
                    }.bind(this));
                }.bind(this);
            }.bind(this));
        }
    });
}]);
;
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
;
'use strict';
angular.module('users').service('productEditorService', function ($http, $location, constants, Authentication, $stateParams, $q, toastr, $rootScope, uploadService, $timeout) {
    var me = this;
    var debugLogs = false;
    var log = function (title, data) {
        if (debugLogs) {
            title += '%O';
            console.log(title, data);
        }
    };
    var cachedProduct;
    me.changes = [];
    if (localStorage.getItem('userId')) {
        me.userId = localStorage.getItem('userId');
    }
    me.show = {
        loading: true
    };
    if (localStorage.getItem('edit-account')) {
        me.currentAccount = localStorage.getItem('edit-account');
    } else {
        me.currentAccount = '';
    }


    me.init = function () {
        me.productTypes = [ { name: 'wine', productTypeId: 1 }, { name: 'beer', productTypeId: 2 }, { name: 'spirits', productTypeId: 3 } ];
        me.productStatuses = [
            { name: 'Available', value: 'new' },
            { name: 'In Progress', value: 'inprogress' },
            { name: 'Done', value: 'done' },
            { name: 'Approved', value: 'approved' }
        ];


        me.productStorage = {}
        me.productStats = {};
        me.productList = [];
        me.myProducts = [];
        me.currentProduct = {};
        me.currentType = {};
        me.currentStatus = {};
        //initialize with new products so list isnt empty

        me.getStats();
        me.show.loading = false;
    };

    //send in type,status and receive all products
    me.getProductList = function (options) {
        me.productList = [];
        me.show.loading = true;
        //time('getProductList');
        if (!options.type || !options.status) {
            options = {
                type: me.currentType.productTypeId,
                status: me.currentStatus.value
            };
        }
        var url = constants.BWS_API + '/edit?status=' + options.status.value + '&type=' + options.type.productTypeId;
        $http.get(url).then(getAvailProdSuccess, getAvailProdError);

        function getAvailProdSuccess(response) {
            if (response.status === 200) {
                //timeEnd('getProductList');
                me.show.loading = false;
                log('getProdList ', response.data);
                me.getStats();
                response.data = response.data.map(function (product) {
                    if (product.lastEdit) {
                        if (constants.env === 'local') {
                            product.lastEdit = moment(product.lastEdit).subtract(4, 'hours').fromNow();
                            log('lastEdit', product.lastEdit)
                        } else {
                            product.lastEdit = moment(product.lastEdit).fromNow()
                        }
                    }
                    return product
                });

                //sort with myProducts at the top
                me.productList = _.sortBy(response.data, function (p) {
                    return Math.abs(p.userId - me.userId);
                });
                log('getProductList end', me.currentAccount)


            }
        }

        function getAvailProdError(error) {
            //error('getAvailProdError %O', error)
        }
    };

    me.updateProductList = function () {
        me.getProductList({ type: me.currentType, status: me.currentStatus })
        window.scrollTo(0, 0);
    };

    //send in type,status,userid, get back list of products
    me.getMyProducts = function (options) {
        options = options | {};
        if (!options.type || !options.status || !options.userId) {
            options = {
                type: me.currentType.productTypeId,
                status: me.currentStatus.value,
                userId: me.userId
            };
        }
        var url = constants.BWS_API + '/edit?status=' + options.status + '&type=' + options.type + '&user=' + options.userId;
        $http.get(url).then(getMyProdSuccess, getMyProdError);

        function getMyProdSuccess(response) {
            if (response.status === 200) {
                me.productList = response.data
            }
        }

        function getMyProdError(error) {
            //error('getMyProdError %O', error)
        }
    };


    //calls get detail from API and caches product
    me.setCurrentProduct = function (product) {
        me.currentProduct = {};
        cachedProduct = {};
        me.changes = [];

        if (!product.productId) {
            //error('setCurrentProduct: please provide productId')
            return
        }
        if (me.productStorage[ product.productId ]) {
            //use cached product if exists
            me.currentProduct = me.productStorage[ product.productId ];
            cachedProduct = jQuery.extend(true, {}, me.productStorage[ product.productId ]);

        } else {
            //get from api and format
            me.getProductDetail(product).then(function (res) {
                if (res.data.length > 0) {
                    me.formatProductDetail(res.data[ 0 ]).then(function (formattedProduct) {
                        var p = formattedProduct;
                        log('formattedProduct', formattedProduct);
                        me.currentProduct = formattedProduct;

                        //cache current product for comparison
                        cachedProduct = jQuery.extend(true, {}, formattedProduct);

                        //store product for faster load next time
                        me.productStorage[ product.productId ] = formattedProduct

                    })
                } else {
                    toastr.error('Could not get product detail for ' + product.name)
                }
            }, function (error) {
                //error(error)
                toastr.error('Could not get product detail for ' + product.name)
            });
        }
    };


    //abstracts away remote call for detail
    me.getProductDetail = function (product) {
        return $http.get(constants.BWS_API + '/edit/products/' + product.productId)
    }


    //claim a product
    me.claim = function (options) {
        //options should have userId and productId
        if (!options.productId || !options.userId) {
            //error('could not claim, wrong options')
        }
        if (options.status != 'done') {
            options.status = 'inprogress';
        }
        var payload = {
            "payload": options
        };
        log('claiming', payload);
        var url = constants.BWS_API + '/edit/claim';
        $http.post(url, payload).then(function (res) {
            toastr.info('You claimed product ' + options.productId);
            //socket.emit('product-claimed', options);
            me.getStats();
            log('claim response', res)
        })
    };

    //remove a claim on a product
    me.removeClaim = function (options) {
        //options should have userId and productId
        if (!options.productId || !options.userId) {
            //error('could not claim, wrong options')
        }
        options.status = 'new';
        var payload = {
            "payload": options
        };
        log('removing claim', payload);
        var url = constants.BWS_API + '/edit/claim';
        $http.put(url, payload).then(function (res) {
            log('claim response', res);
            //socket.emit('product-unclaimed', options);
            me.currentProduct = {};
        }, function (err) {
            log('deleteClaim error', err);
            toastr.error('There was an error claiming this product.')
        })
    };

    me.save = function (product) {
        var defer = $q.defer();
        if (!product.productId) {
            return
        }
        product.userId = me.userId;
        if (!product.userId) {
            if (localStorage.getItem('userId')) {
                me.userId = localStorage.getItem('userId');
                product.userId = me.userId;
            }
        }
        if (!product.userId) {
            toastr.error('There was a problem saving this product. Please sign out and sign in again.')
            return
        }
        var payload = {
            payload: compareToCachedProduct(product)
        };
        var url = constants.BWS_API + '/edit/products/' + product.productId;
        $http.put(url, payload).then(onSaveSuccess, onSaveError);
        function onSaveSuccess(response) {
            window.scrollTo(0, 0);
            //socket.emit('product-saved');
            me.productStorage[ product.productId ] = product;
            toastr.success('Product Updated!')
            defer.resolve()
        }

        function onSaveError(error) {
            console.error('onSaveError %O', error);
            toastr.error('There was a problem updating product ' + product.productId);
            defer.reject()
        }

        return defer.promise
    };


    me.getStats = function () {
        var account = me.currentAccount;

        var url = constants.BWS_API + '/edit/count';
        if (account) {
            url += '?requested_by=' + account
        }
        $http.get(url).then(onGetStatSuccess, onGetStatError);
        function onGetStatSuccess(response) {
            //log('onGetStatSuccess %O', response);
            me.productStats = response.data
            me.currentAccount = account;
        }

        function onGetStatError(error) {
            //log('onGetStatError %O', error)
            me.productStats = {}
        }
    };

    me.formatProductDetail = function (product) {
        var defer = $q.defer()
        console.log(product)
        product.name = product.title || product.displayName || product.name;
        product.notes = product.notes || product.text;
        product.properties.forEach(function (prop) {
            switch (prop.label) {
                case 'Requested By':
                    product.requestedBy = prop.value;
                    break;
                case 'Country':
                    prop.type = 'countryselect';
                    break;
                case 'Script':
                    prop.type = 'textarea';
                    break;
                case 'Description':
                    prop.type = 'textarea';
                    break;
                case 'foodpairing':
                    prop.type = 'textarea';
                    break;
                default:
                    prop.type = 'input';
                    break;
            }
        });
        product.mediaAssets.forEach(function (m) {
            console.log(m.type)
            switch (m.type) {
                case 'AUDIO':
                    product.description = product.description || m.script;
                    if (m.publicUrl) {
                        if (m.publicUrl.length > 1) {
                            product.audio = document.createElement('AUDIO');
                            product.audio.src = m.publicUrl;
                            product.audio.mediaAssetId = m.mediaAssetId;
                            product.audio.ontimeupdate = function setProgress() {
                                product.audio.progress = Number(product.audio.currentTime / product.audio.duration);
                            };
                        }
                    }
                    break;
                case 'IMAGE':
                    product.hasImages = true;
                    product.images = product.images || [];
                    product.images.mediaAssetId = m.mediaAssetId;
                    product.images.push(m);
                    break;
                case 'RESEARCH_IMG':
                    product.hasRearchImg = true;
                    product.researchImages = product.researchImages || [];
                    product.researchImages.mediaAssetId = m.mediaAssetId;
                    product.researchImages.push(m);
                    break;
            }
        });
        if (product.description && !product.description.match(/[<>]/)) {
            product.description = '<p>' + product.description + '</p>';
        }
        defer.resolve(product);

        return defer.promise;
    };

    me.uploadMedia = function (files) {
        var mediaConfig = {
            mediaRoute: 'media',
            folder: 'products',
            type: 'PRODUCT',
            fileType: 'IMAGE',
            accountId: localStorage.getItem('accountId'),
            productId: me.currentProduct.productId
        }
        //log('product config %0', mediaConfig)
        uploadService.upload(files[ 0 ], mediaConfig).then(function (response, err) {
            if (response) {
                toastr.success('Product Image Updated!');
                me.save(me.currentProduct).then(function (err, response) {
                    refreshProduct(me.currentProduct);
                })
            }
            else {
                toastr.error('Product Image Failed To Update!');
            }
        })

    };

    me.uploadAudio = function (files) {
        var mediaConfig = {
            mediaRoute: 'media',
            folder: 'products',
            type: 'PRODUCT',
            fileType: 'AUDIO',
            accountId: localStorage.getItem('accountId'),
            productId: me.currentProduct.productId
        }
        //log('product config %0', files)
        uploadService.upload(files[ 0 ], mediaConfig).then(function (response, err) {
            if (response) {
                toastr.success('Product Audio Updated!');

                me.save(me.currentProduct).then(function (err, response) {
                    refreshProduct(me.currentProduct);
                })

            }
            else {
                toastr.error('Product Audio Failed To Update!');
            }
        })

    };
    me.removeAudio = function (currentAudio) {
        //log('delete audio %O', currentAudio)
        var url = constants.API_URL + '/media/' + currentAudio;
        $http.delete(url).then(function () {
            toastr.success('audio removed', 'Success');

            me.save(me.currentProduct).then(function (err, response) {
                refreshProduct(me.currentProduct);
            })
        })
    };
    me.removeImage = function (currentImage) {
        //log('delete image %O', currentImage)
        var url = constants.API_URL + '/media/' + currentImage.mediaAssetId;
        $http.delete(url).then(function () {
            toastr.success('image removed', 'Success');
            me.save(me.currentProduct).then(function (err, response) {
                refreshProduct(me.currentProduct);
            })
        })

    };
    function compareToCachedProduct(prod) {
        log('updatedProd', prod);
        log('cachedProd', cachedProduct);
        me.changes = [];
        if (prod.title !== cachedProduct.title) {
            me.changes.push('Changed title to ' + prod.title)
        }

        for (var i = 0; i < prod.properties.length; i++) {
            var updated = prod.properties[ i ];
            var cached = cachedProduct.properties[ i ];

            if (updated.value !== cached.value) {
                if (!cached.valueId) {
                    updated.changed = 'new';
                    me.changes.push('Added ' + updated.label + ' as ' + updated.value)
                } else {
                    updated.changed = 'update';
                    me.changes.push('Updated ' + updated.label + '. Changed ' + '"' + cached.value + '"' + ' to ' + '"' + updated.value + '"')
                }
            } else {
                updated.changed = 'false';
            }
        }
        log('changes added', prod);
        return (prod)
    }

    function refreshProduct(product) {
        me.getProductDetail(product).then(function (res) {
            if (res.data.length > 0) {
                me.formatProductDetail(res.data[ 0 ]).then(function (formattedProduct) {
                    var p = formattedProduct;
                    log('formattedProduct', formattedProduct);
                    me.currentProduct = formattedProduct;

                    //cache current product for comparison
                    cachedProduct = jQuery.extend(true, {}, formattedProduct);

                    //store product for faster load next time
                    me.productStorage[ product.productId ] = formattedProduct

                })
            } else {
                toastr.error('Could not get product detail for ' + product.name)
            }
        })
    }


    me.init();


    return me;
});
;
angular.module("users.supplier").filter("trustUrl", [ '$sce', function ($sce) {
    return function (recordingUrl) {
        return $sce.trustAsResourceUrl(recordingUrl);
    };
} ]);
;
angular.module('users').service('uploadService', function ($http, constants, toastr, Authentication, $q) {
    var me = this;


    me.init = function () {
        me.selectAccountId = localStorage.getItem('accountId');
        me.accounts = [];
        me.editAccount = {};
        me.currentAccount = {};
        me.files = [];
        me.determinate = {value: 0};

    };

    me.init()


    me.upload = function (file, mediaConfig) {

        var messages = [];
        var defer = $q.defer();
        var config = mediaConfig;
        if (file) {
            var filename = (file.name).replace(/ /g, "_");

            if (!file.$error) {

                var newObject;
                if (config.mediaRoute == 'media') {
                    if (config.type == 'PRODUCT') {
                        newObject = {
                            payload: {
                                fileName: filename,
                                userName: Authentication.user.username,
                                type: config.type,
                                fileType: config.fileType,
                                accountId: config.accountId,
                                productId: config.productId
                            }
                        };
                    }
                    else {
                        newObject = {
                            payload: {
                                type: config.type,
                                fileType: config.type,
                                fileName: filename,
                                userName: Authentication.user.username,
                                accountId: config.accountId
                            }
                        };
                    }
                }
                else {
                    newObject = {
                        payload: {
                            fileName: filename,
                            userName: Authentication.user.username,
                            accountId: config.accountId
                        }
                    };
                }


                $http.post(constants.API_URL + '/' + config.mediaRoute, newObject).then(function (response, err) {
                    if (err) {
                        console.log(err);
                        toastr.error('There was a problem uploading your ad.')


                    }
                    if (response) {
                        var mediaAssetId = response.data.assetId;
                        var creds = {
                            bucket: 'cdn.expertoncue.com/' + config.folder,
                            access_key: 'AKIAICAP7UIWM4XZWVBA',
                            secret_key: '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'
                        };
                        // Configure The S3 Object

                        var params = {
                            Key: response.data.assetId + "-" + filename,
                            ContentType: file.type,
                            Body: file,
                            ServerSideEncryption: 'AES256',
                            Metadata: {
                                fileKey: JSON.stringify(response.data.assetId)
                            }
                        };
                        console.dir(creds, params)
                        bucketUpload(creds, params).then(function (err, res) {
                            self.determinateValue = 0;
                            var updateMedia = {
                                payload: {
                                    mediaAssetId: mediaAssetId,
                                    publicUrl: 'https://s3.amazonaws.com/' + creds.bucket + '/' + response.data.assetId + "-" + filename
                                }
                            };

                            $http.put(constants.API_URL + '/media', updateMedia).then(function (res2, err) {
                                if (err) {
                                    console.log(err)
                                }
                                else {
                                    var message = {
                                        message: 'New Ad Uploaded Success!',
                                        publicUrl: updateMedia.payload.publicUrl,
                                        fileName: filename,
                                        mediaAssetId:updateMedia.payload.mediaAssetId
                                    };
                                    messages.push(message);
                                    defer.resolve(messages)
                                }
                            })
                        }, null, defer.notify)
                    }
                })
            }
        }

        return defer.promise
    };

    function bucketUpload(creds, params) {
        var defer = $q.defer();
        AWS.config.update({
            accessKeyId: creds.access_key,
            secretAccessKey: creds.secret_key
        });
        AWS.config.region = 'us-east-1';
        var bucket = new AWS.S3({
            params: {
                Bucket: creds.bucket
            }
        });

        var request = bucket.putObject(params, function (err, data) {
            me.loading = true;
            if (err) {
                // There Was An Error With Your S3 Config
                alert(err.message);
                toastr.error('There was a problem uploading your ad.');
                defer.reject(false)
            } else {
                defer.resolve(data)
            }
        });

        request.on('httpUploadProgress', function (progress) {
            defer.notify(Math.round(progress.loaded / progress.total * 100));
        });

        return defer.promise;
    }

    return me;
});

;
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
angular.module('users.admin').factory('Admin', ['$http', 'constants', '$q',
  function ($http, constants, $q) {
    var me = this;

    me.get = function(userId){
      var defer = $q.defer();
      $http.get(constants.API_URL + '/users/'+userId.userId).then(function(response, err){
        $http.get(constants.API_URL + '/users/roles/'+userId.userId).then(function(res, err){
          console.log(res)
          console.log(response)
          response.data[0].roles = [];
              res.data.forEach(function(role){
                response.data[0].roles.push(role['roleId'])
                response.data[0].accountId = role['accountId']
              });
              defer.resolve(response.data[0]);
        })
      })
      return defer.promise;
    };
    me.query = function(){
      var defer = $q.defer();
      $http.get(constants.API_URL + '/users').then(function(response,err){
        if(err)
          defer.reject(err);
        defer.resolve(response.data);
      })
      return defer.promise;
    };

    me.put = function(userId){
      return $http.put(constants.API_URL + '/users'+userId)
    }

    return me;
  }
]);


