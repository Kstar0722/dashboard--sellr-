angular.module('core').directive('inputErrorMsg', function () {
  return {
    restrict: 'E',
    template: '<div ng-repeat="(key, value) in errors" ng-show="(form.$submitted || form[field].$touched) && form[field].$error[key]" ng-bind="value" class="common-input-error-msg"></div>',
    scope: {
      form: '<',
      field: '@',
      errors: '<'
    }
  }
})
