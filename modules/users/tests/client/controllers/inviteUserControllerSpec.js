// describe('Controller: core.inviteUserController', function () {
//
//    // load the controller's module
//    beforeEach(module('mean'));
//
//    var ctrl,
//        scope;
//
//    // Initialize the controller and a mock scope
//    beforeEach(inject(function ($controller, $rootScope) {
//        scope = $rootScope.$new();
//        $controller = $controller('inviteUserController', {
//            $scope: scope
//        });
//    }));
//
//    //it('should be defined', function () {
//    //    expect(ctrl).toBeDefined();
//    //});
//
//    describe('$scope.invite ', function() {
//        it('should invite a user', function() {
//            var $scope = {};
//            var controller = $controller('inviteUserController', { $scope: $scope });
//            $scope.selected = 1004;
//            $scope.invite();
//            expect($scope.success).toEqual(true);
//        });
//    });
// });
describe('inviteUserController', function () {
  beforeEach(module('mean'))

  var $controller
  var $scope // eslint-disable-line
  var $httpBackend

  beforeEach(inject(function (_$controller_, _$httpBackend_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_
    $httpBackend = _$httpBackend_
  }))

  describe('$scope.invite', function () {
    it('invites user', function () {
      var $scope = {}
      var controller = $controller('inviteUserController', { $scope: $scope }) // eslint-disable-line
      $scope.sucess = false

      $scope.user = {accountId: '1024', name: 'asdfasdf', email: 'testuser' + Math.random(1, 10) + '@hello.com', roles: [1002, 1003, 1004, 1007, 1009, 1010, 1011]}
            // $scope.myPermissions = 1002,1003,1004,1007,1009,1010,1011;
            // $scope.selected = 1004;
            // $scope.user.accountId = 1024;
      $scope.invite(true)
            // var inviteUserController = new inviteUserController();
      console.log('calling httpbackend')
      $httpBackend.when('POST', 'http://localhost:7272' + '/users', {payload: $scope.user}).respond(function (method, url, data, headers) {
        console.log('Received these data:', method, url, data, headers)
        expect($scope.success).toEqual(true)
        return [200, {}, {}]
      })
            // $httpBackend.flush();
            // expect($scope.success).toEqual(true);
    })
  })
})
