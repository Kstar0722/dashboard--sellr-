'use strict';

// Authorization service for user variables
angular.module('cardkit.users').service('Authorization', ['Authentication', 'AuthenticationSvc', '$state', '$rootScope', '$q', 'PostMessage', '$timeout',
    function(Authentication, AuthenticationSvc, $state, $rootScope, $q, PostMessage, $timeout) {
        var self = this;

        self.isAuthorized = function(state, user) {
            user = user || Authentication.user;
            state = typeof state == 'string' ? $state.get(state) : state;

            var authRules = state.authorize;

            // unauthorized if not signed in
            if (!user) return false;

            // check the same authorization provider used
            if (user.provider && user.provider != (_.isEmbedMode() ? 'sellr' : 'local')) return false;

            // allow by default if no rules specified
            if (authRules === undefined || authRules === null) return true;

            // allow everything for admins
            if (user && user.role == 'admin') return true;

            var authorized = typeof authRules == 'boolean' ? authRules : true;
            if (!authorized || !user || !user.role) return authorized;

            authRules = _.compact(authRules instanceof Array ? authRules : [authRules]);
            if (!authRules.length) return authorized;

            var denyRules = _.filter(authRules, function(rule) {
                return rule[0] === '!';
            });
            var allowRules = _.difference(authRules, denyRules);

            // evaluate deny rules
            authorized = authorized && !_.contains(resolve(denyRules), user.role);
            authorized = authorized && !_.intersection(resolve(denyRules), user.permissions).length;

            // evaluate allow rules
            authorized = authorized && (!allowRules.length
                || _.contains(resolve(allowRules), user.role)
                || _.intersection(resolve(allowRules), user.permissions).length > 0);

            return authorized;
        };

        self.authorizeSellr = function(url) {
            if ($rootScope.embedAuthorized) return $q.when(Authentication.user);

            var defer = $q.defer();
            var clientUri = decodeURIComponent((url && url.match(/pages\/([^\/]+)/i) || [])[1] || '');
            if (!clientUri) return defer.reject('client not specified');

            AuthenticationSvc.signout(true).then(function() {
                var timeoutTimer = $timeout(function() {
                    console.error('identify timeout');
                    defer.reject('identify timeout');
                    toastr.error('Failed to load website builder due to authentication error');
                }, 5000);

                PostMessage.on('identifyComplete', function(credentials) {
                    $timeout.cancel(timeoutTimer);
                    credentials.provider = 'sellr';
                    credentials.clientUri = clientUri;
                    AuthenticationSvc.signin(credentials, true).then(function(user) {
                        $rootScope.embedAuthorized = true;
                        return user;
                    }).then(defer.resolve, defer.reject);
                });

                PostMessage.send('identify');
            }).catch(defer.reject);

            return defer.promise;
        };

        self.goToLandingPage = function() {
            var user = Authentication.user;
            if (!user) return;

            switch (user.role) {
                case 'developer':
                    return $state.go('myCards');
                case 'admin':
                    return $state.go('listPages');
                case 'team':
                    return $state.go('myCards');
                case 'client':
                    if (self.isAuthorized('listPages')) {
                        return $state.go('listPages');
                    }
                    else if (self.isAuthorized('listPosts')) {
                        return $state.go('listPosts');
                    }
                    else {
                        return $state.go('profile');
                    }
                case 'contentContributor':
                    return $state.go('listPosts');
                default:
                    return $state.go('home');
            }
        };

        function resolve(rules) {
            return _.map(rules, function(rule) {
                return rule[0] === '!' ? rule.substr(1) : rule;
            });
        }
    }
]);
