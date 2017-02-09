describe('Service: core.Countries', function () {
    // load the service's module
  beforeEach(module('mean'))

    // instantiate service
  var service

    // update the injection
  beforeEach(inject(function (_Countries_) {
    service = _Countries_
  }))

    /**
     * @description
     * Sample test case to check if the service is injected properly
     * */
  it('should be injected and defined', function () {
    expect(service).toBeDefined()
  })

  it('should have a list of countries', function () {
    expect(service.allCountries.length).toBeGreaterThan(0)
  })
})
