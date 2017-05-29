(function() {
    'use strict';

    angular
        .module('cardkit.pages')
        .service('mediaLibrary', mediaLibrary);

    mediaLibrary.$inject = ['$mdDialog', '$timeout'];

    function mediaLibrary($mdDialog, $timeout) {
        var me = this;

        me.show = function(event, client, kind, layout) {
            var promise = $mdDialog.show({
                targetEvent: event,
                clickOutsideToClose: true,
                focusOnOpen: false,
                skipHide: true,
                templateUrl: '/modules/cardkit/client/directives/pages/media-library-popup.html',
                controller: 'mediaLibraryPopupController',
                locals: {
                    element: event.target,
                    client: client,
                    typeFilter: kind
                }
            });

            if (layout == 'right') {
                positionDialogRight(event.target);
            }

            return promise;
        };

        function positionDialogRight(target) {
            var $dropzone = $(target).closest('.file-toolbar').siblings('.dropzone, md-input-container').first();
            var rect = $dropzone[0].getBoundingClientRect();

            var completed = false;
            relayout();

            // race conditions with material framework possible, just make sure it's finally positioned (once)
            $timeout(relayout);
            $timeout(relayout, 10);
            $timeout(relayout, 120);
            $timeout(relayout, 300);
            $timeout(relayout, 500);

            function relayout() {
                if (completed) return;

                var $container = $('.md-dialog-container').addClass('media-library');
                var $dialog = $container.find('md-dialog');

                if ($dialog.length == 0) return;

                var dialogBottom = rect.top + $dialog.height();
                var windowHeight = $(window).height() - 5; // 5px offset
                var dialogOffset = dialogBottom > windowHeight ? windowHeight - dialogBottom : 0;

                // make sure popup in page builder area and doesn't cover nav or subHeader (140px)
                if (rect.top + dialogOffset < 140) {
                    dialogOffset = -rect.top + 140;
                }

                $dialog.css({
                    left: (rect.right + 12) + 'px',
                    top: (rect.top + dialogOffset) + 'px'
                });

                if (dialogOffset < 0) {
                    $dialog.find('.arrow-left').css('margin-top', -dialogOffset + 'px').show();
                }

                completed = true;
            }
        }
    }
})();
