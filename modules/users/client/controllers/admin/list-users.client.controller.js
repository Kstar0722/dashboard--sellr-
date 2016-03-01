'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin', '$http','$state', 'CurrentUserService','constants',
  function ($scope, $filter, Admin, $http, $state, CurrentUserService,constants) {

          $scope.CurrentUserService = CurrentUserService;
          console.log('user server %O', CurrentUserService.userList);


    $scope.locations = [];
    $scope.roles = [
      { text: 'user'},
      {text: 'admin'},
      {text: 'supplier'},
      {text: 'manager'}
    ];
    $scope.stuffs =[];
  $scope.userview = $state.params;
      if(CurrentUserService.locations)
      $scope.locations = CurrentUserService.locations;
      else
      $scope.locations = ["No Locations"]
  $scope.addLocs = function(){
    console.log('helllo, %O', $scope.locations);
  }

    $scope.userEditView = function(userview){
      CurrentUserService.user = userview.userName;

        $http.get(constants.API_URL + '/store/location/' +CurrentUserService.user).then(function (res, err) {
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
