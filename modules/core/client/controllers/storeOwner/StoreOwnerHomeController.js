angular.module('core').controller('StoreOwnerHomeController', function ($scope, $stateParams, $state, $http) {
  console.log('LISTED PRODUCTS CTRL')

  $scope.googleSessionNumber = function getGoogleSessionCount() {    
		var req = {
			method: 'POST',
			url: 'https://analyticsreporting.googleapis.com/v4/reports:batchGet',
			headers: {
				'Authorization': 'Bearer ya29.GlxMBB0BEYYpKw8fRNmtI-LJu7T5gduSjfMvvZhPi1KMDjsPPknVZH5UzKs3SjPS3ejjpBCWqmFz6l2Twbdcd_ni7afhjS_jFQWmBPfKv-Vn36KYWSAhAUlMbGA8wg'
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

		$http(req).then(function(){
			console.log(req);
		}, function(){});
  }
})
