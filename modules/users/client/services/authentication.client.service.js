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
        name: user.firstName + ' ' + user.lastName,
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

    var rolesTable = [
      { text: 'admin', id: 1004 },
      { text: 'owner', id: 1009 },
      { text: 'manager', id: 1002 },
      { text: 'supplier', id: 1007 },
      { text: 'user', id: 1003 },
      { text: 'editor', id: 1010 },
      { text: 'curator', id: 1011 }
    ];

    var rolesMap = _.object(_.map(rolesTable, function(r) { return [r.text, r.id]; }));

    function userInRole(roleName) {
      if (!auth.user) return;
      if (!auth.user.roles) return false;
      var roleId = rolesMap[roleName];
      return roleId ? auth.user.roles.indexOf(roleId) > -1 : false;
    }

    var auth = {
      user: JSON.parse(localStorage.getItem('userObject')),
      userInRole: userInRole,
      setGoSquaredUser: setGoSquaredUser
    }
    return auth
  }
])
