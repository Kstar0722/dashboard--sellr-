/* globals angular, localStorage */
angular.module('core').controller('StoreManagerController', function ($scope, $mdDialog, storesService, $state, accountsService, CurrentUserService, UsStates) {
  console.log(UsStates)
  $scope.UsStates = UsStates

  $scope.closeDialog = function () {
    $mdDialog.hide()
  }

  $scope.stateSelectConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'abbreviation',
    labelField: 'name',
    sortField: 'name',
    searchField: [ 'name' ]
  }
  // storesService.accountId = localStorage.getItem('accountId')
  // storesService.getStores().then(function () {
  //   $scope.storesService = storesService
  //   $scope.accountsService = accountsService
  //   $scope.currentUserService = CurrentUserService
  // })

  // // changes the view, and sets current edit store
  // $scope.editStore = function (store) {
  //   storesService.editStore = store
  //   console.log('editstore %O', storesService.editStore)
  //   $state.go('manager.stores.edit', {id: store.storeId})
  // }

  // $scope.createStore = function () {
  //   storesService.editStore = {}
  //   storesService.editStore.accountId = storesService.accountId
  //   $state.go('manager.stores.create')
  // }
})
