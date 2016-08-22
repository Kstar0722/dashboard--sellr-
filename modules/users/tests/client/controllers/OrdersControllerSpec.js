/* globals angular, describe, beforeEach, it, expect */
describe('Controller: users.StoreOwnerOrdersController', function () {
  // load the controller's module
  beforeEach(angular.mock.module('mean'))

  var ctrl
  var scope

  // Initialize the controller and a mock scope
  beforeEach(angular.mock.inject(function ($controller, $rootScope) {
    scope = $rootScope.$new()
    ctrl = $controller('StoreOwnerOrdersController', {
      $scope: scope
    })
  }))

  it('should be defined', function () {
    expect(ctrl).toBeDefined()
  })

  it('should initialize correctly', function () {
    expect(scope.showPastOrders).toBe(false)
    expect(scope.todayOrders).toEqual([])
    expect(scope.pastOrders).toEqual([])
    expect(scope.uiStatOrders).toEqual({
      orders: [],
      count: 0,
      salesTotal: 0
    })
    expect(scope.statsScopeLabel).toEqual('Last 7 days')
  })
})
