angular.module('core').controller('StoreOwnerMarketingSettingsController', function ($scope, constants, accountsService, $stateParams, $state) {
  console.log('StoreOwnerMarketingSettingsController');

  $scope.analyticsItem;

  $scope.analyticsItems = [];

  /*
  * Create form to request access token from Google's OAuth 2.0 server.
  */
  $scope.googleAuth = function oauthSignIn() {
    // Google's OAuth 2.0 endpoint for requesting an access token
    var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

    // Create <form> element to submit parameters to OAuth 2.0 endpoint.
    var form = document.createElement('form');
    form.setAttribute('method', 'GET'); // Send as a GET request.
    form.setAttribute('action', oauth2Endpoint);

    // Parameters to pass to OAuth 2.0 endpoint.
    var params = {
      'client_id': '980923677656-4td6h98v1s9gd05kg3i9qee787sgsca5.apps.googleusercontent.com',
      'redirect_uri': 'http://localhost:3000/storeOwner/marketing/channels',
      'response_type': 'code',
      'access_type': 'offline',
      'scope': 'https://www.googleapis.com/auth/analytics.readonly',
      'include_granted_scopes': 'true',
      'state': 'state_parameter_passthrough_value'
    };

    // Add form parameters as hidden input values.
    for (var p in params) {
      var input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', p);
      input.setAttribute('value', params[p]);
      form.appendChild(input);
    }

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();

    // Example reponse
    // http://localhost:3000/storeOwner/marketing/channels#state=pass-through+value
    // &access_token=ya29.GltJBOOtiZ2qKKMS1VG_KyDI_OC9a5E77vS7eN3dQEr9DSILupR8LYHjGUibL3Pbmi6s0dOSpeYySteGa2lV-v9ev88_TrkTCJS_CaHIM6Q5AI5-uUxbiRxeoeOM
    // &token_type=Bearer
    // &expires_in=3600
    // &scope=https://www.googleapis.com/auth/analytics.readonly
  }

  $scope.saveAnalyticsItem = function(item) {
    if(item) {
      accountsService.getCurrentAccount.then(function(account) {
        account.preferences.analytics.item = item.id;
        return accountsService.updateAccount(account);
      });
    }
  }

  $scope.revokeGoogleAuth = function() {
    accountsService.getCurrentAccount.then(function(account) {
      return $.ajax({
        url: 'https://accounts.google.com/o/oauth2/revoke',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'jsonp',
        data: {
          token: account.preferences.analytics.refresh_token
        }
      }).then(function(response) {
        return account;
      });
    }).then(function(account) {
      delete account.preferences.analytics;
      $scope.account = account;
      return accountsService.updateAccount(account);
    });
  }

  var init = function () {
    accountsService.getCurrentAccount.then(function(account) {
      $scope.account = account;
      $.ajax({
        type: 'POST',
        url: 'https://www.googleapis.com/oauth2/v4/token',
        data: {
          client_id: '980923677656-4td6h98v1s9gd05kg3i9qee787sgsca5.apps.googleusercontent.com',
          client_secret: 'ETc5D1hO_JYb3Wemqhr41jTq',
          grant_type: 'refresh_token',
          refresh_token: account.preferences.analytics.refresh_token
        }
      }).then(function(response) {
        return $.ajax({
          type: 'GET',
          url: 'https://www.googleapis.com/analytics/v3/management/accounts/~all/webproperties/~all/profiles',
          headers: {
            Authorization: `Bearer ${response.access_token}`
          }
        });
      }).then(function(response) {
        response.items.forEach(function(item) {
          $scope.analyticsItems.push({
            id: item.id,
            name: `${item.websiteUrl} (${item.name})`,
          });
        });
        if(account.preferences.analytics.item) {
          for(var key in $scope.analyticsItems) {
            if($scope.analyticsItems[key].id == account.preferences.analytics.item) {
              $scope.analyticsItem = $scope.analyticsItems[key];
              break;
            }
          }
        }
      });
    });
    if(window.location.search) {
      var search = window.location.search.slice(1),
          pairs = {},
          pair;
      search.split('&').forEach(function(current) {
        pair = current.split('=');
        if(pair.length == 2) {
          pairs[pair[0]] = decodeURIComponent(pair[1]);
        }
      });
      if(pairs.code) {
        // TODO: this request should be relayed through an endpoint on Sellr's API
        $.ajax({
          type: 'POST',
          url: 'https://www.googleapis.com/oauth2/v4/token',
          contentType: 'application/x-www-form-urlencoded',
          data: {
            code: pairs.code,
            client_id: '980923677656-4td6h98v1s9gd05kg3i9qee787sgsca5.apps.googleusercontent.com',
            client_secret: 'ETc5D1hO_JYb3Wemqhr41jTq',
            grant_type: 'authorization_code',
            redirect_uri: 'http://localhost:3000/storeOwner/marketing/channels'
          }
        }).then(function(response) {
          return accountsService.getCurrentAccount.then(function(account) {
            accountsService.currentAccount = account;
            return {
              oauth2: response,
              account: account
            };
          });
        }).then(function(data) {
          data.oauth2.code = pairs.code;
          data.account.preferences.analytics = data.oauth2;
          return accountsService.updateAccount(data.account);
        });
      }
    }
  };

  init();
})
