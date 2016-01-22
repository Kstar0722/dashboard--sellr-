'use strict';

(function() {
	// Suppliers Controller Spec
	describe('Suppliers Controller Tests', function() {
		// Initialize global variables
		var SuppliersController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Suppliers controller.
			SuppliersController = $controller('SuppliersController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Supplier object fetched from XHR', inject(function(Suppliers) {
			// Create sample Supplier using the Suppliers service
			var sampleSupplier = new Suppliers({
				name: 'New Supplier'
			});

			// Create a sample Suppliers array that includes the new Supplier
			var sampleSuppliers = [sampleSupplier];

			// Set GET response
			$httpBackend.expectGET('suppliers').respond(sampleSuppliers);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.suppliers).toEqualData(sampleSuppliers);
		}));

		it('$scope.findOne() should create an array with one Supplier object fetched from XHR using a supplierId URL parameter', inject(function(Suppliers) {
			// Define a sample Supplier object
			var sampleSupplier = new Suppliers({
				name: 'New Supplier'
			});

			// Set the URL parameter
			$stateParams.supplierId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/suppliers\/([0-9a-fA-F]{24})$/).respond(sampleSupplier);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.supplier).toEqualData(sampleSupplier);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Suppliers) {
			// Create a sample Supplier object
			var sampleSupplierPostData = new Suppliers({
				name: 'New Supplier'
			});

			// Create a sample Supplier response
			var sampleSupplierResponse = new Suppliers({
				_id: '525cf20451979dea2c000001',
				name: 'New Supplier'
			});

			// Fixture mock form input values
			scope.name = 'New Supplier';

			// Set POST response
			$httpBackend.expectPOST('suppliers', sampleSupplierPostData).respond(sampleSupplierResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Supplier was created
			expect($location.path()).toBe('/suppliers/' + sampleSupplierResponse._id);
		}));

		it('$scope.update() should update a valid Supplier', inject(function(Suppliers) {
			// Define a sample Supplier put data
			var sampleSupplierPutData = new Suppliers({
				_id: '525cf20451979dea2c000001',
				name: 'New Supplier'
			});

			// Mock Supplier in scope
			scope.supplier = sampleSupplierPutData;

			// Set PUT response
			$httpBackend.expectPUT(/suppliers\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/suppliers/' + sampleSupplierPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid supplierId and remove the Supplier from the scope', inject(function(Suppliers) {
			// Create new Supplier object
			var sampleSupplier = new Suppliers({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Suppliers array and include the Supplier
			scope.suppliers = [sampleSupplier];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/suppliers\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleSupplier);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.suppliers.length).toBe(0);
		}));
	});
}());