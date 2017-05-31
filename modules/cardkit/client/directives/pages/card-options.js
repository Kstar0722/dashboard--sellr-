(function() {
    'use strict';

    angular
        .module('cardkit.pages')
        .directive('cardOptions', cardOptions);

    cardOptions.$inject = ['cardData', '$rootScope', 'logger', 'editorService', 'Cards', '$timeout', 'cardsHelper', 'pagesHelper', '$http', '$q', 'Clients', 'appConfig'];

    function cardOptions(cardData, $rootScope, logger, editorService, Cards, $timeout, cardsHelper, pagesHelper, $http, $q, Clients, appConfig) {
        var updateHtmlDependenciesDebounced = _.debounce(updateHtmlDependencies, 500);

        return {
            restrict: 'E',
            templateUrl: '/modules/cardkit/client/directives/pages/card-options.html',
            scope: {
                cards: '=',
                pages: '=',
                client: '=',
                templateCards: '=',
                mediaLibrary: '='
            },
            link: function(scope, element, attrs, ctrs) {
                scope.$scope = scope;
                scope.card = cardData.getActiveCard;
                scope.ui = {};
                loadIntegrations(scope.client);

                scope.Math = Math;

                scope.setValue = function(shortCode, value, extra) {
                    var action = _.findItemByKey(scope.card().actions, shortCode);

                    if (action && extra !== undefined) {
                        var variable = _.findWhere(scope.card().variables, { shortCode: shortCode });

                        if (action && variable && variable.kind == 'Pages List') {
                            var suffix = extra && extra != '_self' ? '#~' + extra : '';
                            value = (value || '').split('#~')[0] + suffix;
                            $timeout(function() {
                                $('a[href="' + value + '"]').each(function() {
                                    $(this).attr('href', value).attr('target', extra);
                                });
                            }, 50);
                        }
                    }

                    if (action && action[shortCode] != value) {
                        action[shortCode] = value;
                        updateDependencies(scope, shortCode);
                        updateHtmlDependenciesDebounced(scope, shortCode);
                    }

                    console.log(shortCode + ":" + value);
                    $rootScope.$emit('updateCardHtml');
                    scope.card().changed = true;

                    return value;
                };

                scope.showVideoTutorial = function() {
                    $('#videoTutorial').modal2('show');
                }

                scope.updateCard = function(force) {
                    var card = scope.card();
                    var recentCard = findRecentCard(scope.cards, card);
                    if (!recentCard) return logger.error('Can\'t update card since it has been removed');

                    // fetch the latest card changes from backend
                    Cards.get({ cardId: _.id(recentCard) }).$promise.catch(function(err) {
                        console.warn('unable to fetch recent changes', err);
                        // throw err;
                        return recentCard; // continue the flow below with local card
                    }).then(function(recentCard) {
                        if (!recentCard) return logger.error('Can\'t update card since it has been removed');
                        recentCard = pagesHelper.adoptPageDataStructure(recentCard);

                        var oldCard = new Cards(angular.copy(card));

                        var $oldOriginalEditables = extractEditables(cardsHelper.compileCardHtml(oldCard.original_html || oldCard.html, oldCard));
                        var $newEditables = extractEditables(cardsHelper.compileCardHtml(recentCard.html, recentCard));

                        if (!force && hasTextConflicts($oldOriginalEditables, $newEditables)) {
                            return $('#confirmCardConflictsResolution').modal2('show');
                        }

                        angular.extend(card, recentCard);
                        card.client = _.id(oldCard.client);
                        card.clients = _.map(oldCard.clients, _.id);
                        card.original_html = card.original_html || oldCard.original_html;

                        // restore actions from old card
                        _.each(oldCard.actions, function(action) {
                            var shortCode = _.keys(action)[0];
                            var newAction = _.findItemByKey(card.actions, shortCode);
                            if (!newAction) return;
                            newAction[shortCode] = action[shortCode];
                        });

                        var $oldEditables = extractEditables(cardsHelper.compileCardHtml(oldCard.html, oldCard));
                        card.html = restoreTextChanges(cardsHelper.compileCardHtml(card.html, card), $oldEditables);

                        refreshCard(scope.$parent.newPage.cards, card);
                        scope.$parent.isPageDirty = true;

                        if (force) {
                            $('#confirmCardConflictsResolution').modal2('hide');
                        }
                    });
                };

                scope.isEmpty = function(input) {
                    if (!input) return;
                    var value = input.valueSelected || input.value;
                    return !value || value == ('{{' + input.shortCode + '}}');
                };

                scope.selectDropdownConfig = {
                    create: false,
                    maxItems: 1,
                    allowEmptyOption: true,
                    labelField: 'value',
                    valueField: 'value',
                    searchField: 'value',
                    sortField: 'value',
                    onChange: function(value) {
                        if (value === '') {
                            // reset to display placeholder
                            this.setValue(null);
                        }
                    }
                };

                scope.selectTemplateConfig = {
                    create: false,
                    maxItems: 1,
                    allowEmptyOption: true,
                    labelField: 'name',
                    valueField: 'url',
                    searchField: ['name', 'url'],
                    sortField: 'name',
                    onChange: function(value) {
                        if (value === '') {
                            // reset to display placeholder
                            this.setValue(null);
                        }
                    }
                };

                scope.selectPageConfig = {
                    create: true,
                    createOnBlur: true,
                    maxItems: 1,
                    allowEmptyOption: true,
                    preload: true,
                    valueField: 'absolutePath',
                    labelField: 'name',
                    sortField: 'name',
                    searchField: ['name', 'absolutePath'],
                    load: function(query, callback) {
                        if (!scope.pages) return;
                        var builderScope = scope.$parent;
                        scope.pages.then(function(pages) {
                            var clientId = _.id(builderScope.client || builderScope.pageClient || builderScope.selectedClient || scope.card().client);
                            var result = _.filter(pages, function(p) {
                                return _.id(p.client) == _.id(clientId) || p.client && p.client.companyName == clientId;
                            });
                            result.unshift({ url: '', path: '', name: 'No page' });

                            var selectedClient = scope.$parent.pageClient;
                            _.each(result, function(page) {
                                page.absolutePath = _.absPageUrl(page, selectedClient);
                            });

                            callback(result);
                        });
                    },
                    onLoad: function(data) {
                        var pagesUrls = _.pluck(data, this.settings.valueField);
                        var input = this.$control.scope().input || {};
                        if (input.valueSelected && !_.contains(pagesUrls, input.valueSelected)) {
                            this.addOption({ name: input.valueSelected, absolutePath: input.valueSelected });
                            console.log('added', input.valueSelected);
                        }
                    },
                    onChange: function(value) {
                        if (value === '') {
                            // reset to display placeholder
                            this.setValue(null);
                        }
                    }
                };

                scope.selectMailchimpListConfig = {
                    create: false,
                    maxItems: 1,
                    valueField: 'subscribe_url_long',
                    labelField: 'name',
                    sortField: 'name',
                    searchField: ['name', 'absolutePath'],
                    onInitialize: function(selectize) {
                        var config = scope.selectMailchimpListConfig
                        config.selectize = selectize;
                        scope.refreshMailchimp(config).then(function(lists) {
                            config.options = lists;
                        });
                    },
                    onChange: function(value) {
                        if (!value && value !== null) {
                            // reset to display placeholder
                            this.setValue(null);
                        }
                    }
                };

                scope.selectStripeProductsListConfig = {
                    create: false,
                    maxItems: 1,
                    valueField: 'id',
                    labelField: 'namePrice',
                    sortField: 'name',
                    searchField: ['name', 'caption'],
                    onInitialize: function(selectize) {
                        var config = scope.selectStripeProductsListConfig;
                        config.selectize = selectize;
                        scope.refreshStripeProducts(config).then(function(lists) {
                            config.options = lists;
                        });
                    },
                    onChange: function(value) {
                        if (!value && value !== null) {
                            // reset to display placeholder
                            this.setValue(null);
                        }
                    }
                };

                scope.refreshMailchimp = function(config, reload) {
                    config.refreshing = true;

                    var settingsLoaded = scope.ui.mailchimp;

                    if (reload || !scope.ui.mailchimp.enabled) {
                        // refresh client integrations
                        settingsLoaded = Clients.get({ clientId: scope.client._id }).$promise.then(function(client) {
                            scope.client = client;
                            return loadIntegrations(client);
                        });
                    }

                    return $q.when(settingsLoaded).then(function() {
                        if (!scope.ui.mailchimp.enabled || !scope.ui.mailchimp.token) return $q.reject('mailchimp not integrated');
                        return $http.get(appConfig.CARDKIT_URL + '/proxy/mailchimp/lists?apikey=' + scope.ui.mailchimp.token).then(function(response) {
                            var lists = _.map(response.data.lists, function(list) {
                                list.subscribe_url_long = (list.subscribe_url_long || '').replace(/\.list-manage\d*/i, '.list-manage');
                                return list;
                            });
                            return lists;
                        }).then(function(lists) {
                            // reload mailchimp dropdown options
                            return reloadOptions(config, lists);
                        });
                    }).finally(function() {
                        config.refreshing = false;
                    });
                };

                scope.refreshStripeProducts = function(config, reload) {
                    config.refreshing = true;

                    var settingsLoaded = scope.ui.stripe;

                    if (reload || !scope.ui.stripe.enabled) {
                        // refresh client integrations
                        settingsLoaded = Clients.get({ clientId: scope.client._id }).$promise.then(function(client) {
                            scope.client = client;
                            return loadIntegrations(client);
                        });
                    }

                    return $q.when(settingsLoaded).then(function() {
                        if (!scope.ui.stripe.enabled || !scope.ui.stripe.secretKey) return $q.reject('stripe not integrated');
                        return $http.get(appConfig.CARDKIT_URL + '/stripe/' + _.id(scope.client) + '/products?active=true').then(function(response) {
                            var products = response.data.data;
                            _.each(products, function(p) {
                                p.namePrice = p.name + (p.price ? ' - $' + p.price : '');
                            });
                            return products;
                        }).then(function(lists) {
                            // reload stripe products in dropdown
                            return reloadOptions(config, lists);
                        });
                    }).finally(function() {
                        config.refreshing = false;
                    });
                };

                scope.$on('resetOpts', function() {
                    scope.dropOpts = [];
                    scope.inputOpts = [];
                    scope.areaOpts = [];
                    scope.checkOpts = [];
                    scope.fileOpts = [];
                    scope.videoOpts = [];
                    scope.pageOpts = [];
                    scope.repeatOpts = [];
                    scope.templateVariableOpts = [];
                    scope.mailchimpListOpts = [];
                    scope.stripeProductsListOpts = [];
                });

                scope.$watch(function() {
                    return cardData.getActiveCard()
                }, function(newValue) {
                    if (newValue) {
                        scope.cardFile = newValue;
                        if (scope.cardFile) {
                            if (scope.cardFile.cardTutorial) {
                                scope.videoTutorial = scope.cardFile.cardTutorial.url;
                            }

                            var builderScope = scope.$parent;
                            scope.cardFile.client = builderScope.client || builderScope.pageClient || scope.cardFile.client;
                        }

                        listVariables(scope, newValue);
                    }
                });

                function loadIntegrations(client) {
                    client = client || {};
                    scope.integrations = client.integrations || {};
                    scope.ui.mailchimp = scope.integrations.mailchimp || {};
                    scope.ui.stripe = scope.integrations.stripe || {};
                    return scope.integrations;
                }
            }
        };

        function extractEditables(html) {
            var cleanHtml = cardsHelper.cleanUpCardHtml(html);
            return $(cleanHtml).find('.editable,[contenteditable="true"]').filter(':not(.no-merge)');
        }

        function hasTextConflicts($oldEditables, $newEditables) {
            if ($oldEditables.length != $newEditables.length) return true;
            if (_.some(_.zip($oldEditables, $newEditables), function(tuple) {
                    return $(tuple[0]).text().trim() != $(tuple[1]).text().trim();
                })) {
                return true;
            }
            return false;
        }

        function restoreTextChanges(newHtml, $oldEditables) {
            var $container = $('<div>').html(cardsHelper.cleanUpCardHtml(newHtml));
            var $newEditables = $container.find('.editable,[contenteditable="true"]').filter(':not(.no-merge)');
            _.zip($oldEditables, $newEditables).forEach(function(tuple) {
                if (tuple.length == 2) {
                    $(tuple[1]).html($(tuple[0]).html());
                }
            });
            return $container.html();
        }

        function refreshCard(cardsList, card) {
            if (!cardsList) return;
            var index = cardsList.indexOf(card);
            if (index < 0) return;

            editorService.destroyEditor();

            var card2 = new Cards(card);
            cardsList.splice(index, 1, card2);
            cardData.setActiveCard(card2);
        }

        function findRecentCard(recentCards, card) {
            var suffixRegex = /\([^)]*\)$/g; // e.g. Card name suffix >> (v2)

            var cardBaseName = getBaseName(card.name);
            var recentVersion = _.chain(recentCards)
                .filter(function(c) {
                    return getBaseName(c.name) == cardBaseName;
                })
                .map(function(c) {
                    var cardName = (c.name || '').trim();
                    var suffix = _.first(cardName.match(suffixRegex));
                    var version = parseFloat((suffix || '').replace(/[^\d.,]*/g, '')) || 0;
                    return { card: c, version: version };
                })
                .sortBy('version')
                .last().value();

            var recentCard = recentVersion ? recentVersion.card : _.findWhere(recentCards, { _id: card._id });
            return recentCard && new Cards(angular.copy(recentCard)); // null possible

            function getBaseName(cardName) {
                cardName = (cardName || '').trim();
                var baseName = cardName.replace(suffixRegex, '').trim();
                return baseName.toLowerCase();
            }
        }

        function listVariables(scope, card) {
            scope.dropOpts = [];
            scope.inputOpts = [];
            scope.areaOpts = [];
            scope.checkOpts = [];
            scope.fileOpts = [];
            scope.videoOpts = [];
            scope.pageOpts = [];
            scope.repeatOpts = [];
            scope.templateVariableOpts = [];
            scope.mailchimpListOpts = [];
            scope.stripeProductsListOpts = [];

            if (!card.variables) return;

            //if (typeof scope.card().variables == 'undefined')
            //     scope.card().variables = [];
            for (var i = 0; i < card.variables.length; i += 1) {
                var val = jQuery.extend(true, {}, card.variables[i]);
                var action = jQuery.extend(true, {}, (card.actions || [])[i]);

                val.defaultValue = val.value;

                var kind = (val.kind || '').replace(/\s+/g, '').toLocaleLowerCase();
                switch (kind) {
                    case 'dropdown':
                        var p_val = val;
                        for (var j = 0; j < val.value.length; j++) {
                            if (!val.value[j].value) {
                                var value_array = val.value[j].split("/");
                                if (value_array.length > 1) {
                                    p_val.value[j] = {
                                        name: value_array[0],
                                        value: value_array[1]
                                    }
                                } else {
                                    p_val.value[j] = {
                                        name: value_array[0],
                                        value: value_array[0]
                                    }
                                }
                            }
                            if (p_val.value[j].value == action[val.shortCode]) {
                                val.valueSelected = p_val.value[j].value;
                            }
                        }
                        scope.dropOpts.push(p_val);
                        break;
                    case 'textinput':
                        val.value = action[val.shortCode] || val.value;
                        scope.inputOpts.push(val);
                        break;
                    case 'textarea':
                        val.value = action[val.shortCode] || val.value;
                        scope.areaOpts.push(val);
                        break;
                    case 'checkbox':
                        val['valueTrue'] = val.value || false;
                        val.value = action[val.shortCode] || false;
                        val['checked'] = (val.value == val.valueTrue) ? true : false;
                        scope.checkOpts.push(val);
                        break;
                    case 'file':
                        scope.fileOpts.push(val);
                        break;
                    case 'video':
                        scope.videoOpts.push(val);
                        break;
                    case 'pageslist':
                        val.value = action[val.shortCode] || val.value;
                        val.valueSelected = val.value && val.value.split('#~')[0];
                        val.valueTarget = ((action[val.shortCode] || '').match(/#~(.*)$/) || [])[1];
                        scope.pageOpts.push(val);
                        break;
                    case 'repeat':
                        val.value = parseInt(action[val.shortCode], 10);
                        val.value = isNaN(val.value) ? parseInt(val.value, 10) || 1 : val.value;
                        scope.repeatOpts.push(val);
                        break;
                    case 'templatevariable':
                        if (!(action[val.shortCode] || '').startsWith('{{')) {
                            val.value = action[val.shortCode];
                        }
                        scope.templateVariableOpts.push(val);
                        break;
                    case 'mailchimplist':
                        val.value = action[val.shortCode] || val.value;
                        scope.mailchimpListOpts.push(val);
                        break;
                    case 'stripeproduct':
                        val.value = action[val.shortCode] || val.value;
                        scope.stripeProductsListOpts.push(val);
                        break;
                }
            }
        }

        function updateDependencies(scope, shortCode) {
            if (shortCode == 'bgcolor') {
                if (!_.findItemByKey(scope.card().actions, 'customcolor')) return;
                var value = _.findItemByKey(scope.card().actions, shortCode)[shortCode];
                scope.setValue('customcolor', value);
                _.findWhere(scope.inputOpts, { shortCode: 'customcolor' }).value = value;
            }
        }

        function updateHtmlDependencies(scope, shortCode) {
            // update card html to reflect new repeating value
            var cvar = _.findWhere(scope.card().variables, { shortCode: shortCode });
            if (cvar && cvar.kind == 'Repeat') {
                scope.card().html = cardsHelper.compileCardHtml(scope.card().html, scope.card());
                scope.card().reset = true;
                $rootScope.$emit('updateCardHtml');
            }

            if (cvar && cvar.kind == 'Template Variable') {
                //cardsHelper.compileCardHtml(scope.card(), false);
                scope.card().reset = true;
            }
        }

        function reloadOptions(config, options) {
            var defer = $q.defer();
            var selectize = config.selectize;
            var selected = selectize.getValue();
            $q.when(options).then(function(options) {
                selectize.clearOptions();
                config.options = options;
                $timeout(function() {
                    if (selected) selectize.setValue(selected);
                    // selectize.refreshOptions();
                    defer.resolve(options);
                });
            });
            return defer.promise;
        }
    }

}());
