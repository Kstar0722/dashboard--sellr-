'use strict'
/* globals angular, moment, _ */
angular.module('users')
  .controller('GetStartedController', ['$scope', '$state', '$stateParams', '$timeout', '$sce', 'storesService', 'Authentication', 'accountsService', '$q', 'toastr', 'Users', '$analytics', 'productsService', 'authenticationService', '$window',
    function ($scope, $state, $stateParams, $timeout, $sce, storesService, Authentication, accountsService, $q, toastr, Users, $analytics, productsService, authenticationService, $window) {
      var DEFAULT_ROLES = [1002, 1003, 1009]; // store owner

      $scope.data = {
        user: {},
        store: {},
        importCategories: [],
        appStoreLink: 'https://itunes.apple.com/pl/app/sellr-store/id1178096858',
        googlePlayLink: '' // todo
      };

      $scope.ui = { step: 0 };
      $scope.scope = $scope;
      $scope.checkedColor = { label: 'Green', color: '#2DC89A', font: '#FFF' };
      $scope.template_categories = [];

      $scope.goNextStep = function () {
        if ($scope.ui.step == 0) {
          $analytics.eventTrack('Custom Install', {});
        }
        if ($scope.ui.step == 1) {
          $analytics.eventTrack('Onboarding: Step 1', {});

          return
        }
        if ($scope.ui.step == 2 && $scope.ui.storeEditorView) {
          if ($scope.storeForm.$invalid) {
            $scope.$broadcast('show-errors-check-validity', 'storeForm');
            $window.scrollTo(0, 0);
            return false;
          }
          $analytics.eventTrack('Onboarding: Step 2', {});
        }

        if ($scope.ui.step == 3 && !$scope.ui.addProductsView) {
          $analytics.eventTrack('Onboarding: Step 3', {});
          $scope.ui.addProductsView = true;
          return;
        }

        $scope.ui.step++;
      };

      $scope.goPrevStep = function () {
        var step = $scope.ui.step;

        if (step == 0) {
          return $state.go('home');
        }
        else if (step == 2 && $scope.ui.storeEditorView) {
          $scope.data.storeSelected = null;
          $scope.ui.storeEditorView = false;
          $scope.ui.enterStoreManually = false;
          return;
        }
        else if (step == 3 && $scope.ui.addProductsView) {
          $scope.data.importCategories = ($scope.template_categories || []).map(initCategory);
          $scope.ui.addProductsView = false;
          return;
        }

        $scope.ui.step--;
      };

      $scope.createUser = function () {
        if ($scope.userForm.$invalid) {
          $scope.$broadcast('show-errors-check-validity', 'userForm');
          return false;
        }

        var data = $scope.data;
        var user = mapUser(data);

        // skip roles because they depend on the account, which is not created yet. will be updated once onboarding complete.
        user.noRoles = true;

        $scope.ui.busy = true;
        $scope.ui.alreadyRegistered = false;

        Users.create(user).then(function (newUser) {
          loadUser(newUser);
          $scope.ui.step++;
        }).catch(function (response) {
          if (response.data.name == 'AlreadyRegistered') {
            $scope.ui.alreadyRegistered = true;
          }
        }).finally(function () {
          $scope.ui.busy = false;
        })
      };

      $scope.createStore = function () {
        if ($scope.storeForm.$invalid) {
          $scope.$broadcast('show-errors-check-validity', 'storeForm');
          return false;
        }

        var data = $scope.data;
        var account = mapAccount(data);
        var store = angular.copy(data.store);

        $scope.ui.busy = true;
        accountsService.createAccount(angular.extend({}, account, { store: store })).then(function (newAccount) {
          store.accountId = newAccount.accountId;
          store.storeId = newAccount.storeId;

          var user = data.newUser;
          user.accountId = newAccount.accountId;
          user.roles = DEFAULT_ROLES;

          return Users.put(user).then(function () {
            return addCategories(store, data.importCategories).then(function () {
              $scope.ui.step++;
            });
          });
        }).catch(function (response) {
          console.error(response.data);
          toastr.error('Failed to create new store');
        }).finally(function () {
          $scope.ui.busy = false;
        });
      };

      $scope.pickStore = function (store) {
        $scope.data.storeSelected = store;
        $scope.data.store = store;
        $scope.ui.storeEditorView = true;
        $scope.ui.enterStoreManually = false;
      };

      $scope.enterStore = function () {
        $scope.data.storeSelected = null;
        $scope.data.store = {};
        $scope.ui.storeEditorView = true;
        $scope.ui.enterStoreManually = true;
      };

      $scope.openDashboard = function () {
        var user = mapUser($scope.data);

        if (!user.password) {
          return $state.go('authentication.signin', { email: user.email });
        }

        $scope.ui.busy = true;
        return authenticationService.signin(user).then(function () {
          $state.go('home');
        }).catch(function(err) {
          toastr.error(err.data.message);
        }).finally(function () {
          $scope.ui.busy = false;
        })
      };

      $scope.gplaceHandler = function (gPlace) {
        $timeout(function(){
          var store = convertGooglePlaceToStore(gPlace)
          $scope.pickStore(store)
        })
      }

      $scope.initForm = function (form) {
        $scope[form.$name] = form;
      };

      $scope.nextEnabled = function (step) {
        if ($scope.ui.busy) return false;
        var data = $scope.data;
        if (step == 0) return data.name;
        if (step == 1) return data.user.email;
        if (step == 2 && $scope.ui.storeEditorView) return data.store;
        return true;
      };

      $scope.fullscreen = function () {
        return $scope.ui.step == 2 && $scope.ui.storeEditorView
            || $scope.ui.step == 3 && $scope.ui.addProductsView;
      };

      $scope.stepClasses = function (step) {
        var currentStep = $scope.ui.step || 0;
        return [
          'step-' + step,
          step == currentStep ? 'current' : '',
          step < currentStep ? 'passed' : '',
        ];
      };

      $scope.$watch('data.storeSelected', initStore);
      $scope.$watch('data.store', initStore);

      init();

      function init() {
        productsService.getTemplates('top_selling').then(function (templates) {
          $scope.data.importCategories = $scope.template_categories = templates;
        });

        if ($stateParams.step == 2 && Authentication.user) {
          loadUser(Authentication.user);
          $scope.data.user.password = $stateParams.password; // used for auto sign-in once onboarding finished
        }

        if ($stateParams.step) {
          $scope.ui.step = parseInt($stateParams.step, 10);
        }
      }

      function initStore(store) {
        if (!store) return;
        storesService.initWorkSchedule(store);
        store.workSchedule = store.details.workSchedule;
        return store;
      }

      function initCategory(category) {
        if (!category) return category;
        if (category.color instanceof Array) category.color = null;
        return category;
      }

      function loadUser(user) {
        if (!user) return;
        var data = $scope.data;
        data.user.email = user.email;
        data.user.userId = user.userId;
        data.firstName = user.firstName || (user.displayName || '').split(' ')[0];
        data.newUser = user;
        return user;
      }

      function time(hour, min) {
        return new Date(0, 0, 1, hour, min);
      }

      function mapAccount(data) {
        var contactInfo = data.store.details.contactInfo || {};

        var account = {
          name: data.store.name,
          email: contactInfo.email,
          phone: contactInfo.phone,
          address: ((contactInfo.address1 || '') + '\n' + (contactInfo.address2 || '')).trim(),
          city: contactInfo.city,
          state: contactInfo.state,
          zipCode: contactInfo.zipcode,
          contactName: data.user.name
        };

        return account;
      }

      function mapUser(data) {
        var user = {
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          phone: data.user.phone,
          password: data.user.password,
          noRoles: false
        };

        return user;
      }

      function addCategories(store, categories) {
        var selectedCategories = _.filter(categories, { selected: true });
        if (_.isEmpty(selectedCategories)) return $q.resolve([]);

        var newCategories = _.map(selectedCategories, function (category) {
          var category = {
            label: category.label,
            accountId: store.accountId,
            storeId: store.storeId,
            color: category.color,
            products: _.map(category.products, mapNewProduct)
          };

          return category;
        });

        return $q.all(_.map(newCategories, productsService.createCategory));
      }

      function mapNewProduct(product) {
        if (!product) return;

        var newProduct = {
          name: product.name,
          skus: product.skus,
          productId: product.productId,
          productTypeId: product.productTypeId,
          image: product.image,
          notes: product.notes
        };

        return newProduct;
      }

      function convertGooglePlaceToStore (gPlace) {
        console.log(gPlace)
        var store = {}
        store.details = {}
        store.details.contactInfo = {}

        // Easy Fields
        store.name = gPlace.name
        store.details.contactInfo.phone = gPlace.formatted_phone_number

        // Address mapping
        var temp = _.find(gPlace.address_components, function (obj) { return obj.types[0] === 'street_number' })
        var streetNumber = temp.short_name || ''

        temp = _.find(gPlace.address_components, function (obj) { return obj.types[0] === 'route' })
        var streetName = temp.short_name || ''

        store.details.contactInfo.address1 = streetNumber + ' ' + streetName

        temp = _.find(gPlace.address_components, function (obj) { return obj.types[0] === 'locality' })
        store.details.contactInfo.city = temp.short_name || ''

        temp = _.find(gPlace.address_components, function (obj) { return obj.types[0] === 'administrative_area_level_1' })
        store.details.contactInfo.state = temp.short_name || ''

        temp = _.find(gPlace.address_components, function (obj) { return obj.types[0] === 'postal_code' })
        store.details.contactInfo.zipcode = temp.short_name || ''

        // Work Schedule Mapping
        store.details.workSchedule = []
        if (gPlace.opening_hours && gPlace.opening_hours.periods) {
          var periods = gPlace.opening_hours.periods
          for (var i = 0; i < 7; i++) {
            var gTimesForToday = findTodayTimes(periods, i)
            var dayObj = {}
            if (gTimesForToday) {
              dayObj.openTime = moment(gTimesForToday.openTime, 'HHmm').toDate()
              dayObj.closeTime = moment(gTimesForToday.closeTime, 'HHmm').toDate()
            }
            store.details.workSchedule.push(dayObj)
          }
          // Google starts with Sunday we need to move it to the end
          var splicedArray = store.details.workSchedule.splice(0, 1)
          store.details.workSchedule = store.details.workSchedule.concat(splicedArray)
        }
        return store
      }

      // Google returns the array that not always is 7 length
      function findTodayTimes (periods, i) {
        var period = _.find(periods, function (p) { return p.open.day === i })
        if (_.isUndefined(period)) {
          return false
        }
        return {openTime: period.open.time, closeTime: period.close.time}
      }
    }]);
