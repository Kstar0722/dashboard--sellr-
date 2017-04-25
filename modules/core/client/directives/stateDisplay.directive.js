/* globals angular, _ */
angular.module('core')
  .directive('stateDisplay', function (UsStates) {
    return {
      restrict: 'E',
      scope: {
        source: '@'
      },
      template: '{{displayName}}',
      controller: function ($scope) {
        if ($scope.source.length === 2) {
          var stateName = _.find(UsStates, {abbreviation: $scope.source.toUpperCase()})
          stateName ? $scope.displayName = stateName.name : $scope.displayName = $scope.source
        } else {
          $scope.displayName = $scope.source
        }
      }
    }
  })
