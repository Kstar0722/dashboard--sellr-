//COPY THIS FILE AND CHANGE THE 'describe' string, and then the beforeEach to inject your controller or service.




describe('Test Basic Test', function () {


    // load the service's module
    beforeEach(module('mean'));

    // instantiate service
    var service;

    //update the injection
    // beforeEach(inject(function (_TestConcat_) {
    //     service = _TestConcat_;
    // }));

    /**
     * @description
     * Sample test case to check if the service is injected properly
     * */
    it('should add 1+1', function () {
        expect(1 + 1).toBe(2);
    });
});
