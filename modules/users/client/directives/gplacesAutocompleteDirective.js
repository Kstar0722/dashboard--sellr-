/* globals angular, google */
angular.module('core')
  .directive('gplacesAutocomplete', function ($timeout) {
    return {
      restrict: 'E',
      scope: {
        gplaceHandler: '&'
      },
      template: '<input type="text" placeholder="Search" id="gplaces-input" class="autocomplete-input">',
      link: function (scope, element, attrs, ctrl) {
        var htmlInput = document.getElementById('gplaces-input')
        var options = {
          types: ['establishment'],
          componentRestrictions: {country: 'us'}
        }
        var autocomplete = new google.maps.places.Autocomplete(htmlInput, options)

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function (geolocation) {
            var circle = new google.maps.Circle({
              center: geolocation,
              radius: 3000
            })
            autocomplete.setBounds(circle.getBounds())
          });
        }

        autocomplete.addListener('place_changed', function () {
          var place = autocomplete.getPlace()
          // // hide keyboard on selection
          if (document.activeElement) document.activeElement.blur()
          angular.element(document.body).removeClass('keyboard-open');
          scope.gplaceHandler({gPlace: place})
        })
        // this workaround is needed because of fastclick or doubletap issue
        $timeout(function () {
          var container = document.getElementsByClassName('pac-container')
          // disable ionic data tab
          angular.element(container).attr('data-tap-disabled', 'true')
          // leave input field if google-address-entry is selected
          angular.element(container).on('click', function () {
            document.getElementById('type-selector').blur()
          })
        }, 800)
      }
    }
  })
