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
angular.module('users.admin').factory('Admin', ['$http', 'constants', '$q',
  function ($http, constants, $q) {
    var me = this;

    me.get = function(userId){
      var defer = $q.defer();
      $http.get(constants.API_URL + '/users/'+userId.userId).then(function(response, err){
        $http.get(constants.API_URL + '/users/roles/'+userId.userId).then(function(res, err){
          console.log(res)
          console.log(response)
          response.data[0].roles = [];
              res.data.forEach(function(role){
                response.data[0].roles.push(role['roleId'])
                response.data[0].accountId = role['accountId']
              });
              defer.resolve(response.data[0]);
        })
      })
      return defer.promise;
    };
    me.query = function(){
      var defer = $q.defer();
      $http.get(constants.API_URL + '/users').then(function(response,err){
        if(err)
          defer.reject(err);
        defer.resolve(response.data);
      })
      return defer.promise;
    };

    me.put = function(userId){
      return $http.put(constants.API_URL + '/users'+userId)
    }

    return me;
  }
]);



