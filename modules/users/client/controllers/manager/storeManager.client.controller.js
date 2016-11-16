/* globals angular */
angular.module('users.manager').controller('StoreManagerController', function ($scope, storesService, $state, accountsService, CurrentUserService) {
  storesService.init().then(function () {
    $scope.storesService = storesService
    $scope.store = {}
    $scope.accountsService = accountsService
    $scope.currentUserService = CurrentUserService
  })

  // changes the view, and sets current edit store
  $scope.editStore = function (store) {
    storesService.editStore = store
    console.log('editstore %O', storesService.editStore)
    $state.go('manager.stores.edit', {id: store.locationId})
  }
})
