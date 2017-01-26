'use strict';

angular.module('core').filter('emptyToEnd', function () {
  return function (array, key) {
    if (!angular.isArray(array)) return array;
    var present = array.filter(function (item) { return item[key]; });
    var empty = array.filter(function (item) { return !item[key]; });
    return present.concat(empty);
  };
});
