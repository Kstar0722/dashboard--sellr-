'use strict';

angular.module('users.admin').controller('StoreController', ['$scope', '$http','$state', 'Authentication',
  function ($scope, $state, $http, Authentication) {
    $scope.authentication = Authentication;



    $scope.invite = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'storeForm');

        return false;
      }


      var contactName = $scope.store.contactName;
      var storeName = $scope.store.storeName;
      var email = $scope.store.storeEmail;
      var obj = {
        payload:{
          contactName: contactName,
          storeName: storeName,
          storeEmail:email
        }
      };
      $http.post('http://api.expertoncue.com:443/store', obj).success(function (response) {
        // If successful we assign the response to the global user model
        //$scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);
