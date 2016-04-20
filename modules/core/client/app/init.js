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
      development: ['dashdev.expertoncue.com'],
      staging: ['dashqa.expertoncue.com'],
      production: ['dashboard.expertoncue.com']
    },
    vars: {
      local: {
        API_URL: 'http://localhost:7272'
      },
      development: {
        API_URL: 'https://apidev.expertoncue.com'
      },
      staging: {
        API_URL: 'https://apiqa.expertoncue.com'
      },
      production: {
        API_URL: 'https://sellrdashboard.com'
      }
    }
  });

  // run the environment check, so the comprobation is made
  // before controllers and services are built
  envServiceProvider.check();
}
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(function ($rootScope, $state, Authentication) {

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
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
