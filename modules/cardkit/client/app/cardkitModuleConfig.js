var dependencies = [
  'ngAnimate',
  'ngCookies',
  'ngMaterial',
  'ngMdIcons',
  'ngResource',
  'ngSanitize',
  'ngTagsInput',
  // 'ngTouch',
  'ngVideo',
  'angular.filter',
  'angularMoment',
  'selectize',
  // 'ui.bootstrap',
  'ui.gravatar',
  'ui.router',
  // 'ui.tree',
  // 'ui.utils',
  'cfp.hotkeys',
  'angular-filepicker',
  'angularLazyImg',
  'angular-cache',
  'rt.debounce'
]

ApplicationConfiguration.registerModule('cardkit.core', dependencies)
ApplicationConfiguration.registerModule('cardkit.pages', ['cardkit.core'])
ApplicationConfiguration.registerModule('cardkit.cards', ['cardkit.core'])
ApplicationConfiguration.registerModule('cardkit.users', ['cardkit.core'])
ApplicationConfiguration.registerModule('cardkit.clients', ['cardkit.core'])

ApplicationConfiguration.registerModule('cardkit', ['core', 'cardkit.pages', 'cardkit.cards', 'cardkit.users', 'cardkit.clients'])

angular.module('cardkit').config(['$sceDelegateProvider', '$compileProvider', 'gravatarServiceProvider', '$animateProvider', '$mdThemingProvider', '$provide', 'lazyImgConfigProvider', 'CacheFactoryProvider', '$stateProvider', '$httpProvider',
    function($sceDelegateProvider, $compileProvider, gravatarServiceProvider, $animateProvider, $mdThemingProvider, $provide, lazyImgConfigProvider, CacheFactoryProvider, $stateProvider, $httpProvider) {
      // since Angularjs doesn't handle namespace collisions for services, place Cardkit authentication under Dashboard Authentication.cardkit property
      $provide.decorator('Authentication', ['$delegate', 'CardkitAuthentication', function($delegate, CardkitAuthentication) {
        var Authentication = angular.extend({}, CardkitAuthentication, $delegate);
        Authentication.cardkit = CardkitAuthentication;
        return Authentication;
      }]);

      $httpProvider.interceptors.push('cardkitAuthInterceptor')
      
      $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        'http://s3.amazonaws.com/cdn.cardkit.io/**',
        'https://s3.amazonaws.com/cdn.cardkit.io/**',
        'http://cdn.cardkit.io/**',
        'https://cdn.cardkit.io/**'
      ])

      var urlWhitelist = /^\s*((https?|ftp|mailto|file):|javascript:void\(0\))/;
      $compileProvider.aHrefSanitizationWhitelist(urlWhitelist)
      $compileProvider.imgSrcSanitizationWhitelist(urlWhitelist)

      gravatarServiceProvider.defaults = {
        size: 100,
        "default": 'mm'  // Mystery man as default for missing avatars
      };

      $animateProvider.classNameFilter(/^(?:(?!no-animate).)*$/)

      // $mdThemingProvider.theme('default').accentPalette('blue-grey')

      lazyImgConfigProvider.setOptions({
        offset: 100, // how early you want to load image (default = 100)
        errorClass: 'error', // in case of loading image failure what class should be added (default = null)
        successClass: 'success' // in case of loading image success what class should be added (default = null)
      })

      angular.extend(CacheFactoryProvider.defaults, {
        maxAge: 10 * 60 * 1000, // 10 min cache by default
        deleteOnExpire: 'aggressive'
      })

      function nested(state, extensions) {
        return _.extend({}, state, extensions);
      }

      var listPages = {
        title: 'Pages',
        url: '/pages',
        templateUrl: '/modules/cardkit/client/views/pages/list-pages.client.view.html',
        controller: 'PagesController',
        controllerAs: 'pages'
      };

      var editPage = {
        title: 'Edit page',
        url: '/pages/:pageId/edit',
        templateUrl: '/modules/cardkit/client/views/pages/page.builder.html',
        controller: 'PageBuilderController'
      };

      // Pages state routing
      $stateProvider.state('cardkit', {
        abstract: true,
        url: '/website/:accountId',
        template: '<div ui-view class="cardkit" ng-if="$root.selectedClient && $root.embedAuthorized"></div>' +
          '<link rel="stylesheet" href="/dist/cardkit.min.css"/>',
        controller: 'CardkitController'
      }).state('cardkit.listPages', listPages).state('cardkit.listPages_client', nested(listPages, {
        url: '/pages/:clientSlug'
      })).state('cardkit.editPage', editPage).state('cardkit.editPage_client', nested(editPage, {
        url: '/pages/:clientSlug/:pageId/edit'
      }));
    }
  ])

  .factory('appConfig', appConfig)
  // .constant('toastr', toastr)
  .run(run)

