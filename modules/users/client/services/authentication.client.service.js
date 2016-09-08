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
      var options = {
        id: user.userId,
        name: user.username,
        email: user.email,
        custom: {
          source: 'Sellr-Dashboard'
        }
      }
      console.log('setting go squared user %O', options)

      _gs('identify', options)
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
