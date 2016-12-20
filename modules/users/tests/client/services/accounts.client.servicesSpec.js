/* globals inject,describe,beforeEach,it,expect */
describe('Service: core.AccountsService', function () {

  // load the service's module
  beforeEach(module('mean'))

  // instantiate service
  var service,
    $httpBackend

  // update the injection
  beforeEach(inject(function (_accountsService_, _$httpBackend_) {
    $httpBackend = _$httpBackend_
    service = _accountsService_

    // mock background api call response
    $httpBackend.whenGET(/\/users\/editors/).respond(200, {})
    $httpBackend.whenGET(/\/client\/views\/.*/).respond(200, {})

  }))

  /**
   * @description
   * Sample test case to check if the service is injected properly
   * */
  it('should be injected and defined', function () {
    expect(service).toBeDefined();
  })

  it('should get all accounts', function () {
    $httpBackend.whenGET(/\/accounts\?status=1/)
      .respond(200, [ { preferences: {}, accountId: 1000 } ])
    service.getAccounts().then(function (res) {})
    $httpBackend.flush()
    expect(service.accounts.length).toBeGreaterThan(0)
  })
})
