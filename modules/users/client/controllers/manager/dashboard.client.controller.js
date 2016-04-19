'use strict';

angular.module('users.manager').controller('DashboardController', ['$scope', '$stateParams','$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav', 'constants', 'chartService', 'accountsService',
	function($scope, $stateParams, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav, constants, chartService, accountsService) {
		$scope.authentication = Authentication;
		//$scope.file = '  ';
		var self = this;
		$scope.myPermissions = localStorage.getItem('roles');
		if($stateParams.accountId)
			$scope.selectAccountId = $stateParams.accountId;
		else
			$scope.selectAccountId = localStorage.getItem('accountId');
		$scope.chartService = chartService;
		$scope.accountsService = accountsService;
		$scope.onClick = function(points, evt) {
			console.log(points, evt);
		};
		$scope.chartOptions = {}
		$scope.init = function() {
			$state.go('.', {accountId: $scope.selectAccountId}, {notify: false})
			$scope.emails = [];
			$scope.phones = [];
			$scope.loyalty = [];
			$scope.analytics = [];
			$scope.locations = [];
			$scope.stores = [];
			$scope.specificLoc = [];
			chartService.groupAndFormatDate($scope.selectAccountId)
			console.log('state params %O', $stateParams)
			//$scope.selectAccountId = $stateParams.accountId;
			$scope.sources = [];
			$http.get(constants.API_URL + '/locations?account=' + $scope.selectAccountId).then(function(res, err) {
					if (err) {
						console.log(err);
						toastr.error("We're experiencing some technical difficulties with our database, please check back soon")


					}
					if (res.data.length > 0) {
						//this account has at least one location
						res.data.forEach(function(thisLocation) {
							thisLocation.devices = [];
							$http.get(constants.API_URL + '/devices/location/' + thisLocation.locationId).then(function(response, err) {
								if (err) {
									console.log(err);
								}
								if (response.data.length > 0) {
									//this location has devices, add to that location
									response.data.forEach(function(device) {
										var rightNow = moment();
                                        // var time = moment(device.lastCheck).subtract(4, 'hours');
                                        var time = moment(device.lastCheck);
										device.moment = moment(time).fromNow();
                                        var timeDiff = time.diff(rightNow, 'hours');
                                        device.unhealthy = timeDiff <= -3;

                                    });
									thisLocation.devices = response.data || [];
									$scope.locations.push(thisLocation)
								}
							});
						})
					}
				})
			$http.get(constants.API_URL + '/loyalty?account=' + $scope.selectAccountId).then(function(res, err) {
				if (err) {
					console.log(err);
					toastr.error("We're experiencing some technical difficulties with our database, please check back soon")
				}
				if (res) {
					for (var i in res.data) {
						var contact = JSON.parse(res.data[i].contactInfo);
						if (contact["email"]) {
							$scope.emails.push({
								email: contact['email']
							});
						} else {
							$scope.phones.push({
								phone: contact['phone']
							});

						}

					}
				}
			});

			var url = constants.API_URL + '/analytics/top-products?account=' + $scope.selectAccountId;
			$http.get(url).then(function(res, err) {
				if (err) {
					console.log(err);
					toastr.error("We're experiencing some technical difficulties with our database, please check back soon")
				}
				if (res) {
					console.log('analytics topProducts %O', res);
					for (var i in res.data) {
						if (res.data[i].action == 'Product-Request') {
							$scope.analytics.push(res.data[i])
						}
					}
				}
			});

		};
	}

]);
