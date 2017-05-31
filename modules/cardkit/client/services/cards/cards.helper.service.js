(function() {
    'use strict';

    angular
        .module('cardkit.cards')
        .factory('cardsHelper', cardsHelper);

    cardsHelper.$inject = ['Clients', 'Cards', 'Authentication', '$q', 'clientHelper', 'logger', '$timeout', 's3Storage', 'cardsHtmlHelper', 'fileManager'];

    function cardsHelper(Clients, Cards, Authentication, $q, clientHelper, logger, $timeout, s3Storage, cardsHtmlHelper, fileManager) {
        var cleanUpCardHtml = cardsHtmlHelper.cleanUpCardHtml;
        var compileCardHtml = cardsHtmlHelper.compileCardHtml;
        var assembleCardHtml = cardsHtmlHelper.assembleCardHtml;

        var service = {
            generateRandomText: generateRandomText,
            generateUniqueName: generateUniqueName,
            updateIframeData: updateIframeData,
            clientCardFilter: clientCardFilter,
            clientCards: clientCards,
            clientLiveCards: clientLiveCards,
            runIframeJS: runIframeJS,
            getClientFooter: getClientFooter,
            getCardById: getCardById,
            disableAllEditorsAndButtons: disableAllEditorsAndButtons,
            enableAllEditorsAndButtons: enableAllEditorsAndButtons,
            enableJSEditor: enableJSEditor,
            getAutoVariables: getAutoVariables,
            getClients: getClients,
            getCards: getCards,
            setAceForEditCard: setAceForEditCard,
            upload: upload,
            uploadTutorial: uploadTutorial,
            uniqueString: uniqueString,
            setIdleTimeout: setIdleTimeout,
            setAceStyle: setAceStyle,
            setAceStyles: setAceStyles,
            resizeAceEditors: resizeAceEditors,
            watchCardVariables: watchCardVariables,
            setIframeSize: setIframeSize,
            cleanUpCardHtml: cleanUpCardHtml,
            compileCardHtml: compileCardHtml,
            assembleCardHtml: assembleCardHtml,
            clientsDisplayList: clientsDisplayList,
        };
        return service;

        function setIframeSize(scope) {
            if (scope.shrink == '0.5' && (scope.artboardViewMode == 'ipad_land')) {
                scope.artboardHeight = '956px';
                scope.artboardWidth = '1280px';
            } else if (scope.shrink == '0.5' && (scope.artboardViewMode == 'desktop')) {
                scope.artboardHeight = '1659px';
                scope.artboardWidth = '1280px';
            } else if (scope.shrink == '0.5' && (scope.artboardViewMode == 'default')) {
                scope.artboardHeight = '786px';
                scope.artboardWidth = '1280px';
            } else if (scope.shrink == '0.75' && (scope.artboardViewMode == 'ipad_land')) {
                scope.artboardHeight = '956px';
                scope.artboardWidth = '1280px';
            } else if (scope.shrink == '0.75' && (scope.artboardViewMode == 'desktop')) {
                scope.artboardHeight = '1659px';
                scope.artboardWidth = '1280px';
            } else if (scope.shrink == '0.75' && (scope.artboardViewMode == 'default')) {
                scope.artboardHeight = '786px';
                scope.artboardWidth = '1280px';
            }
            else if (scope.artboardViewMode == 'iphone5') {
                scope.artboardHeight = '571px';
                scope.artboardWidth = '320px';
            }
            else if (scope.artboardViewMode == 'iphone6') {
                scope.artboardHeight = '667px';
                scope.artboardWidth = '375px';
            }
            else if (scope.artboardViewMode == 'iphone6s') {
                scope.artboardHeight = '738px';
                scope.artboardWidth = '414px';
            }
            else if (scope.artboardViewMode == 'ipad_port') {
                scope.artboardHeight = '1024px';
                scope.artboardWidth = '768px';
            }
            else if (scope.artboardViewMode == 'ipad_land') {
                scope.artboardHeight = '768px';
                scope.artboardWidth = '1024px';
            }
            else if (scope.artboardViewMode == 'desktop') {
                scope.artboardHeight = '1600px';
                scope.artboardWidth = 'calc(100% - 11px)';
            }
            else if (scope.artboardViewMode == 'default') {
                scope.artboardHeight = '768px';
                scope.artboardWidth = 'calc(91vw - 28vw)';
            }
        }

        function watchCardVariables(scope) {
            scope.$watch(function() {
                return scope.card.actions
            }, function() {
                $timeout(function() {
                    try {
                        var iframe = document.getElementById("card_iframe");
                        updateIframeData('actions', scope.card.actions, iframe);
                    } catch (err) {
                    }

                }, 0);
            }, true);
        }


        function setIdleTimeout(scope) {

        }

        function upload(scope, index) {
            var defer = $q.defer();
            var image = scope.card.images[index];
            fileManager.pickAndStore(null, { mimetype: 'image/*' }).then(function(url) {
                fileManager.optimize(url, null, 350, 350).then(function(thumbUrl) {
                    image.url = url;
                    image.thumbUrl = thumbUrl || null;
                }).catch(function() {
                    image.url = url;
                }).finally(function() {
                    image.uploadProgress = 100;
                    defer.resolve(image.url);
                    $timeout(function() {
                        delete image.uploadProgress;
                    }, 2000)
                });
            }, defer.reject, function(progress) {
                if (progress >= 99) progress = 99;
                image.uploadProgress = progress;
                defer.notify(progress);
            });
            return defer.promise;
        }

        function uploadTutorial(scope) {
            var defer = $q.defer();
            var tutorial = scope.card.cardTutorial = scope.card.cardTutorial || {};
            fileManager.pickAndStore(null, { mimetype: 'video/*', hide: true }).then(function(url) {
                tutorial.url = url;
                logger.success(url + ' uploaded successfully');
            }, defer.reject, function(progress) {
                tutorial.uploadProgress = progress;
                defer.notify(progress);
            }).finally(function() {
                $timeout(function() {
                    delete tutorial.uploadProgress;
                }, 2000);
            });
            return defer.promise;
        }

        function uniqueString() {
            return s3Storage.salt();
        }

        function setAceStyle(editor, title) {
            editor.setTheme("ace/theme/monokai");
            editor.getSession().setMode("ace/mode/" + title);
            editor.getSession().setUseWrapMode(true);
        }

        function setAceStyles() {
            var htmleditor = ace.edit("html");
            var lesseditor = ace.edit("less");
            var csseditor = ace.edit("css");
            var jseditor = ace.edit("js");
            setAceStyle(htmleditor, "html");
            setAceStyle(lesseditor, "less");
            setAceStyle(csseditor, "css");
            setAceStyle(jseditor, "javascript");
        }

        function resizeAceEditors() {
            var editors = ['html', 'less', 'css', 'js'];
            editors.forEach(function(id) {
                var editor = ace.edit(id);
                editor.resize();
            });
        }

        function initEditor(id) {
            var editor = ace.edit(id);

            var resize = _.debounce(function() {
                editor.resize();
            }, 100);

            editor.on('focus', resize);
            editor.on('blur', resize);
            
            return editor;
        }

        function setAceForEditCard(scope) {
            var langTools = ace.require("ace/ext/language_tools");

            scope.aceHtmlInit = false;

            var htmleditor = initEditor('html');

            var auto_card_vars = [];
            langTools.setCompleters([{
                getCompletions: function(editor, session, pos, prefix, callback) {
                    _.each(auto_card_vars, function(v) {
                        v.score = v.initialScore;
                    });
                    callback(null, auto_card_vars);
                }
            }]);

            htmleditor.setOptions({
                enableBasicAutocompletion: true
            });

            htmleditor.commands.bindKey("{", "startAutocomplete")
            htmleditor.getSession().on('change', function(e) {
                scope.card.html = htmleditor.getValue();
                if (!scope.$$phase) {
                    scope.$apply();
                }

                if (scope.isIframe.loaded && !scope.enabledJSEditor) {
                    var iframe = document.getElementById("card_iframe");
                    updateIframeData('html', scope.card.html, iframe);
                }

            });

            scope.$watch(function(scope) {
                    return scope.card.html
                },
                function() {
                    if (scope.card.html && scope.aceHtmlInit == false) {
                        scope.aceHtmlInit = true;
                        htmleditor.setValue(scope.card.html);
                        htmleditor.gotoLine(1);
                    }
                });

            scope.aceLessInit = false;
            var lesseditor = initEditor('less');

            var auto_client_vars = [];
            langTools.setCompleters([{
                getCompletions: function(editor, session, pos, prefix, callback) {
                    callback(null, auto_client_vars);
                }
            }]);

            lesseditor.setOptions({
                enableBasicAutocompletion: true
            });
            lesseditor.commands.bindKey("@", "startAutocomplete");

            lesseditor.getSession().on('change', function(e) {
                scope.card.less = lesseditor.getValue();
                if (!scope.$$phase) {
                    scope.$apply();
                }
            });

            scope.$watch(function(scope) {
                    return scope.card.less
                },
                function() {
                    var less_scope;
                    if (scope.client) {
                        less_scope = clientHelper.addClietVariesToLess(scope.client.variables) + scope.card.less;
                        less.render(less_scope).then(function(output) {
                            scope.card.css = output.css;
                            csseditor.setValue(scope.card.css);
                        }).catch(function(err) {
                            logger.error('Error with LESS');
                            logger.error(err.message);
                        });
                    }

                    if (scope.card.less && scope.aceLessInit == false) {
                        scope.aceLessInit = true;
                        lesseditor.setValue(scope.card.less);
                        lesseditor.gotoLine(1);
                    }
                });


            scope.$watch(function(scope) {
                return scope.card.variables;
            }, function(variables) {
                // HTML vars
                auto_card_vars = getAutoVariables(variables, "Card");
                var cardid = {
                    meta: "Card Variables",
                    score: -999,
                    value: "{{cardid}}",
                };
                auto_card_vars.push(cardid);
                var clientnav = {
                    meta: "Card Variables",
                    score: -1000,
                    value: "{{clientnav}}"
                };
                auto_card_vars.push(clientnav);
                var clientid = {
                    meta: "Card Variables",
                    score: -999,
                    value: "{{clientid}}",
                };
                auto_card_vars.push(clientid);
                console.log(auto_card_vars);

                // LESS vars
                auto_client_vars = getAutoVariables(scope.client.variables, "Client");
            }, true);


            scope.aceCSSInit = false;
            var csseditor = initEditor('css');
            csseditor.getSession().on('change', function(e) {
                scope.card.css = csseditor.getValue();
                if (scope.isIframe.loaded && !scope.enabledJSEditor) {
                    var iframe = document.getElementById("card_iframe");
                    updateIframeData('css', scope.card.css, iframe);
                }
                if (!scope.$$phase) {
                    scope.$apply();
                }
            });

            scope.$watch(function(scope) {
                    return scope.card.css
                },
                function() {
                    if (scope.card.css && scope.aceCSSInit == false) {
                        scope.aceCSSInit = true;
                        csseditor.setValue(scope.card.css);
                        if (scope.card.less == '') {
                            scope.card.less = scope.card.css;
                        }
                        csseditor.gotoLine(1);
                    }
                });


            scope.aceJSInit = false;
            var jseditor = initEditor('js');
            jseditor.getSession().on('change', function(e) {
                scope.card.js = jseditor.getValue();
            });

            scope.$watch(function(scope) {
                    return scope.card.js
                },
                function() {
                    if (scope.card.js && scope.aceJSInit == false) {
                        scope.aceJSInit = true;
                        jseditor.setValue(scope.card.js);
                        jseditor.gotoLine(1);
                    }
                });
        }

        function getClients() {
            var deferred = $q.defer();
            Clients.query().$promise.then(function(clients) {
                deferred.resolve(clients);
            });
            return deferred.promise;
        }

        function getCards(params) {
            var deferred = $q.defer();
            var me = Authentication.cardkit.user;
            if (me.role === 'admin' || me.role === 'client' || _.contains(me.permissions, 'ViewAllCards')) {
                Cards.query(params).$promise.then(function(cards) {
                    deferred.resolve(cards);
                }).catch(function(err) {
                    deferred.reject('Error while fetching cards');
                });
            }
            else {
                deferred.resolve([]);
            }

            return deferred.promise;
        }

        function getAutoVariables(variables, meta) {
            var auto_arr = [];
            if (variables != undefined) {
                variables = _.sortBy(variables, meta == 'Card' ? 'shortCode' : 'variable');
                for (var i = 0; i < variables.length; i++) {
                    var value = '';
                    if (meta == "Card") {
                        value = '{{' + variables[i].shortCode + '}}';
                    } else if (meta == "Client") {
                        value = variables[i].variable;
                    }
                    var obj = {
                        value: value,
                        score: -10 * i,
                        initialScore: -10 * i,
                        meta: meta + " Variables"
                    }
                    auto_arr.push(obj);

                    if (variables[i] && variables[i].kind == 'Repeat' && meta == 'Card') {
                        obj = angular.copy(obj);
                        obj.value = '{{/' + variables[i].shortCode + '}}';
                        obj.initialScore = obj.score = obj.score - 1;
                        auto_arr.push(obj);
                    }
                }
            }
            return auto_arr;
        }

        function clientLiveCards(cards, currentClient, role) {
            var allowedStatuses = ['Ready for Client Review', 'Approved', 'Edits Required'];
            if (role === 'admin') allowedStatuses.push('In Progress');
            var clients = _.unionItems(currentClient.clients, currentClient.client, currentClient.companyName);
            var result = [];
            for (var i = 0; i < cards.length; i += 1) {
                if (!cards[i]) continue;
                var cardClients = _.map(cards[i].clients, 'companyName');
                if (_.intersection(clients, cardClients).length > 0) {
                    var exist = _.contains(allowedStatuses, cards[i].cardStatus);
                    if (cards[i].images.length) var display = cards[i].images[0].thumbUrl || cards[i].images[0].url;
                    cards[i].displayImage = display || '//developer-agent.com/wp-content/uploads/2015/05/images_no_image_jpg3.jpg';
                    if (exist)result.push(cards[i]);
                }
            }
            return result || {};
        }

        function enableJSEditor(checked) {
            var jseditor = ace.edit("js");
            if (checked) {
                setaceEditorStyle(jseditor, true, "none", 0.5);
            } else {
                setaceEditorStyle(jseditor, false, "", 1);
            }
        }

        function disableAllEditorsAndButtons() {
            var htmleditor = ace.edit("html");
            var lesseditor = ace.edit("less");
            var csseditor = ace.edit("css");
            var jseditor = ace.edit("js");
            setaceEditorStyle(htmleditor, true, "none", 0.5);
            setaceEditorStyle(lesseditor, true, "none", 0.5);
            setaceEditorStyle(csseditor, true, "none", 0.5);
            setaceEditorStyle(jseditor, true, "none", 0.5);
        }

        function setaceEditorStyle(editor, readonly, pointerEvents, opacity) {
            editor.setReadOnly(readonly);
            editor.container.style.pointerEvents = pointerEvents;
            editor.container.style.opacity = opacity;
        }

        function enableAllEditorsAndButtons() {
            var htmleditor = ace.edit("html");
            var lesseditor = ace.edit("less");
            var csseditor = ace.edit("css");
            var jseditor = ace.edit("js");
            setaceEditorStyle(htmleditor, false, "", 1);
            setaceEditorStyle(lesseditor, false, "", 1);
            setaceEditorStyle(csseditor, false, "", 1);
            setaceEditorStyle(jseditor, false, "", 1);
        }

        function generateUniqueName(name, client) {
            return cardsHtmlHelper.generateUniqueName(name, client);
        }

        function generateRandomText() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < 8; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        }

        function updateIframeData(title, data, iframe) {
            try {
                iframe.contentWindow.update({
                    name: title,
                    value: data
                });
            }
            catch (ex) {
                logger.error(ex);
            }
        }

        function getClientFooter(id) {
        }

        function runIframeJS(data) {
            var iframe = document.getElementById("card_iframe");
            iframe.contentWindow.run(data);
        }

        function clientCardFilter(cards, currentClient) {
            var clients = _.unionItems(currentClient.clients, currentClient.client);
            var readyCards = [];
            var editsCards = [];
            for (var i = 0; i < cards.length; i += 1) {
                if (!cards[i].client) continue;
                var cardClients = _.map(cards[i].clients, 'companyName');
                if (_.intersection(clients, cardClients).length > 0) {
                    if (cards[i].cardStatus === 'Ready for Client Review') {
                        readyCards.push(cards[i]);
                    }
                    if (cards[i].cardStatus === 'Edits Required') {
                        editsCards.push(cards[i]);
                    }
                }
            }
            var result = { edits: editsCards, ready: readyCards };
            return result || {};
        }

        function clientCards(cards, currentClient) {
            var clients = _.unionItems(currentClient.clients, currentClient.client, currentClient.companyName);
            var result = [];
            for (var i = 0; i < cards.length; i += 1) {
                if (!cards[i]) continue;
                var cardClients = _.map(cards[i].clients, 'companyName');
                if (_.intersection(clients, cardClients).length > 0) {
                    result.push(cards[i]);
                }
            }
            return result || {};
        }

        function getCardById(cards, id) {
            for (var i = 0; i < cards.length; i += 1) {
                if (cards[i]._id === id) {
                    return cards[i];
                }
            }
            return -1;
        }

        function clientsDisplayList(cardOrClients) {
            if (!cardOrClients) return;
            if (cardOrClients.clientsAll) return 'All Clients';
            return _.map(cardOrClients.clients || cardOrClients, 'companyName').sort().join(', ');
        }
    }
})();
