(function () {
  'use strict'

  angular
        .module('cardkit.pages')
        .directive('newCard', newCard)

  newCard.$inject = ['cardsHelper', 'cardData', 'pagesHelper', 'editorService', '$compile', '$timeout', 'logger', '$sce', 'clientHelper', '$animate', '$location']

  function newCard (cardsHelper, cardData, pagesHelper, editorService, $compile, $timeout, logger, $sce, clientHelper, $animate, $location) {
    return {
      restrict: 'A',
      templateUrl: '/modules/cardkit/client/directives/pages/new-card.html',
      scope: {
        card: '=',
        client: '=',
        rendered: '&',
        builder: '=',
        htmlOnly: '='
      },
      transclude: true,
            // replace:true,
      link: function (scope, element, attrs) {
        var builderScope = scope.$parent.$parent
        var htmlOnly = scope.htmlOnly

        scope.uniqueID = function () {
          var text = ''
          var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

          for (var i = 0; i < 8; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length))
          }
          return text
        }

        scope.range = function (n) {
          return _.range(parseInt(n, 10) || 0)
        }

        var delayExpr = (attrs.delay || '').replace(/^{*|}*$/g, '')
        scope.delay = scope.$eval(delayExpr) || 0

        if (!htmlOnly) scope.card.html = cardsHelper.compileCardHtml(scope.card.html, scope.card)
        scope.card.changed = false
        delete scope.card.reference

        var classId = scope.uniqueID()
        scope.cardid = cardsHelper.generateRandomText()
        scope.clientid = _.id(scope.client)
        scope.index = attrs.index
        scope.html = scope.card.html
        scope.$eval(attrs.delay)

        scope.less = scope.card.less
        scope.js = scope.card.js
        scope.variables = scope.card.variables // user card variables

        var debouncers = {}
        scope.notifyCard = function (key, value) {
          if (scope.htmlOnly) return
          debouncers[key] = debouncers[key] || _.debounce(function (value) {
            if (/^\{\{.+}}$/.test(value)) value = '' // treat {{bindings}} as default empty string
            element.find('[medium-editor-model]').children().triggerHandler('bind-variable', { key: key, value: value })
          }, 500)
          debouncers[key](value)
        }

        scope.bindVariablesToScope = function () {
          if (!scope.card) return
          scope.card.actions.forEach(function (action) {
            try {
              var key = Object.keys(action)[0]
              console.log('bind', key, action[key])
              scope[key] = action[key]

              scope.notifyCard(key, action[key])

              if (typeof scope[key] === 'string' && scope[key].trim().match(/^https?:\/\//i)) {
                if (!scope.htmlOnly && $location.protocol() == 'https') {
                  var tmp = scope[key].trim().split(':')
                  if (tmp[0] == 'http') scope[key] = 'https:' + tmp.slice(1).join(':')
                }
                scope[key] = $sce.trustAsResourceUrl(scope[key])
              }
            } catch (err) {
            }
          })
        }

        scope.removeCard = function () {
          element.find('#deleteCardModal').modal2('hide')
          editorService.destroyEditor()
          $timeout(function () {
                        // angular.element(document.querySelector('.buildPage')).removeClass('hidden');
                        // angular.element(document.querySelector('.editCard')).addClass('hidden');
            builderScope.toggleCardSettings(false)
            cardData.removeCard(scope.$parent.newPage.cards, scope.card)
            builderScope.isPageDirty = true
            builderScope.page.saveWholePage = true
          }, 300)
        }

        scope.duplicateCard = function () {
          element.find('#duplicateCardModal').modal2('hide')
          $timeout(function () {
            cardData.duplicateCard(scope.$parent.newPage.cards, scope.card)
            builderScope.isPageDirty = true
            logger.info('Card duplicated below')
          }, 300)
        }

        scope.setActiveCard = function () {
          cardData.setActiveCard(scope.card)
                    // angular.element(document.querySelector('.buildPage')).addClass('hidden');
                    // angular.element(document.querySelector('.editCard')).removeClass('hidden');
          scope.$parent.openCardSettingsSidebar()
        }

        scope.openDeleteModal = function () {
          element.find('#deleteCardModal').modal2('show')
        }

        scope.openDuplicateModal = function () {
          element.find('#duplicateCardModal').modal2('show')
        }

        var renderHtml, resetting
        $timeout(renderHtml = function () {
          var client = scope.client || builderScope.client || builderScope.pageClient || (builderScope.page || {}).client || {}
          var less_scope = scope.css || (scope.less ? (clientHelper.addClietVariesToLess(client.variables) + scope.less) : scope.card.css)
          var less_content = scope.css ? less_scope : (htmlOnly ? '' : '.cardkit .page.content ') + '.card-' + classId + '{ \n' + less_scope + ' \n}'
          less.render(less_content).catch(function (err) {
            var msg = 'Error with LESS'
            if (err.message) msg += ': ' + err.message
            logger.error(msg)

                        // fallback to the compiled card css
            return { css: scope.card.css }
          }).then(function (output) {
            scope.css = output.css || '' // cache compiled css

            var content = ''
            if (scope.card.original_html === '') {
              var ori_content = ''
              ori_content += '<div medium-editor-model ng-model="card.html">' + scope.card.html + '</div>'
              ori_content += '<style parse-style dynamic-css-binding="">' + scope.css + '</style><div style="clear:both"></div>'
              var ori_compiledContent = $compile(ori_content)(scope)
              scope.card.original_html = $(ori_compiledContent[0]).html()
            }
            if (scope.js !== '') {
              if (jQuery(scope.card.html).find('#masterslider').length > 0) {
                var dom_element = jQuery(scope.card.html)
                var ms_container = jQuery(dom_element).find('.ms-slide')
                jQuery(dom_element).find('#masterslider').empty()
                jQuery(dom_element).find('#masterslider').append(ms_container)
                scope.card.html = jQuery(dom_element).get(0).outerHTML
              }
            }

            scope.js = (scope.js || '').replace(/(\$\(\')([^\']*)/g, function (m, g1, g2) {
              var prefix = '.card-' + classId + ' '
              return g1 + prefix + g2.replace(prefix, '')
            })

            content += '<div class="card-' + classId + '"><div medium-editor-model ng-model="card.html"' + (scope.builder ? ' class="builder"' : '') + '>' + scope.card.html + '</div></div>'

            content += scope.js ? '<script>setTimeout(function() {\n' + scope.js + '\n}, 1)</script>' : ''
            content += '<style parse-style dynamic-css-binding="">' + output.css + '</style><div style="clear:both"></div>'

            var compiledContent = $compile(content)(scope)
            $(compiledContent).find('>*').addClass('card-content')
            $animate.enabled(compiledContent, false)
            element.append(compiledContent)

            $timeout(function () {
              scope.$emit('updateCardHtml', true)
            })

            if (!resetting && !scope.card.reset &&
                            (element.find('[data-post-template]').length > 0 ||
                                element.find('[data-product-template]').length > 0 ||
                                element.find('[data-dynamic-template]').length > 0)) {
              resetting = true
              $timeout(function () {
                cardsHelper.compileCardHtml(scope.card.html, scope.card, false).then(function (html) {
                  $timeout(function () { resetting = false })
                  if (html == scope.card.html || html == scope.html) return
                  scope.card.html = scope.html = html
                  scope.card.reset = true
                })
              })
            }

            scope.rendered()

            var client = builderScope.client || builderScope.pageClient || builderScope.selectedClient
            if (!htmlOnly && client) {
              editorService.renderEditor(client, builderScope)
            }
          }).catch(function (err) {
            console.error(err)
            var msg = 'Error with LESS'
            if (err.message) msg += ': ' + err.message
            logger.error(msg)
          })
        }, scope.delay)

        scope.$watch('card.reset', function (reset) {
          if (!reset) return
          element.find('.card-content').remove()
          element.find('script,style').remove()
          element.find('>*:empty').remove()
          renderHtml()
          scope.card.reset = false
        })

        scope.$watch(function () {
          return scope.card.actions
        }, function (actions) {
          if (actions) {
            scope.bindVariablesToScope()
          }
        }, true)

        if (!htmlOnly) {
          scope.$watch('card.html', function (html, oldHtml) {
            if (html == oldHtml) return

            if ($(oldHtml).find('.editable').length != $(html).find('.editable').length) {
                        // re-render medium editor for new html
              var client = builderScope.client || builderScope.pageClient || builderScope.selectedClient
              if (client) {
                editorService.destroyEditor()
                element.find('[medium-editor-model]').html(html)
                $animate.enabled(element, false)
                $timeout(function () {
                  editorService.renderEditor(client, builderScope, true)
                })
              }
            }
          })
        }
      }

    }
  }
}())
