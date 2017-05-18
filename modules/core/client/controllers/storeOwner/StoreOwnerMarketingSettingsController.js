angular.module('core').controller('StoreOwnerMarketingSettingsController', function ($scope, constants, accountsService, $stateParams, $state) {
  console.log('StoreOwnerMarketingSettingsController');

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
    var params = {'client_id': '980923677656-4td6h98v1s9gd05kg3i9qee787sgsca5.apps.googleusercontent.com',
                  'redirect_uri': 'http://localhost:3000/storeOwner/marketing/channels',
                  'response_type': 'code',
                  'access_type': 'offline',
                  'scope': 'https://www.googleapis.com/auth/analytics.readonly',
                  'include_granted_scopes': 'true',
                  'state': 'state_parameter_passthrough_value'};

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

  var init = function () {
    // check if there is query in url
    // and fire search in case its value is not empty
    /*if (window.location.hash) {
      var googleUrl = window.location.hash
      console.log(googleUrl);
      var tempAccessToken = googleUrl.match(/\&(?:access_token)\=([\S\s]*?)\&/)[1];
      localStorage.setItem('ga_auth', tempAccessToken);
      //$cookies.put('googleAccessToken', tempAccessToken);
    }*/
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
      console.log(pairs);
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
          return $.ajax({
            type: 'GET',
            url: `${constants.API_URL}/accounts/${accountsService.selectAccountId}`,
            contentType: 'application/json',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
        }).then(function(account) {
          account = account[0];
          account.preferences.ga_oauth2 = pairs.code;
          return accountsService.updateAccount(account);
        });
      }
    }
  };
  // and fire it after definition
  init();
})
