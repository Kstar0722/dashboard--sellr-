describe('Controller: users.EditProfileController', function () {
    // load the controller's module
  beforeEach(module('mean'))

  var ctrl,
    scope

    // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new()
    ctrl = $controller('EditProfileController', {
      $scope: scope
    })
  }))

  it('should be defined', function () {
    expect(ctrl).toBeDefined()
  })
})
