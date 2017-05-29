(function() {
    "use strict";

    angular
        .module('cardkit.pages')
        .controller('PageSettingsEditorController', PageSettingsEditorController);

    PageSettingsEditorController.$Inject = ['$scope', '$mdDialog', 'Pages', '$timeout', 'logger', '$q', 'fileManager', 'mediaLibrary', 'appConfig', 'Authentication'];

    function PageSettingsEditorController($scope, $mdDialog, Pages, $timeout, logger, $q, fileManager, mediaLibrary, appConfig, Authentication) {
        $scope.me = Authentication.cardkit.user;
        $scope.selectClient = $scope.me.role === 'admin';
        $scope.pageStatuses = appConfig.pageStatuses || [];
        $scope.uploadProgress = undefined;
        $scope.clients = $scope.clients || $scope.$parent.clients;

        $scope.selectClientConfig = {
            create: false,
            maxItems: 1,
            allowEmptyOption: false,
            labelField: 'companyName',
            valueField: '_id',
            searchField: 'companyName',
            sortField: 'companyName',
            onChange: function(value) {
                if (value === '') {
                    // reset to display placeholder
                    this.setValue(null);
                }
                else {
                    $scope.pageClient = _.find($scope.clients, { _id: value }) || $scope.pageClient;
                }
            }
        };

        $scope.deleteSocialImage = deleteSocialImage;
        $scope.editSocialImage = editSocialImage;
        $scope.hideDialog = hideDialog;
        $scope.loadClientTags = loadClientTags;
        $scope.saveDetails = saveDetails;
        $scope.showMediaLibrary = showMediaLibrary;
        $scope.showStatus = showStatus;
        $scope.statusAction = statusAction;
        $scope.uploadSocialImage = uploadSocialImage;
        $scope.validateDetails = validateDetails;
        $scope.triggerEvent = triggerEvent;

        $scope.$watch('page', loadPageDetails);
        $scope.$watch('pageName', function(pageName) {
            if (!$scope.pageUrlOriginal) {
                $scope.pageUrl = _.buildUrl(pageName);
            }
            if (!$scope.pageTitleOriginal) {
                $scope.pageTitle = pageName;
            }
        });

        function loadPageDetails(page) {
            $scope.pageNew = page && !page._id;
            $scope.pageName = page && page.name;
            $scope.pageUrl = page && (page.url || _.buildUrl(page.name));
            $scope.pageUrlOriginal = page && page.url;
            $scope.pageBasePath = (page && page.path || '').split('/').slice(0, -1).join('/'); // remove last pageUrl section
            $scope.pageTags = angular.copy(page && page.tags || []).map(function(tag) {
                delete tag.checked;
                return tag;
            });
            $scope.pageDescription = page && page.description;
            $scope.pageSocialImageUrl = page && page.socialImageUrl;
            $scope.pageTitle = page && (page.SEO_title || $scope.pageName);
            $scope.pageTitleOriginal = page && page.SEO_title;
            $scope.pageKeywords = page && page.SEO_keywords;
            $scope.pagePublished = page && (page.published || page.created);
            $scope.pageClient = page && page.client && _.findWhere($scope.clients, { _id: _.id(page.client) }) || $scope.pageClient;
            $scope.pageClientId = _.id($scope.pageClient);
            $scope.pageStatus = page && page.status;
            $scope.pagePublished = $scope.pagePublished && moment($scope.pagePublished).toDate();
            $scope.pageHideForClient = page && page.hideForClient;
            $scope.pagePreviewUrl = page && buildPreviewUrl(page);
            delete $scope.uploadProgress;
        }

        function loadClientTags(client, query) {
            if (!client) return $q.when([]);
            return Pages.queryTags({ query: query }, { clientName: client.companyName }).$promise;
        }

        function saveDetails(edit) {
            var error = $scope.validateDetails();
            if (error) {
                return logger.error(error);
            }

            var details = {
                autoedit: edit,
                client: $scope.pageClient,
                description: $scope.pageDescription,
                name: $scope.pageName,
                SEO_title: $scope.pageTitle,
                SEO_keywords: $scope.pageKeywords,
                published: $scope.pagePublished,
                hideForClient: $scope.pageHideForClient,
                socialImageUrl: $scope.pageSocialImageUrl,
                tags: $scope.pageTags,
                url: $scope.pageUrl,
                path: _.combinePath($scope.pageBasePath, $scope.pageUrl)
            };

            $mdDialog.hide(details);
            $scope.$emit('return-page-settings', details);
        }

        function hideDialog() {
            $mdDialog.cancel();
            $scope.$emit('return-page-settings', null);
        }

        function validateDetails() {
            if (($scope.pageName || '').trim() == '') return 'Error: Enter page name';
            if (($scope.pageUrl || '').trim() == '') return 'Error: Enter page url';
            if (($scope.pageUrl || '').indexOf('/') >= 0) return 'Error: page url can\'t contain slashes';
            if ($scope.selectClient && !$scope.pageClient) return 'Error: Select client';
            if (!isClientPageUrlUnique(_.combinePath($scope.pageBasePath, $scope.pageUrl), $scope.pageClient, $scope.page)) {
                return 'Error: It looks like the page url ' + $scope.pageUrl + ' is currently being used by another page. Please change the url title in the "page settings" dialog.';
            }
        }

        function uploadSocialImage(files) {
            var uploaded = _.isEmpty(files)
                ? fileManager.pickAndStore($scope.pageClient, { mimetype: 'image/*' })
                : fileManager.store(files[0], $scope.pageClient);

            return uploaded.then(function(url) {
                $scope.uploaded = true;
                $scope.pageSocialImageUrl = url;
            }, null, function(progress) {
                $scope.uploadProgress = progress;
            }).finally(function() {
                $timeout(function() {
                    delete $scope.uploadProgress;
                }, 2000);
            });
        }

        function showMediaLibrary(event, kind) {
            $scope.mediaLibraryOpen = true;
            var layout = $(event.target).closest('md-sidenav').length ? 'right' : null;
            mediaLibrary.show(event, $scope.pageClient, kind, layout).then(function(url) {
                $scope.pageSocialImageUrl = url;
            }).finally(function() {
                $scope.mediaLibraryOpen = false;
            });
        }

        function editSocialImage() {
            fileManager.editImage($scope.pageSocialImageUrl, $scope.pageClient).then(function(newUrl) {
                $scope.uploaded = true;
                $scope.pageSocialImageUrl = newUrl;
            });
        }

        function deleteSocialImage(event) {
            $scope.pageSocialImageUrl = null;
            delete $scope.uploadProgress;
        }

        function isClientPageUrlUnique(pageUrl, client, excludePage) {
            if (!client) return true;
            if (!$scope.pagesList) return true;

            var otherClientPages = _.filter($scope.pagesList.$$state.value, function(page) {
                if (excludePage && excludePage._id == page._id) return false;
                return _.id(page.client) == _.id(client);
            });

            var urls = _.chain(otherClientPages).map(function(p) {
                return p.path || p.url;
            }).map(normalizeUrl).compact().value();
            return !_.contains(urls, normalizeUrl(pageUrl));
        }

        function normalizeUrl(str) {
            return (str || '').toLowerCase().replace(/^\/*|\/*$/g, '');
        }

        function buildPreviewUrl(page) {
            var pageUrl = normalizePageUrl(page);
            var client = _.findWhere($scope.clients, { _id: _.id(page.client) }) || page.client;
            var previewUrl = _.combinePath('/pages/preview', client.slug || _.buildUrl(page.client.companyName), page.status, pageUrl);
            var siteUrl = client && (page.status == 'Live' && client.production_url || page.status == 'Preview' && client.beta_url);
            if (siteUrl) {
                if (!siteUrl.match(/^(http|\/\/)/i)) siteUrl = '//' + siteUrl;
                previewUrl = _.combinePath(siteUrl, pageUrl == 'home' ? null : pageUrl);
            }
            return previewUrl;
        }

        function normalizePageUrl(page) {
            var url = (page.path || page.url || _.buildUrl(page.name)).replace(/^\/|\/$/g, '');
            return url;
        }

        function showStatus(status) {
            if (!$scope.pageClient) return status != 'Preview';
            if (!$scope.pageClient.enablePreview) return status != 'Preview';
            return true;
        }

        function statusAction(status) {
            switch (status) {
                case 'Live':
                    return 'Publish Page';
                case 'Preview':
                    return 'Publish to Beta';
                case 'Closed':
                    return 'Close Page';
                case 'Draft':
                    return 'Make Draft';
                default:
                    return status + ' Page';
            }
        }

        function triggerEvent(eventName, param) {
            $scope.$emit(eventName, param);
        }
    }

}());
