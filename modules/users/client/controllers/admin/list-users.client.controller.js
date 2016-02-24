'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin', '$http','$state',
  function ($scope, $filter, Admin, $http, $state) {
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });





    $scope.userEditView = function(userview){

      $state.go('admin.users.edit', userview, {reload:true})
    };
    $scope.inviteStoreView = function(userview){
      $state.go('admin.users.store', userview, {reload:true})
    };
    $scope.roles = [
      { text: 'user'},
      {text: 'admin'},
      {text: 'supplier'},
      {text: 'manager'}
    ];
    $scope.stuffs =[];



    $scope.addRole = function(role){
      if($scope.stuffs.indexOf(role) >-1){
        $scope.stuffs.splice($scope.stuffs.indexOf(role), 1)
      }
      else{
        $scope.stuffs.push(role);
      }
    }
      $scope.testFunction = function () {
          console.log('test');
      };

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
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
        console.log($scope.locations)
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
            role:role,
            locations:locations
          }
        };


        $http.post('http://api.expertoncue.com:443/store', obj).then(function (response, err) {
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
