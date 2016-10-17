describe('Service: core.formatter', function () {

  // load the service's module
  beforeEach(module('mean'));

  // instantiate service
  var service;

  //update the injection
  beforeEach(inject(function (_formatter_) {
    service = _formatter_;
  }));

  /**
   * @description
   * Sample test case to check if the service is injected properly
   * */
  it('should be injected and defined', function () {
    expect(service).toBeDefined();
  });

  it('should build code for field name', function () {
    expect(service.codeOf('code')).toEqual('code');
    expect(service.codeOf('Some Text')).toEqual('some_text');
    expect(service.codeOf('My-UnreaDABLE! STRing1')).toEqual('my_unreadable_string1');
  })

  it('should format code as human readable string', function () {
    expect(service.humanReadable('code')).toEqual('Code');
    expect(service.humanReadable('Formatted String')).toEqual('Formatted String');
    expect(service.humanReadable('my_column1')).toEqual('My Column 1');
    expect(service.humanReadable('INGREDIENTS')).toEqual('Ingredients');
    expect(service.humanReadable('MY -VERy- new  COLUMN')).toEqual('My Very New Column');
  })
});
