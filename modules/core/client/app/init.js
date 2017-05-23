'use strict'
/* globals angular,localStorage,history, ApplicationConfiguration,$,$sc */
// Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies)

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config([ '$locationProvider', '$httpProvider', 'envServiceProvider', 'cfpLoadingBarProvider', '$mdThemingProvider',
  function ($locationProvider, $httpProvider, envServiceProvider, cfpLoadingBarProvider, $mdThemingProvider) {
    $locationProvider.html5Mode({ enabled: true, requireBase: false }).hashPrefix('!')

    $mdThemingProvider.theme('default')
      .accentPalette('green')

    cfpLoadingBarProvider.latencyThreshold = 200

    $httpProvider.interceptors.push('authInterceptor') //  MEANJS/Mongo interceptor
    $httpProvider.interceptors.push('oncueAuthInterceptor') //  Oncue Auth Interceptor (which adds token) to outgoing HTTP requests

    // SET ENVIRONMENT
    // set the domains and variables for each environment
    envServiceProvider.config({
      domains: {
        local: [ 'localhost' ],
        development: [ 'dashdev.sllr.io' ],
        staging: [ 'dashqa.sllr.io', 'dashboard.sllr.io' ],
        production: [ 'www.sellrdashboard.com', 'sellrdashboard.com', 'dashboard.sellr.io' ]
      },
      vars: {
        local: {
          env: 'local',
          // API_URL: 'https://apidev.sllr.io',
          // BWS_API: 'https://apidev.sllr.io',
          API_URL: 'http://localhost:7272',
          BWS_API: 'http://localhost:7272',
          CARDKIT_URL: 'https://themedev.sllr.io'
          // CARDKIT_URL: 'http://localhost:7474'
        },
        development: {
          env: 'dev',
          API_URL: 'https://apidev.sllr.io',
          BWS_API: 'https://apidev.sllr.io',
          CARDKIT_URL: 'https://themedev.sllr.io'
        },
        staging: {
          env: 'staging',
          API_URL: 'https://apiqa.sllr.io',
          BWS_API: 'https://bwsqa.sllr.io',
          CARDKIT_URL: 'https://themedev.sllr.io'
        },
        production: {
          env: 'production',
          API_URL: 'https://api.sllr.io',
          BWS_API: 'https://bws.sllr.io',
          CARDKIT_URL: 'https://theme.sllr.io'
        }
      }
    })

    // run the environment check, so the comprobation is made
    // before controllers and services are built
    envServiceProvider.check()
  }
])
  .value('ProductTypes', [
    { productTypeId: 1, name: 'Wine', similarNames: 'w,wines' },
    { productTypeId: 2, name: 'Beer', similarNames: 'b,beers,ale,lager' },
    {productTypeId: 3, name: 'Spirits', similarNames: 's,spirit,liqueur'},
    {productTypeId: 12, name: 'Generic', similarNames: 'generic,undefined,unknown'},
    {productTypeId: 15, name: 'Cocktails', similarNames: 'cocktails,cocktail'},
    {productTypeId: 16, name: 'Art', similarNames: 'art'},
    {productTypeId: 17, name: 'Health', similarNames: 'health,vitamins,supplements'}
  ])

angular.module(ApplicationConfiguration.applicationModuleName).constant('globalClickEventName', 'globalEvent.documentClick')

angular.module(ApplicationConfiguration.applicationModuleName).run(function ($rootScope, $state, Authentication, authToken, $window, $injector, $mdMedia, globalClickEventName) {
  var DEFAULT_PUBLIC = false

  $rootScope.$mdMedia = $mdMedia
  $rootScope.$state = $state
  $rootScope.$stateClass = cssClassOf($state.current.name)

  // for debugging purposes only
  $window.$svc = function (name) {
    $window[name] = $injector.get(name)
    return $window[name]
  }
  $window.$sc = function (el) {
    $window.$scope = angular.element(el || document.querySelector('.main-content .ng-scope:first-of-type')).scope()
    return $window.$scope
  }
  $window.$d = function (el) { ($window.$scope || $sc(el)).$digest() }

  initLoadingBar()

  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    // General Authentication BEFORE Checking Roles
    if (!authToken.hasTokenInStorage() && !isPublicState(toState)) {
      event.preventDefault()
      window.localStorage.clear()
      localStorage.clear()
      $window.localStorage.clear()
      Authentication.user = undefined
      $state.go('authentication.signin')
      return false
    }
    // Authentication AND AUthorization based on Roles
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false
      toState.data.roles.forEach(function (role) {
        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
          allowed = true
          return true
        }
      })

      if (!allowed) {
        event.preventDefault()
        if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
          $state.go('forbidden')
        } else {
          $state.go('authentication.signin').then(function () {
            storePreviousState(toState, toParams)
          })
        }
      }
    }
  })

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    console.log('changed state from %O to %O', fromState, toState)
    storePreviousState(fromState, fromParams)
    $rootScope.$stateClass = cssClassOf(toState.name)
  })

  // Bind a global click anywhere handler to be used in needed controller
  angular.element($window).on('click', function (e) {
    $rootScope.$broadcast(globalClickEventName, e.target)
  })

  function isPublicState (state) {
    if (!state) return DEFAULT_PUBLIC
    // take closest state in hierarchy with public property defined
    while (typeof state.public !== 'boolean' && state.parent) state = state.parent
    return state.public || DEFAULT_PUBLIC
  }

  // Store previous state
  function storePreviousState (state, params) {
    // only store this state if it shouldn't be ignored
    if (!state.data || !state.data.ignoreState) {
      $state.previous = {
        state: state,
        params: params,
        href: $state.href(state, params)
      }
    }
  }

/* eslint-disable */
  function cssClassOf (name) {
    if (typeof name !== 'string') return name
    return name.replace(/[^a-z0-9\-]+/gi, '-')
  }
/* eslint-enable */

  function initLoadingBar () {
    var busy = false

    $rootScope.$on('cfpLoadingBar:started', function () {
      busy = true
      $(document.body).addClass('loading')

      if (document.activeElement) {
        document.activeElement.blur()
      }
    })

    $rootScope.$on('cfpLoadingBar:completed', function () {
      busy = false
      $(document.body).removeClass('loading')
    })

    document.body.addEventListener('keydown', cancelKeyPress, true)
    $(document).keydown(cancelKeyPress)

    function cancelKeyPress (ev) {
      if (!busy) return
      ev.preventDefault()
      ev.stopPropagation()
    }
  }
})

// Then define the init function for starting up the application
angular.element(document).ready(function () {
  // Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname)
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      }
      window.location.hash = ''
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top
      document.body.scrollLeft = scroll.left
    }
  }

  // Then init the app
  angular.bootstrap(document, [ ApplicationConfiguration.applicationModuleName ])
})
