'use strict'
/* global angular, localStorage */
// Authentication service for user variables
angular.module('core').factory('Authentication', ['$window',
  function () {
    var me = this

    me.rolesTable = [
      { text: 'manager', id: 1002 },
      { text: 'user', id: 1003 },
      { text: 'admin', id: 1004 },
      { text: 'supplier', id: 1007 },
      { text: 'owner', id: 1009 },
      { text: 'editor', id: 1010 },
      { text: 'curator', id: 1011 }
    ]

    me.rolesMap = _.object(_.map(me.rolesTable, function (r) { return [r.text, r.id] }))

    me.user = JSON.parse(localStorage.getItem('userObject'))

    me.userInRole = function (roleName) {
      if (!me.user || !me.user.roles) return false
      var roleId = me.rolesMap[roleName]
      return roleId ? me.user.roles.indexOf(roleId) > -1 : false
    }

    return me
  }
])
