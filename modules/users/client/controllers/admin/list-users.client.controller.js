'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin', '$http','$state', 'CurrentUserService','constants', 'userResolve',
  function ($scope, $filter, Admin, $http, $state, CurrentUserService,constants, userResolve) {
    $scope.roles = [
      { text: 'user'},
      {text: 'admin'},
      {text: 'supplier'},
      {text: 'manager'}
    ];
    $scope.user = userResolve


    $scope.CurrentUserService = CurrentUserService;
    $scope.userview = $state.params;
    //CurrentUserService.user = '';
    $scope.locations = [];


    $scope.addRole = function(role){
      if($scope.user.roles.indexOf(role) >-1){
        $scope.user.roles.splice($scope.user.roles.indexOf(role), 1)
        console.log('stuffs1 %O',$scope.user.roles)
      }
      else{
        $scope.user.roles.push(role);
        console.log('stuffs2 %O',$scope.user.roles)
      }
    }
    console.log('stuffs %O', $scope.user.roles);



      if(CurrentUserService.locations)
      $scope.locations = CurrentUserService.locations;
      else
      $scope.locations = ["No Locations"]
  $scope.addLocs = function(){
    console.log('helllo, %O', $scope.locations);
  }

    $scope.userEditView = function(userview){


        $http.get(constants.API_URL + '/store/location/' +userview.userName).then(function (res, err) {
          if (err) {
            console.log(err);
          }
          if (res) {
              console.log(res)
            CurrentUserService.locations = res.data;

            $state.go('admin.users.user-edit', userview);
          }
          if(res.data == 'No LOCATIONS'){

            CurrentUserService.locations = ["No Locations"];
            $state.go('admin.users.user-edit', userview);
          }

    })
    }

    $scope.inviteStoreView = function(userview){
      $state.go('admin.users.store', userview, {reload:true})
    };



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


      $scope.filteredItems = $filter('filter')(CurrentUserService.userList, {
        $: $scope.search
      });
      $scope.newUsers =  $scope.filteredItems
    };
      $scope.buildPager();
    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
    //$scope.locations = [{'id':'location1'}];
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
            role:role,
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
