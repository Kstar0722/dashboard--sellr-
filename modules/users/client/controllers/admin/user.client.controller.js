'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve','$timeout',
  function ($scope, $state, Authentication, userResolve, $timeout) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;

      $scope.roles = [
          { text: 'user'},
          {text: 'admin'},
          {text: 'supplier'},
          {text: 'manager'}
      ];
      $timeout(function(){
          $scope.stuffs = $scope.user.roles;
      }, 200);



      $scope.addRole = function(role){
              if($scope.stuffs.indexOf(role) >-1){
                  $scope.stuffs.splice($scope.stuffs.indexOf(role), 1)
              }
              else{
                  $scope.stuffs.push(role);
              }
      }
      $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = $scope.user;
      console.dir($scope.user);
      user.$update(function () {
        $state.go('admin.users.edit', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);