function appConfig(constants) {
  window.settings = window.settings || {};

  var config = {
    allPermissions: ['ViewMyCards', 'EditMyCards', 'ViewAllCards', 'EditAnyCard', 'ViewPurchasedCards', 'ViewDevPrice', 'SubmitOrders', 'ViewClientPrice', 'DeleteAnyCard', 'ClaimCards', 'CreateNewCards', 'RegisterUsers', 'SetUsersPermissions', 'CreatePosts', 'ManageOwnPosts', 'ManageAllPosts', 'PublishPosts'],
    devPermissions: ['ViewMyCards', 'EditMyCards', 'ViewDevPrice', 'ClaimCards', 'CreatePosts', 'ManageOwnPosts', 'ManageAllPosts', 'PublishPosts'],
    clientPermissions: [/*'ViewMyCards', 'ViewPurchasedCards', */'SubmitOrders', 'ViewClientPrice', 'CreateNewCards', 'CreatePosts', 'ManageOwnPosts', 'ManageAllPosts', 'PublishPosts'],
    teamPermissions: ['ViewMyCards', 'EditMyCards', 'ViewAllCards', 'EditAnyCard', 'ViewPurchasedCards', 'ClaimCards', 'CreateNewCards', 'CreatePosts', 'ManageOwnPosts', 'ManageAllPosts', 'PublishPosts'],
    contentContributorPermissions: ['CreatePosts', 'ManageOwnPosts', 'ManageAllPosts', 'PublishPosts'],
    allRoles: ['admin', 'team', 'client', 'developer', 'contentContributor'],
    pricing: [
      [750, 98, '1h 0m'],
      [750, 98, '1h 15m'],
      [750, 98, '1h 30m'],
      [750, 98, '1h 45m'],
      [1500, 195, '2h 0m'],
      [1500, 195, '2h 30m'],
      [1500, 195, '3h 0m'],
      [1500, 195, '3h 30m'],
      [1500, 195, '4h 0m'],
      [3000, 300, '4h 30m'],
      [3000, 300, '5h 0m'],
      [3000, 300, '5h 30m'],
      [4500, 450, '6h 0m'],
      [4500, 450, '6h 30m'],
      [4500, 450, '7h 0m'],
      [6000, 600, '8h 0m'],
      [6000, 600, '9h 0m'],
      [6000, 600, '10h 0m'],
      [7500, 750, '11h 0m'],
      [7500, 750, '12h 0m']
    ],
    credentialsAWS: window.settings.aws,
    credentialsFilepicker: window.settings.filepicker,
    credentialsIframely: window.settings.iframely,
    ratios: ['Full Width', 'Container Width', 'Video', '50 / 50', '60 / 40', '40 / 60', '70 / 30', '30 / 70', 'Thirds'],
    elements: ['Image', 'Text Area', 'Video', 'Background Color', 'Background Image', 'Text/Image Hover'],
    cardStatuses: ['To Do', 'In Progress', 'Ready for Team Review', 'Ready for Client Review', 'Edits Required', 'Approved - not listed', 'Approved'],
    pageStatuses: ['Live', 'Preview', 'Draft', 'Closed'],
    postStatuses: ['Draft', 'Schedule', 'Publish', 'Archive'],
    defaultImg: 'https://placeholdit.imgix.net/~text?txtsize=30&txt=height%20%C3%97%20width%20&w=200&h=150'
  };

  return angular.extend(config, constants);
}

run.$inject = ['$rootScope', '$state', 'uiHelpers', '$timeout', 'toastr'];
function run($rootScope, $state, uiHelpers, $timeout, toastr) {
  window.toastr = window.toastr || toastr;

  angular.extend($rootScope, uiHelpers)
  // $rootScope.hideNavbar = false;
  $rootScope.$on('$stateChangeSuccess', function(event, next) {
    if (next.title == undefined) $rootScope.title = "Cardkit";
    else $rootScope.title = "Cardkit | " + next.title;
    // $rootScope.hideNavbar = next.name == 'previewCard' || next.name == 'authentication.signin' || next.name == 'home';
    $rootScope.state = next || $state.current;
  })
}
