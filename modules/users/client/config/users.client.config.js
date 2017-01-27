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
]).run(['Menus', function(Menus) {
  Menus.addMenuItem('main', {
    title: 'Website',
    iconFA: 'fa-desktop',
    state: 'websiteBuilder',
    type: 'button',
    roles: [1002],
    position: 3
  });
  Menus.addMenuItem('main', {
    title: 'Account',
    iconFA: 'fa-cogs',
    state: 'settings',
    type: 'button',
    roles: [1002],
    position: 4
  });
  Menus.addMenuItem('main', {
    title: 'Products',
    iconFA: 'fa-cart-plus',
    state: 'productsUploader',
    type: 'button',
    roles: [ 1004 ],
    position: 5
  });
}]);
