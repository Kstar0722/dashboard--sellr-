/* globals angular, localStorage */
angular.module('users.manager').controller('StoreManagerController', function ($scope, storesService, $state, accountsService, CurrentUserService) {
  storesService.accountId = localStorage.getItem('accountId')
  storesService.getStores().then(function () {
    $scope.storesService = storesService
    $scope.accountsService = accountsService
    $scope.currentUserService = CurrentUserService
  })

  // changes the view, and sets current edit store
  $scope.editStore = function (store) {
    storesService.editStore = store
    console.log('editstore %O', storesService.editStore)
    $state.go('manager.stores.edit', {id: store.storeId})
  }

  $scope.createStore = function () {
    storesService.editStore = {}
    storesService.editStore.accountId = storesService.accountId
    $state.go('manager.stores.create')
  }
})