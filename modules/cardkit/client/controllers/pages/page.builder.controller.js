(function() {
    "use strict";

    angular
        .module('cardkit.pages')
        .controller('PageBuilderController', PageBuilderController);

    PageBuilderController.$inject = ['cardData', 'editorService', 'pagesHelper', '$q', 'Pages', '$scope', '$rootScope', 'Authentication', 'logger', 'cardsHelper', 'clientHelper', '$timeout', '$stateParams', '$state', '$location', '$mdUtil', '$mdSidenav', '$log', 's3Storage', 'IntercomSvc', 'Logs', 'hotkeys', 'PostMessage', '$window', 'MediaAssets'];

    function PageBuilderController(cardData, editorService, pagesHelper, $q, Pages, $scope, $rootScope, Authentication, logger, cardsHelper, clientHelper, $timeout, $stateParams, $state, $location, $mdUtil, $mdSidenav, $log, s3Storage, IntercomSvc, Logs, hotkeys, PostMessage, $window, MediaAssets) {
        $scope.me = Authentication.cardkit.user;
        $scope.pageId = $stateParams.pageId;
        $scope.leaveUrl = '';
        $scope.vleavePage = false;
        $scope.isPageDirty = false;
        $scope.loadingProgress = 0;

        $scope.sortableOptions = {
            connectWith: ".connected-cards-container",
            'ui-floating': false,
            start: function(e, ui) {
                $(ui.item).addClass('dragging');
            },
            stop: function(e, ui) {
                $(ui.item).removeClass('dragging');
                $(ui.placeholder).remove();

                if ($(e.target).hasClass('first') &&
                    ui.item.sortable.droptarget &&
                    e.target != ui.item.sortable.droptarget[0]) {
                    $scope.sourceScreens = sortCards(pagesHelper.adoptPagesDataStructure(JSON.parse(JSON.stringify($scope.cards.slice()))));
                    $scope.isPageDirty = true;
                    if ($scope.page) $scope.page.saveWholePage = true;
                }
            }
        };

        $scope.sortableOptions1 = {
            connectWith: ".connected-cards-container",
            scroll: true,
            'ui-floating': false,
            handle: '.myAngularHandle',
            update: function(event, ui) {
                $scope.isPageDirty = true;
                if ($scope.page) $scope.page.saveWholePage = true;
            }
        };

        $scope.toggleCards = buildToggler('cardLibrary');
        $scope.togglePageSettings = buildToggler('pageSettings');
        $scope.toggleCardSettings = $mdUtil.debounce(function(show) {
            $scope.csopen = show;
        }, 350);

        $scope.leavePage = function(argument) {
            $('#leavePageModal').modal2('hide');

            $timeout.cancel(keepEditingTimer);
            Pages.editing({ reset: true }, { pageId: $scope.pageId });

            $timeout(function() {
                $scope.vleavePage = true;
                resetDirtyPage($scope);
                $location.path($state.href($scope.leaveUrl));
            }, 300);
        }

        $scope.resetSidebar = function() {
            console.log("resetSidebar");
            $scope.$broadcast('resetOpts');
        }

        var deferLoaded = $q.defer();
        $scope.loaded = deferLoaded.promise; // todo: rename to $scope.rendered
        $scope.rendered = $scope.loaded;
        $scope.loadingCompleted = function(card) {
            if (card) card.loaded = true;
            var cardsLoaded = _.where($scope.newPage.cards, { loaded: true });
            var loadingComplete = cardsLoaded.length == ($scope.newPage.cards || []).length;

            if (loadingComplete) {
                $timeout(resetBackgroundsAttachment, 500);
                $timeout(closeCardSettingsBeforePopup, 500);
            }

            // hide busy indicator once 2+ cards loaded (should fill the whole viewport thus can be shown asap)
            if ((loadingComplete || cardsLoaded.length >= 2) && !$scope.loadingDone) {
                $scope.loadingProgress = 100;
                $timeout.cancel($scope.loadingTimer);
                $timeout(function() {
                    $scope.loadingDone = true;
                });
                deferLoaded.resolve();
            }
        };

        $scope.getCards = function(specificClient) {
            //specificClient = specificClient || $scope.client || $scope.clients[0];
            var cClient;
            console.log(specificClient);
            if (specificClient != undefined)
                $scope.client = clientHelper.getClientByName($scope.clients, specificClient.companyName) || specificClient;
            else
                $scope.client = $scope.clients[0];
            //$scope.client = specificClient || $scope.client || $scope.clients[0];
            //$scope.client.client = $scope.client.companyName;

            //$scope.cards = cardsHelper.clientLiveCards($scope.allCards, $scope.client || $scope.me, $scope.me.role);
            if ($scope.me.role !== 'admin') {
                //$scope.client = $scope.me;
                var userClients = Authentication.clients();
                $scope.client = clientHelper.getClientByName($scope.clients, _.contains(userClients, $scope.client.companyName) ? $scope.client.companyName : $scope.me.client);
            }
            console.log($scope.client);

            $scope.cards = cardsHelper.clientLiveCards($scope.allCards, $scope.client, $scope.me.role);
            if ($scope.allCards.length) {
                $scope.cards.length ? logger.info(($scope.client.companyName || $scope.page.client.companyName) + ' cards fetched') : logger.info('There is no available cards');

                try {
                    pagesHelper.setHeaderFooter($scope.client || $scope.client, 'admin');
                }
                catch (error) {
                    console.log(error);
                }
            }

            $scope.sourceScreens = sortCards(pagesHelper.adoptPagesDataStructure(JSON.parse(JSON.stringify($scope.cards.slice()))));
        };

        $scope.updatePage = function() {
            $scope.isPageDirty = false;
            return pagesHelper.updatePageBuilder($scope);
        };

        $scope.exportPage = function() {
            return pagesHelper.exportPageBuilder($scope);
        };

        $scope.openAddCards = function() {
            $scope.hideSidebars();
            $scope.resetSidebars('cards');
            $scope.toggleCards(true);
        };

        $scope.openCardSettingsSidebar = function() {
            $scope.hideSidebars();
            $scope.resetSidebars('cardSettings');
            $scope.toggleCardSettings(true);
        };

        $scope.openPageSettingsSidebar = function(page) {
            $scope.hideSidebars();
            $scope.resetSidebars('pageSettings');
            $scope.page = page;
            $scope.editPage = _.deepClone(page);
            $scope.togglePageSettings(true);
        };

        $scope.hideSidebars = function() {
            $scope.toggleCards(false);
            $scope.togglePageSettings(false);
            $scope.toggleCardSettings(false);
        };

        $scope.resetSidebars = function(except) {
            $timeout(function() {
                if (except != 'pageSettings') $scope.editPage = null;
            }, 400);
        };

        $scope.loadClientTags = function(client, query) {
            if (!client) return $q.when([]);
            return Pages.queryTags({ query: query }, { clientName: client.companyName }).$promise;
        };

        $rootScope.saveChangesAndClose = function(e) {
            $rootScope.saveChanges(e).then(function() {
                $scope.vleavePage = true;
                $state.go('cardkit.listPages');
            });
        };

        $rootScope.saveChanges = function(ev, force) {
            if (!force && $scope.savingPage) return;
            $scope.savingPage = true;

            if (!force && $scope.editPage) {
                $scope.pageSettings.saveDetails();
                return;
            }

            var done = $q.defer();

            done.promise.finally(function() {
                $scope.savingPage = null;
            });

            var start = new Date();
            done.promise.then(function(page) {
                if (!page) return;

                var durationMs = new Date() - start;
                if (durationMs <= 10000) return;

                logEvent('Slow Page Saving', {
                    pageId: page._id,
                    pageName: page.name,
                    clientName: page.client.companyName,
                    durationMs: durationMs
                });
            });

            var cardsLen = $scope.newPage.cards.length;
            var saveTimeout = $timeout(function() {
                done.reject('Timeout while saving the page');
            }, cardsLen < 7 ? 45000 : (cardsLen < 10 ? 90000 : 150000));

            try {
                $timeout(function() {
                    done.notify({ progress: 5, status: 'Building page...' });
                });

                var prepared = ensureModalsClosed().then(pagesHelper.populateDOMChanges);

                var saved = prepared.then(function() {
                    var preview = ev && ev.altKey ? null : generatePagePreview($scope.newPage, '#body', true);
                    var saving = $scope.updatePage();
                    saving.then(null, null, done.notify);
                    return $q.all([saving, preview]);
                });

                saved.then(function(responses) {
                    IntercomSvc.trackEvent('Saved page', {
                        article: {
                            value: $scope.pageClient.companyName + ' | ' + $scope.page.name,
                            url: $location.absUrl()
                        }
                    });

                    var page = responses[0] || $scope.page;
                    var thumbUrl = responses[1];
                    if (thumbUrl) {
                        return savePageThumbnail(page, thumbUrl).catch(function(error) {
                            console.error(error);
                            logger.error('Unable to save page thumbnail');
                        }).then(function() {
                            return page;
                        });
                    }

                    return page;
                }).then(done.resolve)
                    .catch(function(error) {
                        error = error instanceof Array ? error[0] : error;
                        done.reject(error);
                    });
            }
            catch (ex) {
                done.reject(ex);
            }

            $scope.savingPageProgress = done.promise;
            $scope.savingPageProgress.then(function() {
                $timeout.cancel(saveTimeout);
                $scope.fixBackgroundAttachment = true;
                resetDirtyPage($scope);
            });

            return $scope.savingPageProgress;
        };

        $rootScope.discardChanges = function(force) {
            if (!force) {
                $('#discardPageModal').modal2('show');
            }
            else {
                pagesHelper.resetPageBuilder($scope);
                $('#discardPageModal').modal2('hide');
            }
        };

        // event subscriptions

        $scope.$on('return-page-settings', function(ev, details) {
            if (!details) return;
            angular.extend($scope.page, details);

            if (details.client && $scope.pageClient != details.client) {
                $scope.pageClient = details.client;
                $scope.getCards($scope.pageClient, 'changed');
            }

            return savePageDetails($scope.pageId, details).then(function() {
                if ($scope.savingPage && $scope.isPageDirty) {
                    return $scope.saveChanges(ev, true);
                }
                $scope.savingPage = null;
                logger.success('Page settings saved');
            });
        });

        $window.$builder = true;
        $scope.$on('$destroy', function() {
            $window.$builder = false;
        });

        $scope.$watch(function() {
            return cardData.getActiveCard();
        }, function() {
            $scope.selectedCard = cardData.getActiveCard();
        });

        $(window).on('keydown', saveKeyPressHandler);
        $scope.$on('$stateChangeStart', function(event, newUrl, oldUrl) {
            $rootScope.hideNavbar = false;
            $(window).off('keydown', saveKeyPressHandler);
            if ($scope.vleavePage == false && $scope.isPageDirty) {
                $('#leavePageModal').modal2('show');
                event.preventDefault();
                $scope.leaveUrl = newUrl;
            }
            else {
                $timeout.cancel(keepEditingTimer);
                Pages.editing({ reset: true }, { pageId: $scope.pageId });
            }
        });

        // recurrent task to slide editing timestamp, executes every 10 seconds, timeout 30 seconds
        var keepEditingTimer = $timeout(function keepEditing() {
            Pages.editing({ pageId: $scope.pageId }, function() {
                keepEditingTimer = $timeout(keepEditing, 10000);
            }, function(response) {
                console.error('keep page edited request failed', response);
                if (response.status == 404) return; // page not found - stop keep editing requests
                keepEditingTimer = $timeout(keepEditing, 10000);
            });
        }, 0);

        $scope.$watch('allCards', function(cards) {
            $scope.clientTemplateCards = _.filter(cards, function(c) {
                return c.name.match(/Template/i);
            });
        });

        init();

        //
        // PRIVATE FUNCTIONS
        //

        function init() {
            $scope.loadingProgress = 10;

            loadPageData($scope.pageId).then(function() {
                clientHelper.bindSelectedClient($scope);

                initPage();
                bindHotKeys();

                var client = $scope.client || $scope.pageClient;
                $scope.mediaLibrary = MediaAssets.getClientLibrary(null, { clientSlug: client.slug || client.companyName });

                $scope.$watchCollection('newPage.cards', function(cards, oldCards) {
                    if (oldCards && $scope.page) {
                        $scope.page.saveWholePage = true;
                    }

                    var client = $scope.client || $scope.pageClient;
                    editorService.renderEditor(client, $scope);
                });

                if (!$scope.page || ($scope.page.cards || []).length == 0) {
                    $scope.loadingCompleted();
                }
            });

            $scope.loadingTimer = $timeout(function timer() {
                $scope.loadingProgress = Math.min($scope.loadingProgress + 20, 90);
                $scope.loadingTimer = $timeout(timer, 400 + Math.round(Math.random() * 300));
            }, 500);

            $scope.rendered.then(function() {
                $('#body').scrollTop(0);
                $(window).scrollTop(0);

                editorService.renderEditor($scope.pageClient || $scope.client || $scope.selectedClient, $scope, true);

                $('.page.content').on('change input', function(e) {
                    $scope.isPageDirty = true;
                    markCardChanged(e.target);
                });

                $('.page.content').on('click', 'a[href]', function(event) {
                    if ($(event.target).closest('.allow-clicks').length) return;
                    event.preventDefault();
                });

                $rootScope.$on('updateCardHtml', function(event, keepClean) {
                    if (!keepClean) {
                        $scope.isPageDirty = true;
                    }

                    markCardChanged(event.target);

                    enablePlugins($('.page.content'));
                });

                if (_.isEmbedMode()) PostMessage.send('loaded', Authentication.cardkit.user.username);
            });
        }

        function initPage() {
            $scope.newPage = {};
            $scope.canSaveOrEdit = $scope.me.role === 'admin' || $scope.me.role === 'client';
            $scope.canChangeClient = $scope.me.role === 'admin';
            console.log("pageId:" + $scope.pageId);

            $rootScope.title = "Cardkit | " + $scope.page.name;

            // load cards in page builder
            if (($scope.page.cards || []).length > 0) {
                $timeout(function() {
                    $scope.newPage.cards = cardData.loadCards($scope.page.cards);
                    _.each($scope.newPage.cards, function(card) {
                        card.client = resolveClient(card.client);
                        card.clients = _.map(card.clients, resolveClient);
                        card.loaded = false;
                    });
                }, 4000);
            }
            else {
                $scope.newPage.cards = cardData.loadCards([]);
            }

            /*********     getting current client. Priority 1. page client 2.current user client   ***********/
            $scope.getCards($scope.page.client);
            $scope.pageClient = $scope.clients[$scope.clients.indexOf(clientHelper.getClientByName($scope.clients, $scope.page.client.companyName))];
            console.log($scope.pageClient);

            $scope.pagesList = Pages.query({
                clientName: $scope.me.role == 'client' ? ($scope.pageClient ? ($scope.pageClient.companyName || $scope.pageClient) : $scope.selectedClient) : undefined,
                exclude: ['cards', 'sourceCode', 'exportedCSS']
            }).$promise;
        }

        function loadPageData(pageId) {
            $scope.lazyLoading = true;

            return Pages.get({ pageId: pageId, exclude: ['sourceCode', 'exportedCSS'] }).$promise.then(function(page) {
                $scope.page = page;
                var promises = [cardData.getClient(page.client.companyName), cardData.getClientCards(page.client, true)];
                return $q.all(promises).then(function(results) {
                    if (results[0]) $scope.$root.selectedClient = results[0].companyName;
                    $scope.clients = [results[0]];
                    $scope.allCards = results[1];

                    if ($scope.me.role === 'client') {
                        // no background tasks to fetch other clients details
                        $scope.lazyLoading = false; // loaded
                    }
                    else {
                        // background tasks
                        $timeout(function() {
                            $q.all([cardData.getClients(), cardData.getAllCards()]).then(function(results) {
                                $scope.clients = unionEntities($scope.clients, results[0]);
                                $scope.allCards = unionEntities($scope.allCards, results[1]);
                            }).finally(function() {
                                $scope.lazyLoading = false; // loaded
                            });
                        }, 200);
                    }
                }).catch(function(err) {
                    $scope.lazyLoading = false; // loaded
                    return $q.reject(err);
                });
            }).catch(function(err) {
                console.error(err);
                $scope.loadingError = 'Unable to load this page';
                return $q.reject(err);
            });
        }

        function bindHotKeys() {
            hotkeys.bindTo($scope)
                .add({
                    combo: 'mod+s',
                    description: 'Save changes in page builder',
                    allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
                    callback: function(event) {
                        event.preventDefault();
                        $scope.saveChanges(event);
                    }
                });
        }

        function buildToggler(navID) {
            var debounceFn = $mdUtil.debounce(function(show) {
                var sidenav = $mdSidenav(navID);
                if (sidenav.isOpen() === show) return;
                $scope.$apply(function() {
                    $scope.csopen = false;
                    sidenav.toggle().then(function() {
                        $log.debug('toggle ' + navID + ' is done');
                    });
                });
            }, 300);
            return debounceFn;
        }

        function sortCards(cards) {
            return cards.sort(function(card1, card2) {
                var int1 = parseInt(card1.name, 10) || 0;
                var int2 = parseInt(card2.name, 10) || 0;
                if (int1 != int2) return int1 - int2;
                return (card1.name || '').localeCompare(card2.name);
            });
        }

        function generatePagePreview(page, body, unobtrusively) {
            var done = $q.defer();

            try {
                var clone = clonePage(body);
                var bodyContent = preparePreviewContent(clone);
                $(body).hide();

                screenshot(bodyContent).then(function(canvas) {
                    var filename = _.buildUrl($scope.page.name);
                    return extractThumbnail(canvas, filename);
                }).catch(function(error) {
                    console.error(error);
                    logger.error('Unable to generate page thumbnail');
                    if (!unobtrusively) {
                        return $q.reject(error);
                    }
                    else {
                        $timeout(done.resolve);
                    }
                }).finally(function() {
                    $(clone).remove();
                    $(body).show();
                }).then(done.resolve, done.reject, done.notify);
            }
            catch (ex) {
                if (!unobtrusively) {
                    return $q.reject(ex);
                }
                else {
                    $timeout(done.resolve);
                }
            }

            return done.promise;
        }

        function clonePage(pageBody) {
            var $pageBody = $(pageBody);
            var $clone = $pageBody.clone().appendTo($pageBody.parent());
            $clone.attr('id', $clone.attr('id') + 'Preview');
            return $clone;
        }

        function preparePreviewContent(body) {
            var $body = $(body);

            $body.find('.controls_wrapper').remove();
            $body.find('.page.content').removeClass('open');
            $body.scrollTop(0);

            $scope.hideSidebars();

            // reset background-size css property, because html2canvas can't handle them properly and leaves black areas
            $body.find('*').filter(function() {
                var styles = document.defaultView.getComputedStyle(this, null);
                var backgroundSize = styles.getPropertyValue('background-size');
                return backgroundSize != 'auto';
            }).each(function() {
                $(this).css('background-size', 'auto');
            });

            return $body.find('.page.content');
        }

        function screenshot(element) {
            var done = $q.defer();

            $timeout(function() {
                done.notify({ progress: 0, status: 'Generating page preview image…' });
            });

            var $element = $(element);
            var baseUrl = $location.protocol() + "://" + $location.host() + ":" + $location.port();

            $timeout(function() {
                done.notify({ progress: 5 });
                html2canvas($element[0], {
                    height: 20000,
                    //logging: true,
                    useCORS: true,
                    proxy: baseUrl + '/proxy/image',
                    onrendered: function(canvas) {
                        done.notify({ progress: 30 });
                        done.resolve(canvas);
                    }
                });
            }, 1000);

            return done.promise;
        }

        function extractThumbnail(canvas, filename) {
            var done = $q.defer();

            var maxWidth = 250;
            var uniqueFileName = 'app/' + s3Storage.salt() + '-' + filename + '-thumb_' + maxWidth + '.jpg';
            var thumbType = 'image/jpg';

            var previewUrl = canvas.toDataURL(thumbType);

            s3Storage.thumbnail(previewUrl, thumbType, maxWidth)
                .then(function(thumbBuffer) {
                    done.notify({ progress: 35 });
                    return s3Storage.uploadOptimized(uniqueFileName, thumbBuffer, thumbType);
                }).then(function(thumbUrl) {
                done.notify({ progress: 42 });
                $scope.newPage.preview = { thumbUrl: thumbUrl || null };
                return thumbUrl;
            }).then(done.resolve, done.reject);

            return done.promise;
        }

        function savePageThumbnail(page, thumbUrl) {
            var pageId = _.id(page);
            var pagePreview = new Pages({
                _id: pageId,
                updateHistory: page.updateHistory,
                client: _.id(page.client)
            });
            pagePreview.preview = { thumbUrl: thumbUrl || null };
            var lastUpdate = _.last(pagePreview.updateHistory);
            if (lastUpdate) lastUpdate.preview = thumbUrl;
            return pagePreview.$update({ pageId: pageId });
        }

        function savePageDetails(pageId, details) {
            var page = new Pages({ _id: pageId });
            angular.extend(page, details);
            return page.$update({ pageId: pageId });
        }

        function resolveClient(client) {
            if (!client) return client;
            if (client.companyName) return client;
            var result = _.find($scope.clients, { _id: _.id(client) });
            return result;
        }

        function resetBackgroundsAttachment() {
            $(document.querySelectorAll('#card8')).attr('style', function(i, style) {
                // remove inline background-attachment css property
                return style.replace(/background-attachment[^;]+;?/gi, '');
            });
        }

        function unionEntities(targetArr, arr1/*, ..., arrN*/) {
            targetArr = targetArr || [];

            var otherArrs = Array.prototype.slice.call(arguments, 1);
            otherArrs.forEach(function(arr) {
                if (!arr) return;

                var targetIds = _.pluck(targetArr, '_id');
                var differentEntities = _.filter(arr, function(item) {
                    return !_.contains(targetIds, item._id);
                });

                differentEntities.forEach(function(item) {
                    targetArr.push(item);
                });
            });
            return targetArr;
        }

        function saveKeyPressHandler(e) {
            // Ctrl+S or Command+S (for Mac) handler
            if (e.keyCode == 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
                e.preventDefault();
                $scope.saveChanges(e);
            }
        }

        function closeCardSettingsBeforePopup() {
            $('.page.content').on('shown.bs.modal', function() {
                if ($scope.csopen) {
                    $scope.csopen = false;
                    $scope.hideSidebars();
                    $scope.$digest();
                }
            });
        }

        function ensureModalsClosed() {
            var done = $q.defer();

            var $body = $('#body');
            var $openModal = $body.find('.modal.in');
            if ($openModal.length) {
                var publishOnce = function() {
                    $openModal.off('hidden.bs.modal', publishOnce);
                    done.resolve();
                };
                $openModal.on('hidden.bs.modal', publishOnce);
                $openModal.modal('hide');
            }
            else {
                done.resolve();
            }

            return done.promise;
        }

        function logEvent(type, metadata) {
            var logEntry = new Logs({
                entryType: type,
                user: $scope.me._id,
                metadata: metadata
            });

            return logEntry.$save();
        }

        function resetDirtyPage($scope) {
            $scope.isPageDirty = false;
            if ($scope.page) {
                delete $scope.page.saveWholePage;
            }
            _.each($scope.newPage && $scope.newPage.cards, function(card) {
                delete card.changed;
            });
        }

        function markCardChanged(target) {
            var cardScope = angular.element($(target).closest('.card-container')[0]).scope();
            if (cardScope && cardScope.card) {
                cardScope.card.changed = true;
            }
        }

        function enablePlugins(element) {
            // background video plugin
            if ($.fn.vide) {
                $(element).find('[data-vide-bg]').each(function(i, element) {
                    var $element = $(element);
                    var options = $element.attr('data-vide-options');
                    var path = compactPairs($element.attr('data-vide-bg').split(','));

                    $element.vide(path, options);
                });
            }
        }

        /**
         * Compact and normalize Vide plugin params, which are passed in one of the following formats:
         * 1) mp4: path/to/video1, webm: path/to/video2, ogv: path/to/video3, poster: path/to/poster
         * 2) path/to/video
         * @see https://github.com/VodkaBears/Vide#readme
         * @param strPairs
         * @returns {*} normalized Vide plugin params as string.
         */
        function compactPairs(strPairs) {
            var str = strPairs.join(',');
            var videParamsNumber = (str.replace(/https?:/g, '').match(/:/g) || []).length;
            if (videParamsNumber == 0) return str; // 1-param options

            var pairs = strPairs.map(function(keyValueStr) {
                var arr = keyValueStr.split(':').map(function(str) {
                    return str.trim();
                });
                return [arr[0], arr.slice(1).join(':')];
            });

            var result = _.filter(pairs, function(pair) {
                    return pair[1] != '';
                })
                .map(function(pair) {
                    return pair.join(': ');
                })
                .join(', ');

            return result;
        }
    }
}());
