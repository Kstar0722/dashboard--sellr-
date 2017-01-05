'use strict'
/* global angular, localStorage */
// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function () {
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
      userInRole: userInRole
    };

    return auth
  }
])
