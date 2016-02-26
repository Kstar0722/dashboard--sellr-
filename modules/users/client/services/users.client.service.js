'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  //function ($http) {
  //  var me = this;
  //
  //  me.get = function(){
  //    return $http.get('/api/users')
  //  };
  //
  //  me.put = function(){
  //    return $http.put('/api/users/:userId')
  //  }
  //
  //  return me;
  //}
    function ($resource) {
      return $resource('api/users/:userId', {
        userId: '@_id'
      }, {
        update: {
          method: 'PUT'
        }
      });
    }
]);
//


