'use strict'

angular.module('core').controller('UserListController', ['$scope', '$filter', 'Users', '$http', '$state', 'CurrentUserService', 'constants',
  function ($scope, $filter, Users, $http, $state, CurrentUserService, constants) {
    $scope.CurrentUserService = CurrentUserService
    $scope.userview = $state.params
    $scope.sortExpression = '+displayName'
        // CurrentUserService.user = '';
    $scope.locations = []

    if (CurrentUserService.locations) {
      $scope.locations = CurrentUserService.locations
    } else {
      $scope.locations = ['No Locations']
    }
    $scope.addLocs = function () {
      console.log('helllo, %O', $scope.locations)
    }

    $scope.userEditView = function (user) {
      $http.get(constants.API_URL + '/users?email=' + encodeURIComponent(user.email)).then(function (res, err) {
        if (err) {
          console.log(err)
        }
        if (res) {
          console.log(res)
          CurrentUserService.userBeingEdited = res.data[0]
          $state.go('admin.users.user-edit', {userId: user.userId})
          console.log('currentUserService userBeingEdited %O', CurrentUserService.userBeingEdited)
        }
      })
    }

    $scope.inviteStoreView = function () {
      $state.go('admin.users.store')
    }

    $scope.buildPager = function () {
      $scope.pagedItems = []
      $scope.itemsPerPage = 15
      $scope.currentPage = 1
      $scope.figureOutItemsToDisplay()
    }

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')(CurrentUserService.userList, {
        $: $scope.search
      })
      $scope.newUsers = $scope.filteredItems
    }
    $scope.buildPager()
    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay()
    }
    $scope.removeLocationBox = false
    $scope.addNewLocation = function (locs) {
      var newItemNo = $scope.locations.length + 1
      $scope.locations.push({'id': 'location' + newItemNo})
      $scope.removeLocationBox = true
    }
    $scope.removeLocation = function () {
      if ($scope.locations.length > 1) {
          // var newItemNo = $scope.locations.length - 1

        $scope.locations.pop()
      }
      if ($scope.locations.length === 1) {
        $scope.removeLocationBox = false
      }
    }

    $scope.reOrderList = function (field) {
      var oldSort = $scope.sortExpression || ''
      var asc = true
      if (oldSort.substr(1) === field) asc = oldSort[0] === '-'
      $scope.sortExpression = (asc ? '+' : '-') + field
      return $scope.sortExpression
    }

        // $scope.invite = function (isValid) {
        //  if (!isValid) {
        //    $scope.$broadcast('show-errors-check-validity', 'storeForm');
        //    return false;
        //  }
        //
        //  else {
        //    var contactName = $scope.store.contactName;
        //    var storeName = $scope.store.storeName;
        //    var email = $scope.store.storeEmail;
        //    var role = $scope.stuffs;
        //    var locations = $scope.locations;
        //    var obj = {
        //      payload: {
        //        contactName: contactName,
        //        storeName: storeName,
        //        storeEmail: email,
        //        role:role,
        //        locations:locations
        //      }
        //    };
        //
        //
        //    $http.post(constants.API_URL + '/store', obj).then(function (response, err) {
        //      // If successful we assign the response to the global user model
        //      //$scope.authentication.user = response;
        //      // And redirect to the previous or home page
        //      console.dir(response);
        //      $state.go($state.previous.state.name || 'home', $state.previous.params);
        //      if (err) {
        //        console.log(err);
        //      }
        //    });
        //  }
        // };
  }
])
