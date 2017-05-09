describe('Service: users.productEditorService', function () {
    // load the service's module
  beforeEach(module('mean'))

    // instantiate service
  var service

    // update the injection
  beforeEach(inject(function (_productEditorService_) {
    service = _productEditorService_
  }))

    /**
     * @description
     * Sample test case to check if the service is injected properly
     * */
  it('should be injected and defined', function () {
    expect(service).toBeDefined()
  })

  it('should initialize', function () {
    service.init()
    expect(service.productTypes.length).toBe(3)
    expect(service.productStatuses.length).toBe(6)
  })
})
