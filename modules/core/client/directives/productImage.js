angular.module('core')
  .directive('productImage', function () {
    return {
      restrict: 'E',
      scope: {
        imageUrl: '@',
        productType: '@'
      },
      controller: function ($scope) {
        switch ($scope.productType) {
          case '1':
            $scope.noImageUrl = 'https://s3.amazonaws.com/cdn.expertoncue.com/images/wineplaceholder.png'
            break
          case '2':
            $scope.noImageUrl = 'https://s3.amazonaws.com/cdn.expertoncue.com/images/beerplaceholder.png'
            break
          case '3':
            $scope.noImageUrl = 'https://s3.amazonaws.com/cdn.expertoncue.com/images/spiritplaceholder.png'
            break
          default:
            $scope.noImageUrl = 'https://s3.amazonaws.com/cdn.expertoncue.com/images/wineplaceholder.png'
            break
        }
      },
      templateUrl: '/modules/core/client/directives/templates/productImage.html'
    }
  })
