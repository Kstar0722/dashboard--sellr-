'use strict'

angular.module('core')
  .directive('passwordVerify', function () {
    return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function (scope, element, attrs, ngModel) {
        scope.$watch(function () {
          var combined
          if (scope.passwordVerify || ngModel) {
            combined = scope.passwordVerify + '_' + ngModel
          }
          return combined
        }, function (value) {
          if (value) {
            ngModel.$validators.passwordVerify = function (password) {
              return scope.passwordVerify === password
            }
          }
        })
      }
    }
  })
