
'use strict';

angular.module('core').controller('HeaderController', [ '$scope', 'Authentication', 'Menus', '$http', '$window', '$state',
    function ($scope, Authentication, Menus, $http, $window, $state) {
        $scope.authentication = Authentication;
        $scope.ui = {};
        $scope.$state = $state;

        var originatorEv;
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');
        console.log('menus %O', $scope.menu);

        //
        //
        //var user = {{ user | json | safe }};
        //
        //
        //
        //window.intercomSettings = {
        //    app_id: "ugnow3fn",
        //    name: '{{user.displayName}}', // Full name
        //    email: '{{user.email}}', // Email address
        //    created_at:'{{user.created | json | safe}}'// Signup date as a Unix timestamp
        //};
        //(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',intercomSettings);}else{var
        // d=document;var i=function(){i.c(arguments)};i.q=[];i.c=function(args){i.q.push(args)};w.Intercom=i;function l(){var
        // s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/ugnow3fn';var
        // x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);}if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})()</script>
        //


        $scope.toggleCollapsibleMenu = function () {
            $scope.isCollapsed = !$scope.isCollapsed;
        };
        $scope.openMenu = function($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };
        $scope.signOut = function () {
            window.localStorage.clear();
            localStorage.clear();
            $window.localStorage.clear();
            $window.location.href = '/auth/signout';

            // $http.get('/auth/signout')
            //     .success(function () {
            //         window.localStorage.clear();
            //         localStorage.clear();
            //         $window.localStorage.clear();
            //
            //         $window.location.href = '/';
            //     })
            //     .error(function (err) {
            //         console.log('error', err);
            //     })
        };

        //$scope.$watch('ui.toolbarOpened', function (opened) {
        //    if (!opened) {
        //        $scope.ui.toolbarOpened = true;
        //    }
        //});

        // Collapsing the menu after navigation
        //$scope.$on('$stateChangeSuccess', function () {
        //    $scope.isCollapsed = false;
        //});
    }
]);
