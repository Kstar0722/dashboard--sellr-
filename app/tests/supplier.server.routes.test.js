'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Supplier = mongoose.model('Supplier'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, supplier;

/**
 * Supplier routes tests
 */
describe('Supplier CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Supplier
		user.save(function() {
			supplier = {
				name: 'Supplier Name'
			};

			done();
		});
	});

	it('should be able to save Supplier instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Supplier
				agent.post('/suppliers')
					.send(supplier)
					.expect(200)
					.end(function(supplierSaveErr, supplierSaveRes) {
						// Handle Supplier save error
						if (supplierSaveErr) done(supplierSaveErr);

						// Get a list of Suppliers
						agent.get('/suppliers')
							.end(function(suppliersGetErr, suppliersGetRes) {
								// Handle Supplier save error
								if (suppliersGetErr) done(suppliersGetErr);

								// Get Suppliers list
								var suppliers = suppliersGetRes.body;

								// Set assertions
								(suppliers[0].user._id).should.equal(userId);
								(suppliers[0].name).should.match('Supplier Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Supplier instance if not logged in', function(done) {
		agent.post('/suppliers')
			.send(supplier)
			.expect(401)
			.end(function(supplierSaveErr, supplierSaveRes) {
				// Call the assertion callback
				done(supplierSaveErr);
			});
	});

	it('should not be able to save Supplier instance if no name is provided', function(done) {
		// Invalidate name field
		supplier.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Supplier
				agent.post('/suppliers')
					.send(supplier)
					.expect(400)
					.end(function(supplierSaveErr, supplierSaveRes) {
						// Set message assertion
						(supplierSaveRes.body.message).should.match('Please fill Supplier name');
						
						// Handle Supplier save error
						done(supplierSaveErr);
					});
			});
	});

	it('should be able to update Supplier instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Supplier
				agent.post('/suppliers')
					.send(supplier)
					.expect(200)
					.end(function(supplierSaveErr, supplierSaveRes) {
						// Handle Supplier save error
						if (supplierSaveErr) done(supplierSaveErr);

						// Update Supplier name
						supplier.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Supplier
						agent.put('/suppliers/' + supplierSaveRes.body._id)
							.send(supplier)
							.expect(200)
							.end(function(supplierUpdateErr, supplierUpdateRes) {
								// Handle Supplier update error
								if (supplierUpdateErr) done(supplierUpdateErr);

								// Set assertions
								(supplierUpdateRes.body._id).should.equal(supplierSaveRes.body._id);
								(supplierUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Suppliers if not signed in', function(done) {
		// Create new Supplier model instance
		var supplierObj = new Supplier(supplier);

		// Save the Supplier
		supplierObj.save(function() {
			// Request Suppliers
			request(app).get('/suppliers')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Supplier if not signed in', function(done) {
		// Create new Supplier model instance
		var supplierObj = new Supplier(supplier);

		// Save the Supplier
		supplierObj.save(function() {
			request(app).get('/suppliers/' + supplierObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', supplier.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Supplier instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Supplier
				agent.post('/suppliers')
					.send(supplier)
					.expect(200)
					.end(function(supplierSaveErr, supplierSaveRes) {
						// Handle Supplier save error
						if (supplierSaveErr) done(supplierSaveErr);

						// Delete existing Supplier
						agent.delete('/suppliers/' + supplierSaveRes.body._id)
							.send(supplier)
							.expect(200)
							.end(function(supplierDeleteErr, supplierDeleteRes) {
								// Handle Supplier error error
								if (supplierDeleteErr) done(supplierDeleteErr);

								// Set assertions
								(supplierDeleteRes.body._id).should.equal(supplierSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Supplier instance if not signed in', function(done) {
		// Set Supplier user 
		supplier.user = user;

		// Create new Supplier model instance
		var supplierObj = new Supplier(supplier);

		// Save the Supplier
		supplierObj.save(function() {
			// Try deleting Supplier
			request(app).delete('/suppliers/' + supplierObj._id)
			.expect(401)
			.end(function(supplierDeleteErr, supplierDeleteRes) {
				// Set message assertion
				(supplierDeleteRes.body.message).should.match('User is not logged in');

				// Handle Supplier error error
				done(supplierDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Supplier.remove().exec();
		done();
	});
});