'use strict';

// Authorization service for user variables
angular.module('cardkit.users').service('Authorization', ['Authentication', 'AuthenticationSvc', '$state', '$rootScope', '$q', 'PostMessage', '$timeout', 'logger',
    function(Authentication, AuthenticationSvc, $state, $rootScope, $q, PostMessage, $timeout, logger) {
        var self = this;

        self.isAuthorized = function(state, user) {
            user = user || Authentication.cardkit.user;
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

        self.authorizeSellr = function(clientUri) {
            var defer = $q.defer();
            if (!clientUri) return $q.reject('client not specified');

            AuthenticationSvc.signout(true).then(function() {
                var timeoutTimer = $timeout(function() {
                    console.error('identify timeout');
                    defer.reject('identify timeout');
                    logger.error('Failed to load website builder due to authentication error');
                }, 5000);

                var dispose = PostMessage.on('identifyComplete', function(credentials) {
                    dispose(); // identify once
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
            var user = Authentication.cardkit.user;
            if (!user) return;

            switch (user.role) {
                case 'developer':
                    return $state.go('cardkit.myCards');
                case 'admin':
                    return $state.go('cardkit.listPages');
                case 'team':
                    return $state.go('cardkit.myCards');
                case 'client':
                    if (self.isAuthorized('listPages')) {
                        return $state.go('cardkit.listPages');
                    }
                    else if (self.isAuthorized('listPosts')) {
                        return $state.go('cardkit.listPosts');
                    }
                    else {
                        return $state.go('cardkit.profile');
                    }
                case 'contentContributor':
                    return $state.go('cardkit.listPosts');
                default:
                    return $state.go('cardkit.home');
            }
        };

        function resolve(rules) {
            return _.map(rules, function(rule) {
                return rule[0] === '!' ? rule.substr(1) : rule;
            });
        }
    }
]);
