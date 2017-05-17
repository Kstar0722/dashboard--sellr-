angular.module('core').controller('StoreOwnerHomeController', function ($scope, $stateParams, $state, $http) {
  console.log('LISTED PRODUCTS CTRL')

  var googleSessionNumber = function getGoogleSessionCount() {
  	$scope.websiteTraffic = 0;
		var req = {
			method: 'POST',
			url: 'https://analyticsreporting.googleapis.com/v4/reports:batchGet',
			headers: {
				'Authorization': 'Bearer ' + localStorage.getItem('ga_auth')
			},
			data: {
				"reportRequests":
				[
					{
						"viewId": "128946812",
						"metrics": [{"expression": "ga:sessions"}]
					}
				]
			}
		}

		$http(req).then(function(response){
			var analyticsNumbers = response.data.reports["0"].data.totals["0"].values["0"];
			// return analyticsNumbers;
			$scope.websiteTraffic = analyticsNumbers;
		}, function(){});
  }

  googleSessionNumber();
})
