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
      salesTotal: 0,
      daysScope: 7
    })
    expect(scope.statsScopeLabel).toEqual('Last 7 days')
  })

  it('should load orders and stats correctly', function () {
    var mockOrders = [
      {
        // Past Order
        pickupTime: '2010-07-18T18:08:26.211Z',
        status: 'Cancelled',
        total: '10'
      },
      {
        // Past Order
        pickupTime: '2010-07-18T18:08:26.211Z',
        status: 'Completed',
        total: '10'
      },
      {
        // Valid today Order
        pickupTime: new Date(),
        status: 'Submitted',
        total: '10'
      },
      {
        // Valid today Order
        pickupTime: new Date(),
        status: 'Ready for Pickup',
        total: '10'
      },
      {
        // Today but COmpleted should be marked as PastOrder and count as Stat
        pickupTime: new Date(),
        status: 'Completed',
        total: '999'
      },
      {
        // Today but Cancelled should be marked as PastOrder
        pickupTime: new Date(),
        status: 'Cancelled',
        total: '10'
      }
    ]
    // This also calls refreshStats and getFilteredOrders
    scope.loadOrders(mockOrders)

    expect(scope.pastOrders.length).toEqual(4)
    expect(scope.todayOrders.length).toEqual(2)

    // STATS: Only valid order to count as Stat is Today as Completed Order
    expect(scope.uiStatOrders.count).toEqual(1)
    expect(scope.uiStatOrders.salesTotal).toEqual(999)
  })
})
