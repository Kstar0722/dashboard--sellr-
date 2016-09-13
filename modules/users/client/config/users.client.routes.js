'use strict';

// Setting up route
angular.module('users').config([ '$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('admanager', {
        abstract: true,
        url: '/admanager',
        templateUrl: 'modules/users/client/views/settings/admanager.client.view.html',
        data: {
          roles: [ 'user' ]
        }
      })
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings2.client.view.html',
        // data: {
        //   roles: ['user', 'admin']
        // }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
      })
      .state('settings.store', {
        url: '/store',
        templateUrl: 'modules/users/client/views/settings/store-profile.client.view.html'
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
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html',
        public: true
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html',
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
        public: true
      })

      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>',
        public: true
      })
      .state('mypassword.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html',
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
      });

  }
]);
