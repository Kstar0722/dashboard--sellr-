'use strict';

angular.module('users.admin').controller('StoreController', ['$scope','$state','$http', 'Authentication','constants',
  function ($scope, $state, $http, Authentication,constants) {
    $scope.authentication = Authentication;

    $scope.roles = [
      { text: 'user'},
      {text: 'admin'},
      {text: 'supplier'},
      {text: 'manager'}
    ];

    $scope.stuffs = [];
    $scope.addNewRole = function(role){
      if($scope.stuffs.indexOf(role) >-1){
        $scope.stuffs.splice($scope.stuffs.indexOf(role), 1)
        console.log('stuffs1 %O',$scope.stuffs)
      }
      else{
        $scope.stuffs.push(role);
        console.log('stuffs2 %O',$scope.stuffs)
      }
    }





    $scope.locations = [{'id':'location1'}];
    $scope.removeLocationBox = false;
    $scope.addNewLocation = function(locs) {
      var newItemNo = $scope.locations.length+1;
      $scope.locations.push({'id':'location'+newItemNo});
      $scope.removeLocationBox = true;
    };
    $scope.removeLocation = function() {
      if($scope.locations.length >1) {
        var newItemNo = $scope.locations.length - 1;

        $scope.locations.pop();
      }
       if($scope.locations.length == 1)
        $scope.removeLocationBox = false;



    };

    $scope.invite = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'storeForm');
        return false;
      }

      else {

        var contactName = $scope.store.contactName;
        var storeName = $scope.store.storeName;
        var email = $scope.store.storeEmail;
        var role = $scope.stuffs;
        var locations = $scope.locations;
        var obj = {
          payload: {
            contactName: contactName,
            storeName: storeName,
            storeEmail: email,
            role:$scope.stuffs,
            locations:locations
      }
    };

        $http.post(constants.API_URL + '/store', obj).then(function (response, err) {
          // If successful we assign the response to the global user model
          //$scope.authentication.user = response;
          // And redirect to the previous or home page
          console.dir(response);
          $state.go($state.previous.state.name || 'home', $state.previous.params);
          if (err) {
            console.log(err);
          }
        });
      }
    };
  }
]);
