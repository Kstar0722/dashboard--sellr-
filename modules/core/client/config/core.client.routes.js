'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider', 'envServiceProvider',
    function ($stateProvider, $urlRouterProvider, envServiceProvider) {

        //SET ENVIRONMENT

        // set the domains and variables for each environment
        envServiceProvider.config({
            domains: {
                development: ['localhost', 'mystique.expertoncue.com', 'mystique.expertoncue.com:3000', 'betadashboard.expertoncue.com', 'dashboarddev.expertoncue.com'],
                production: ['dashboard.expertoncue.com']
            },
            vars: {
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
