angular.module('core').constant('globalClickEventName', 'globalEvent.documentClick')

angular.module('core').directive('onClickAnywhere', ['$window', 'globalClickEventName',
  function ($window, globalClickEventName) {
    return {
      link: function ($scope) {
        angular.element($window).on('click', function (e) {
          $scope.$broadcast(globalClickEventName, e.target)
        })
      }
    }
  }
])
