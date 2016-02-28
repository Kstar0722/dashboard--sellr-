'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator', 'constants',
    function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator, constants) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();
    $scope.regCodeErrors = false;
    $scope.regCode = '';

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;
    $scope.regCode = $location.search().regcode;


    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;
      var check = false;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }
        $http.get(constants.API_URL + '/store/validate/' + $scope.regCode).success(function (response) {
        // If successful we assign the response to the global user model



        var check = response;
        $scope.regCodeErrors = !check;
        console.dir($scope.credentials);
        for(var i in response.role){
          response.role[i] = response.role[i].trim().toLowerCase();
        }
        // And redirect to the previous or home page
        $scope.credentials.roles =response.role;
          console.log($scope.credentials)
        if(check) {
            var storeUpdate = {
                payload:{
                    email:$scope.credentials.email,
                    username: $scope.credentials.username,
                    userId:$scope.regCode
                }
            };
            $http.post(constants.API_URL + '/store/update', storeUpdate).success(function (res) {
            if(res) {
                $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
                    // If successful we assign the response to the global user model
                    $scope.authentication.user = response;
                    // And redirect to the previous or home page
                    $state.go($state.previous.state.name || 'home', $state.previous.params);
                }).error(function (response) {
                    $scope.error = response.message;
                });
            }
          }).error(function (res) {
            $scope.error = res.message;
          });
        }

      }).error(function (response) {
        $scope.error = response.message;
      });
      //

    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }


      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        console.log('authClientController signing %O', response);
        $scope.authentication.user = response;

          $http.get(constants.API_URL + '/accounts/user/' + $scope.authentication.user.username).then(function (response, err) {
          if (err) {
            console.log(err);
          }
          if (response) {
            localStorage.setItem('accountId', Number(response.data[0].accountId));
            console.log('Account Id Set In Storage',Number(response.data[0].accountId));
          }
        });
        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'manager.dashboard', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);
