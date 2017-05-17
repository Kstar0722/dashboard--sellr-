angular.module('core').controller('StoreOwnerHomeController', function ($scope, $stateParams, $state, $http) {
  console.log('LISTED PRODUCTS CTRL')

  var googleSessionNumber = function getGoogleSessionCount() {   
  	$scope.websiteTraffic = 0; 
		var req = {
			method: 'POST',
			url: 'https://analyticsreporting.googleapis.com/v4/reports:batchGet',
			headers: {
				'Authorization': 'Bearer ya29.GlxNBKHZ-_1fpmL2YS5dO63oml8YhrrTnbLsCh_iS2KLEBhIf33Hv73YFImlYQZ9YZuTcbP1M_ZvCkWbmcd36Ur1D42Qy51Xv4_bhVP30GQWszh13ype2_7RF53cSw'
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
