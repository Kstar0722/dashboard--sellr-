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
