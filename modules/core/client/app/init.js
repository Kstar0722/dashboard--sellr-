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
                staging: [ 'dashqa.expertoncue.com', 'dashqa.sllr.io' ],
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
    angular.bootstrap(document, [ ApplicationConfiguration.applicationModuleName ]);
});
