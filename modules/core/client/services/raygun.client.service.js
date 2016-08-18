angular.module('core').config(function ($provide) {
    $provide.decorator("$exceptionHandler", [ '$delegate', 'Authentication', function ($delegate, Authentication) {
        return function (exception, cause) {
            if (window.Raygun) Raygun.send(exception, { cause: cause, user: Authentication.user });
            $delegate(exception, cause);
        }
    } ])
});

