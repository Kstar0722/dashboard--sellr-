angular.module('core').controller('StoreOwnerReportsController', function ($scope, $stateParams, $state) {
  $scope.ui = {}
  $scope.ui.activeTab = 'website'
  $scope.changeTab = function (tab) {
    $scope.ui.activeTab = tab
    $state.go('storeOwner.reports.' + tab)
  }
})
