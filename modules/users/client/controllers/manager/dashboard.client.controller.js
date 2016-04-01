'use strict';

angular.module('users.manager').controller('DashboardController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav', 'constants', 'chartService', 'accountsService',
	function($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav, constants, chartService, accountsService) {
		$scope.authentication = Authentication;
		//$scope.file = '  ';
		var self = this;
		$scope.myPermissions = localStorage.getItem('roles');
		$scope.selectAccountId = localStorage.getItem('accountId');
		$scope.chartService = chartService;
		$scope.accountsService = accountsService;
		$scope.onClick = function(points, evt) {
			console.log(points, evt);
		};

		$scope.chartOptions = {}
		$scope.init = function() {
			$scope.emails = [];
			$scope.phones = [];
			$scope.loyalty = [];
			$scope.analytics = [];
			$scope.locations = [];
			$scope.stores = [];
			$scope.specificLoc = [];
			chartService.groupAndFormatDate($scope.selectAccountId)
			$scope.sources = [];
			$http.get(constants.API_URL + '/locations?account=' + $scope.selectAccountId).then(function(res, err) {
					if (err) {
						console.log(err);
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
									console.log('response for device query for %s %O', thisLocation.locationId, response)
										//this location has devices, add to that location
									response.data.forEach(function(device) {
										var rightNow = moment();
										var time = moment(device.lastCheck).subtract(4, 'hours')
										device.moment = moment(time).fromNow();
										var timeDiff = time.diff(rightNow, 'hours')
										device.unhealthy = timeDiff <= -3 ? true : false;
										console.log('rightNow', rightNow)
										console.log('timeDiff', timeDiff)
										console.log('device unhealthy', device.unhealthy)

									})
									thisLocation.devices = response.data || [];
									$scope.locations.push(thisLocation)
								}
							});
						})
					}
				})
				//TODO:add loyalty by accountId
			$http.get(constants.API_URL + '/loyalty?account=' + $scope.selectAccountId).then(function(res, err) {
				if (err) {
					console.log(err);
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