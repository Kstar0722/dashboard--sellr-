(function () {
  'use strict'

  angular
        .module('cardkit.pages')
        .directive('cardVariableFile', cardVariableFile)

  cardVariableFile.$inject = ['cardsHelper', 'appConfig', 'cardData', 'logger', '$rootScope', '$sce', '$window', '$timeout', 'fileManager', 'mimeTypeService', 'mediaLibrary', 'MediaAssets']

  function cardVariableFile (cardsHelper, appConfig, cardData, logger, $rootScope, $sce, $window, $timeout, fileManager, mimeTypeService, mediaLibrary, MediaAssets) {
    return {
      restrict: 'A',
      templateUrl: '/modules/cardkit/client/directives/pages/card-variable-file.html',
      scope: {
        kind: '@cardVariableFile',
        variableName: '@name',
        shortCode: '@shortcode',
        renderme: '@render',
        client: '='
      },
      link: function (scope, element, attrs, ctrls) {
        scope.displayKind = (scope.kind == 'video' ? 'Video' : 'File')
        scope.mimeTypeService = mimeTypeService

        scope.card = cardData.getActiveCard
        scope.AWS = appConfig.credentialsAWS

        if (scope.client) {
          scope.mediaLibrary = scope.$parent.mediaLibrary || MediaAssets.getClientLibrary(null, { clientSlug: scope.client.slug || scope.client.companyName })
        }

        scope.$watch(function () {
          return cardData.getActiveCard()
        }, function (newValue) {
          console.log(newValue)
          if (newValue) {
            angular.forEach(newValue.actions, function (item, index) {
              if (!item) return
              var key = Object.keys(item)[0]
              if (scope.shortCode === key) {
                scope.currentImage = item[key]
                                // scope.variableValue = scope.currentImage || attrs.value || appConfig.defaultImg;
                scope.variableValue = scope.currentImage || attrs.value || ''
                scope.renderme = scope.variableValue ? 'renderme' : ''

                scope.variableValue = $sce.trustAsResourceUrl(scope.variableValue)
              }
            })
          }
        })

        function setValue (shortCode, value) {
          for (var i = 0; i < scope.card().actions.length; i += 1) {
            var action = scope.card().actions[i]
            if (action && typeof action[shortCode] !== 'undefined') {
              action[shortCode] = value
              scope.variableValue = value
              scope.variableValue = $sce.trustAsResourceUrl(scope.variableValue)
            }
          }
          $rootScope.$emit('updateCardHtml')
        }

        scope.upload = function (files) {
          var uploaded = _.isEmpty(files)
                        ? fileManager.pickAndStore(scope.client)
                        : fileManager.store(files[0], scope.client)

          if (files) scope.uploadProgress = 0
          return uploaded.then(function (url) {
            scope.uploaded = true
            var action = _.findItemByKey(scope.card().actions, scope.shortCode)
            resolveImageFixedSize(action, 2000, 2000)
            setValue(scope.shortCode, url)
            logger.success(scope.displayKind + ' uploaded successfully')
          }, function (err) {
            delete scope.uploadProgress // immediately
            if (err) console.error(err)
          }, function (progress) {
            scope.uploadProgress = progress
            scope.variableValue = null
          }).finally(function () {
            $timeout(function () {
              delete scope.uploadProgress
            }, 2000)
          })
        }

        scope.editImage = function () {
          fileManager.editImage(scope.variableValue, scope.client).then(function (newUrl) {
            scope.uploaded = true
            setValue(scope.shortCode, newUrl)
          })
        }

        scope.deleteSelectedImage = function (event, short) {
                    // var reset = '{{' + short + '}}';
          var reset = ''
          setValue(short, reset)
          delete scope.uploadProgress
          scope.$root.$emit('updateCardHtml')
        }

        scope.showMediaLibrary = function (event, kind) {
          scope.mediaLibraryOpen = true
          mediaLibrary.show(event, scope.client, kind, 'right').then(function (url) {
            var action = _.findItemByKey(scope.card().actions, scope.shortCode)
            resolveImageFixedSize(action, 2000, 2000)
            setValue(scope.shortCode, url)
          }).finally(function () {
            scope.mediaLibraryOpen = false
          })
        }

                /**
                 * Calculates fixed image dimensions according to CSS stylesheet from page builder.
                 * Used for image optimization + resizing feature.
                 * @returns {width, height} fixed image size
                 */
        function resolveImageFixedSize (action, maxWidth, maxHeight) {
          var oldValue = _.values(action)[0]
          if (!oldValue) return {}

          var $body = $('.page.content')
          var $usages = $body.find('img').filter(function () {
            return $(this).attr('src') == oldValue
          })
                        .add($body.find('*').filter(function () {
                          return ($(this).css('background-image') || '').contains(oldValue)
                        }))

          var sizes = $usages.map(function () {
            var styles = _.chain($window.getMatchedCSSRules(this)).pluck('style').flatten().value().concat([this.style])
            var fixedWidth = fixedSizePx(styles, 'max-width') || fixedSizePx(styles, 'width')
            var fixedHeight = fixedSizePx(styles, 'max-height') || fixedSizePx(styles, 'height')

            return {
              width: fixedWidth || undefined,
              height: fixedHeight || undefined
            }
          })

          var result = {
            width: _.max(sizes, 'width').width, // or undefined
            height: _.max(sizes, 'height').height // or undefined
          }

          result.width = result.width && maxWidth && Math.min(result.width, maxWidth)
          result.height = result.height && maxHeight && Math.min(result.height, maxHeight)

          return result
        }

                /**
                 * Extract fixed size css property value among the whole element stylesheet,
                 * if some percentage declared, consider css property as floating size and return undefined.
                 * @param styles CSS stylesheet
                 * @param cssProperty lookup property
                 * @returns {Number} property fixed size (if any)
                 */
        function fixedSizePx (styles, cssProperty) {
          var propertyValuesPx = _.chain(styles).pluck(cssProperty).compact().map(toPx).value()
          if (propertyValuesPx.length && _.every(propertyValuesPx)) {
            return _.max(propertyValuesPx)
          }
        }

                /**
                 * Parses out pixels number from css property value.
                 * covers: 100px, 500, -20
                 * ignores: 50%, 30vh
                 * @param str
                 * @returns {Number} Pixels number.
                 */
        function toPx (str) {
          var m = (str || '').match(/([\d.]+)(px)?$/i)
          return m && m[1] && parseFloat(m[1])
        }
      }
    }
  }
}())
