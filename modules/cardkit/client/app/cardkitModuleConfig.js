var dependencies = [
  'ngAnimate',
  'ngCookies',
  'ngMaterial',
  'ngMdIcons',
  'ngResource',
  'ngSanitize',
  'ngTagsInput',
  'ngTouch',
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

ApplicationConfiguration.registerModule('cardkit', ['cardkit.pages', 'cardkit.cards', 'cardkit.users', 'cardkit.clients'])

angular.module('cardkit').config(['$sceDelegateProvider', '$compileProvider', 'gravatarServiceProvider', '$animateProvider', '$mdThemingProvider', '$provide', 'lazyImgConfigProvider', 'CacheFactoryProvider',
    function($sceDelegateProvider, $compileProvider, gravatarServiceProvider, $animateProvider, $mdThemingProvider, $provide, lazyImgConfigProvider, CacheFactoryProvider) {
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
    }
  ])

  .constant('appConfig', appConfig())
  // .constant('toastr', toastr)
  .run(run)

function appConfig() {
  window.settings = window.settings || {};
  return {
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
}

run.$inject = ['$rootScope', '$state', 'uiHelpers'];
function run($rootScope, $state, uiHelpers) {
  angular.extend($rootScope, uiHelpers)
  // $rootScope.hideNavbar = false;
  $rootScope.$on('$stateChangeSuccess', function(event, next) {
    if (next.title == undefined) $rootScope.title = "Cardkit";
    else $rootScope.title = "Cardkit | " + next.title;
    // $rootScope.hideNavbar = next.name == 'previewCard' || next.name == 'signin' || next.name == 'home';
    $rootScope.state = next || $state.current;
  })

  // if (_.isEmbedMode()) {
  //   $rootScope.$on('$stateChangeSuccess', function(event, next, nextParams) {
  //     var url = $state.href(next, nextParams)
  //     PostMessage.send('routeChange', url)
  //   })
  // }

  // fixSelectKeyboardNavigation()
  //
  // function fixSelectKeyboardNavigation() {
  //   // bootstrap attaches keydown event handlers that close Material Dropdown (md-select directive), reattach bootstrap handlers.
  //   var toggle = '[data-toggle="dropdown"]';
  //   var Dropdown = $.fn.dropdown.Constructor;
  //   $(document)
  //     .off('keydown.bs.dropdown.data-api', toggle + ', [role="menu"], [role="listbox"]', Dropdown.prototype.keydown)
  //     .on('keydown.bs.dropdown.data-api', toggle + ', :not(md-select-menu)[role="menu"], :not(md-select-menu)[role="listbox"]', Dropdown.prototype.keydown)
  //
  //   $(document).on('keydown', 'md-select-menu', function(e) {
  //     e.preventDefault(); // stop scrolling dropdown in keyboard navigation
  //   })
  // }
}

// //Then define the init function for starting up the application
// angular.element(document).ready(function() {
//   //Fixing facebook bug with redirect
//   if (window.location.hash === '#_=_') window.location.hash = '#!';
//
//   //Then init the app
//   angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName])
// })
