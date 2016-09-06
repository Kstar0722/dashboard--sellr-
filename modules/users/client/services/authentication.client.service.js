'use strict'
/* global angular, _gs, localStorage */
// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function () {
    var setGoSquaredUser = function () {
      var user = JSON.parse(localStorage.getItem('userObject'))
      if (!user) {
        return false
      }
      _gs('identify', {
        id: user.userId,
        name: user.username,
        email: user.email,
        custom: {
          source: 'Sellr-Dashboard'
        }
      })
    }

    // Run once per session (or after login)
    setGoSquaredUser()

    var auth = {
      user: JSON.parse(localStorage.getItem('userObject')),
      setGoSquaredUser: setGoSquaredUser
    }
    return auth
  }
])
