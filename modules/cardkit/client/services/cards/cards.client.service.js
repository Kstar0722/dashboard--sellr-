'use strict';

//Cards service used to communicate Cards REST endpoints
angular.module('cardkit.cards')

    .factory('Cards', ['$resource', 'appConfig',
        function($resource, appConfig) {
            return $resource(appConfig.CARDKIT_URL + '/cards/:cardId/:controller', {
                cardId: '@_id', clientId: '@clientId'
            }, {
                update: {
                    method: 'PUT'
                },
                claim: {
                    method: 'PUT',
                    params: {
                        controller: 'claim'
                    }
                },
                removeClaim: {
                    method: 'PUT',
                    params: {
                        controller: 'removeClaim'
                    }
                }
            });
        }
    ]);
