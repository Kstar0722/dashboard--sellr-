'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve','$timeout', 'CurrentUserService',
  function ($scope, $state, Authentication, userResolve, $timeout,CurrentUserService) {
    $scope.authentication = Authentication;


      $scope.remove = function () {
          user = userResolve;
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();
            CurrentUserService.update();

        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

      $scope.update = function (isValid) {
          console.dir(isValid);
          if (!isValid) {
              $scope.$broadcast('show-errors-check-validity', 'userForm');

              return false;
          }

          var user = $scope.user;

          console.dir($scope.user);
          user.$update(function () {
              $state.go('admin.users.user-edit', {
                  userId: user._id
              });
          }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
          });
      };
  }
]);
