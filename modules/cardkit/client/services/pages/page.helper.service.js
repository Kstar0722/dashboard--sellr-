(function () {
  'use strict'

  angular
        .module('cardkit.pages')
        .factory('pagesHelper', pagesHelper)

  pagesHelper.$inject = ['$http', 'logger', '$compile', '$state', 'cardData', '$rootScope', '$timeout', 'Pages', 'Authentication', '$q', 'Cards', 'cardsHelper', 'pagesHtmlHelper', 'editorService']

  function pagesHelper ($http, logger, $compile, $state, cardData, $rootScope, $timeout, Pages, Authentication, $q, Cards, cardsHelper, pagesHtmlHelper, editorService) {
    var handleConflicts = pagesHtmlHelper.handleConflicts
    var done, scope, fakeProgress

    var service = {
      setHeaderFooter: setHeaderFooter,
      getCardByName: getCardByName,
      getActions: getActions,
      adoptPageDataStructure: adoptPageDataStructure,
      filterOnlyClientPages: filterOnlyClientPages, // (@param1: ARRAY of pages,  @params2: client name STRING )
      adoptPagesDataStructure: adoptPagesDataStructure,
      updatePageBuilder: updatePageBuilder,
      resetPageBuilder: resetPageBuilder,
      exportPageBuilder: exportPageBuilder,
      exportListPage: exportListPage,
      publishPages: publishPages,
      populateDOMChanges: populateDOMChanges
    }

    return service

    function resetPageBuilder (scope) {
      scope.isPageDirty = false
      scope.vleavePage = true
      $state.go('cardkit.listPages')
    }

    function updatePageBuilder (_scope) {
      if (done) return // in progress

      scope = _scope.$new()

      var original = scope.page
      if (original.status == 'Live' || original.status == 'Preview') return scope.exportPage()

      done = asyncTask(function () {
        var editingPage = scope.newPage
        reportProgress(0, 'Saving page...')
        return resetPlugins('#pageBuilder .cards-container').then(function () {
          return resetBindings(editingPage)
        }).then(function () {
          reportProgress(37)
          var page = scope.savingPage = _.deepClone(editingPage)
          fakeProgress = $timeout(function () { reportProgress(70) }, 5000)
          return savePage(page).then(function (page) {
            $timeout.cancel(fakeProgress)
            reportProgress(100, 'Saved page.')
            logger.success('Page updated successfully')
            return page
          }).catch(function (err) {
            console.error(err)
            throw 'Error updating page' + prefix(': ', requestErrorMessage(err))
          })
        })
      })

      return done.promise
    }

    function exportListPage (_scope, client) {
      if (done) return // in progress

      done = asyncTask(function () {
        scope = _scope.$new()

        var editingPage = scope.newPage
        return stabilize(scope).then(function () {
          return Pages.get({ pageId: _.id(editingPage) }).$promise
        }).then(function (serverPage) {
          var page = scope.savingPage = _.deepClone(serverPage)
          scope.pageClient = client || page.client
          return compileSourceCode(page).then(function () {
            reportProgress(70, 'Syncing files with your server...')
            return savePage(page)
          }).then(function () {
            reportProgress(90, 'Completing update...')
            return publishPage(page)
          })
        })
      })

      return done.promise
    }

    function exportPageBuilder (_scope) {
      if (done) return // in progress

      done = asyncTask(function () {
        scope = _scope.$new()

        var editingPage = scope.newPage
        var page = scope.savingPage = _.deepClone(editingPage)
        return resetPlugins('#pageBuilder .cards-container').then(function () {
          return compileSourceCode(page)
        }).then(function () {
          return resetBindings(page)
        }).then(function () {
          reportProgress(47, 'Saving page...')
          fakeProgress = $timeout(function () { reportProgress(60) }, 5000)
          return savePage(page).then(function (saved) {
            $timeout.cancel(fakeProgress)
            reportProgress(80, 'Completing update...')
            return publishPage(saved)
          }).catch(function (err) {
            console.error(err)
            throw 'Error updating page' + prefix(': ', requestErrorMessage(err))
          })
        })
      })

      return done.promise
    }

    function filterOnlyClientPages (allPages, clientName) {
      if (clientName instanceof Array) {
        return _.flatten(_.map(clientName, function (client) {
          return filterOnlyClientPages(allPages, client)
        }))
      }

      var filteredPages = _.filter(allPages, function (n) {
        return n.client && n.client.companyName === clientName
      })
      return filteredPages || []
    }

    function getActions (variables) {
      var actions = []
      if (variables == undefined) { return }
      for (var i = 0; i < variables.length; i++) {
        if (!variables[i]) continue
        var temp = {}
        var shortCode = variables[i].shortCode

        if (variables[i].kind !== 'File' && variables[i].kind !== 'Video' && variables[i].kind !== 'Template Variable') {
          var valuesLength = 0
          if (variables[i].value) valuesLength = variables[i].value.length
          valuesLength > 1 ? temp[variables[i].shortCode] = '{{' + variables[i].shortCode + '}}' : temp[variables[i].shortCode] = variables[i].value
        } else {
                    // temp[shortCode] = variables[i].value || 'https://placeholdit.imgix.net/~text?txtsize=30&txt=height%20%C3%97%20width%20&w=200&h=150';
          temp[shortCode] = variables[i].value || ''
        }

        actions.push(temp)
      }
      return actions
    }

    function publishPages (client, pages) {
      var pendingPages = getPublishPendingPages(client, pages)
      var pendingStatuses = _.chain(pendingPages).pluck('status').compact().uniq().value()

      var pro_refreshUrl = client.production_refresh_url || ''
      var beta_refreshUrl = client.beta_refresh_url || ''

      var requests = pendingStatuses.map(function (status) {
        var published
        if (status == 'Live' && pro_refreshUrl != '') {
          published = $http.post(pro_refreshUrl).catch(function (err) {
            if (err.status > 0) return $q.reject(err)
          })
        } else if (status == 'Preview' && beta_refreshUrl != '') {
          published = $http.post(beta_refreshUrl).catch(function (err) {
            if (err.status > 0) return $q.reject(err)
          })
        }

        return published
      })

      return $q.all(requests)
    }

        /*
         adopting data for saving pages, removing unnecessary things from card object, adding actions
         */
    function adoptPageDataStructure (card) {
      delete card.__v
      delete card.activeImage
      delete card.cardStatus
      delete card.claimedBy
      delete card.timelog
      delete card.notes
      delete card.user
      delete card.cardsOrder
      if (card.images.length) {
        var image = card.images[0].thumbUrl || card.images[0].url
      }
      card.displayImage = image || '//developer-agent.com/wp-content/uploads/2015/05/images_no_image_jpg3.jpg'
      card.actions = getActions(card.variables)
      return card
    }

    function adoptPagesDataStructure (cards) {
      for (var i = 0; i < cards.length; i += 1) {
        cards[i] = adoptPageDataStructure(cards[i])
      }
      return cards
    }

    function getCardByName (cards, name) {
      for (var i in cards) {
        if (cards[i] && cards[i].cardName === name) {
          var result = [cards[i], i]
          return result
        }
      }
      return false
    }

    function setHeaderFooter (clients, admin) {
      if (clients) {
        if (admin) {
          $('#clientFooter').empty()
          $('#clientHeader').empty()
        }

        var $header = $(handleConflicts(clients.header))
        $('#clientHeader').append($header)

        var $footer = $(handleConflicts(clients.footer))
        $('#clientFooter').append($footer)

        localStylesheet(clients.css).then(function (output) {
          if (output.css) $('#clientHeader').append('<style>' + output.css + '</style>')
        })

        if (clients.js) $('#clientFooter').append('<script>' + clients.js + '</script>')

        logger.info('Setting ' + clients.companyName + ' header & footer')
      } else {
        $('#clientFooter').empty()
        $('#clientHeader').empty()
        logger.info('Removing header & footer')
      }
    }

    function populateDOMChanges (dom) {
      dom = dom || document

      var done = $q.defer()
      $timeout(function () { done.resolve() }, 100)

      $(dom).find('[medium-editor-model]').each(function () {
        $(this).trigger('DOMSubtreeModified')
      })

      return done.promise
    }

    function compilePageDom (scope) {
      var compiledContent = _.map(scope.savingPage.cards, function (card, i) {
        var cardEl = document.createElement('div')
        $(cardEl).attr('new-card', '').attr('card', 'savingPage.cards[' + i + ']').attr('client', 'pageClient').attr('index', i).attr('html-only', 'true')
        return compileHtml(cardEl, scope)
      })

      return stabilize(scope).then(function () {
        var pageDom = document.createElement('div')
        $(pageDom).hide().appendTo(document.body)

        _.each(compiledContent, function (cardEl, i) {
          var cardDom = document.createElement('div')
          var $card = $(cardEl)
          var cardHtml = cleanUpHtml($card)
          $(cardDom).html(cardHtml)
          pageDom.appendChild(cardDom)
        })

        return stabilize(scope).then(function () {
          resetPlugins(pageDom)
          resetPlugins('#pageBuilder .cards-container')
          populateDOMChanges(pageDom)
          return pageDom
        })
      }).then(promiseStable(scope, 500))
    }

    function getPublishPendingPages (client, pages) {
      var pro_refreshUrl = client.production_refresh_url || ''
      var beta_refreshUrl = client.beta_refresh_url || ''

      var clientName = client && client.companyName || client
      var clientPages = client ? _.filter(pages, function (page) {
        return (page.client || {}).companyName == clientName
      }) : pages

      var pendingPages = _.filter(clientPages, function (page) {
        return page.status == 'Preview' || page.status == 'Live'
      })
      var pendingStatuses = _.chain(pendingPages).pluck('status').compact().uniq().value()

      pendingPages = _.chain(pendingStatuses).map(function (status) {
        if (status != 'Live' && status != 'Preview') return []
        if (status == 'Live' && pro_refreshUrl == '') return []
        if (status == 'Preview' && beta_refreshUrl == '') return []
        return _.where(pendingPages, { status: status })
      }).flatten().compact().value()

      return pendingPages
    }

    function resetActions (page) {
      if (page.cards) {
        page.cards.forEach(function (card) {
          card._actions = angular.copy(card.actions)

          card.html = cardsHelper.compileCardHtml(card.html, card)

          cardData.resetScopeVariables(card)

          $('[data-vide-bg]').each(function () {
            var instance = $.data(this, 'vide')
            if (instance) instance.destroy()
          })
        })
      }

            // #warning apply reset variables (like {{target_url}}) before saving the page html.
            // otherwise variables will become broken (not bindable) on page refresh.
      $rootScope.$emit('updateCardHtml', true)

      return {
        restore: function () {
          $timeout(function () {
            $rootScope.$emit('updateCardHtml', true)
          })
          $timeout(function () {
            $rootScope.$emit('updateCardHtml', true) // restore vide plugins
          }, 1500)

          if (page.cards) {
            page.cards.forEach(function (card) {
              _.each(card._actions || card.tempActions, function (value, key) {
                card.actions[key] = value
              })
            })
          }

          card.html = cardsHelper.assembleCardHtml(card.html)
        }
      }
    }

    function cleanUpHtml (dom) {
      var $dom = $(dom)
      resetPlugins(dom)
      $dom.html(editorService.cleanUpHtml($dom))

      $dom = $dom.clone()
      $dom.find('.controls_wrapper').remove()
      $dom.find('.custom-modal').remove()
      $dom.find('#clientHeader').remove() // don't copy client header/footer, just reference it to avoid versioning problems.
      $dom.find('#clientFooter').remove()
      $dom.find('.repeat-variable>template').remove()
      $dom.find('.repeat-variable>item').contents().unwrap()
      $dom.find('.repeat-variable').contents().unwrap()
      $dom.find('.autogenerated').remove()
      $dom.find('[autogenerated]').remove()
      $dom.find('[contenteditable]').attr('contenteditable', 'false')

            // remove target hash synthetic query param (used for "Open in New Window" feature).
      $dom.find('a[href][target]').each(function () {
        var url = $(this).attr('href')
        var newUrl = url.replace(/#~.*/, '') // remove target hash
        $(this).attr('href', newUrl)
      })

      var cleanIds = ['export_sortable', 'export_sortable2', 'sortable', 'sortable2']
      cleanIds.forEach(function (id) {
        $dom.find('#' + id).removeAttr(id)
      })

      var cleanClassRegex = /^ng-/i
      $dom.find('*').add($dom).each(function () {
        var foundClasses = _.filter(this.classList, function (cl) {
          return cl.match(cleanClassRegex)
        })
        if (!foundClasses.length) return
        var $element = $(this)
        foundClasses.forEach(function (cl) {
          $element.removeClass(cl)
        })
      })

      var cleanAttrRegex = /^(ng|md)-/i
      $dom.find('*').add($dom).each(function () {
        var foundAttrs = _.filter(this.attributes, function (attr) {
          return attr.name.match(cleanAttrRegex)
        })
        if (!foundAttrs.length) return
        var $element = $(this)
        foundAttrs.forEach(function (attr) {
          $element.removeAttr(attr.name)
        })
      })

      var html = $dom.html()
      html = html.replace(/<script class="">setTimeout\(function\(\) { {2}}, 1\)<\/script>/gi, '')
            // html = html.replace(/{{[^}]+}}\s*/gi, ''); // strip {{xxxxxxx}} bindings out

            // formatting
      html = html.replace(/(class|id)="\s*"\s*/gi, '') // remove empty class
      html = html.replace(/class="([^"]*)"/gi, function (match, capture) {
        return 'class="' + (capture || '').trim() + '"' // trim class string
      })
      html = html.replace(/<([^ >]+)\s*>/gi, '<$1>') // trim attributes
      html = html.replace(/"\s*>/gi, '">')

      return html.trim()
    }

    function emptyActions (card) {
      _.each(card.actions, function (action) {
        var shortCode = _.keys(action)[0]
        if (!action || !shortCode) return

        if (getActionKind(card, shortCode) == 'Pages List') {
          var url = (action[shortCode] || '').split('#~')[0]
          if (!url || url == ('{{' + shortCode + '}}')) {
            action[shortCode] = ''
          }
        } else if (action[shortCode] == ('{{' + shortCode + '}}')) {
          action[shortCode] = ''
        }
      })
    }

    function getActionKind (card, shortCode) {
      var variable = _.findWhere(card.variables, { shortCode: shortCode })
      return variable && variable.kind
    }

    function promiseStable (scope, timeout) {
      return function (res) {
        return stabilize(scope, timeout).then(function () {
          return res
        })
      }
    }

        /**
         * Stabilizes scope until chained digest cycles are finished
         * @param scope
         * @returns {*} $q.promise object with success bool param
         */
    function stabilize (scope, timeout) {
      try {
        var defer = $q.defer()

        $timeout(function () {
          var scope2 = $rootScope.$new()
          scope2._stabilizing = true
          var stabilizingDispose = scope2.$watch('_stabilizing', function (stabilizing) {
            if (stabilizing) return
            stabilizingDispose()
            delete scope2._stabilizing
            $timeout(function () {
              scope2.$destroy()
            })
            defer.resolve(true)
          })
          $timeout(function () {
            scope2._stabilizing = false
          })
        }, timeout || 51)

        return defer.promise
      } catch (ex) {
        console.error('scope stabilize failed', ex)
        return $q.when(false) // graceful fallback, scope stabilized
      }
    }

    function prepareSavingPage (savingPage, saveWholePage) {
      var updatePage = _.deepClone(savingPage)
      var partialUpdate = !saveWholePage && _.where(updatePage.cards, { changed: true })

      updatePage.cards = updatePage.cards || []
      for (var i = 0; i < updatePage.cards.length; i++) {
        if (partialUpdate && partialUpdate.length > 0 && !_.contains(partialUpdate, updatePage.cards[i])) {
          updatePage.cards[i] = new Cards({ _id: updatePage.cards[i]._id, reference: true })
        } else {
          updatePage.cards[i].actions = savingPage.cards[i].tempActions
          updatePage.cards[i].html = cardsHelper.cleanUpCardHtml(updatePage.cards[i].html)
        }

        delete updatePage.cards[i].changed
      }

      return new Pages(updatePage)
    }

    function requestErrorMessage (response) {
      return response && response.data && response.data.message
    }

    function prefix (str, value) {
      if (value) return str + value
      return ''
    }

    function compileHtml (content, scope) {
      var element = $compile(angular.element(content))(scope)
      $(document).width() // triggers browser reflow event
      if (!scope.$$phase) scope.$digest()
      return element
    }

    function extractDomStyles (dom) {
      var styles = []
      $(dom).find('style').each(function () {
        styles.push($(this).get(0).innerHTML)
      })
      $(dom).find('style').remove()
      return styles
    }

    function localStylesheet (css) {
      var defer = $q.defer()
      if (!css || !css.trim()) return $q.when(css)
      var scope = '.cardkit .page.content'

            // return $q.when(css);
      less.render(scope + ' { ' + css.replace(/\bbody\b/gi, '&') + ' } ').then(function (output) {
        defer.resolve(output)
      }).catch(function (err) {
        var msg = 'Error with Global CSS'
        if (err.message) msg += ': ' + err.message
        logger.error(msg)

                // fallback to the original CSS
        defer.resolve(css)
      })

      return defer.promise
    }

    function asyncTask (callback) {
      done = $q.defer()
      done.promise.finally(function () { done = null })
      $timeout(function () {
        try { $q.when(callback()).then(done.resolve, done.reject) } catch (ex) { done.reject(ex) }
      })
      $timeout(function () { if (done) done.reject('timed out') }, 5 * 60000) // timeout 5min
      return done
    }

    function reportProgress (value, status) {
      if (done) done.notify({ progress: value, status: status })
    }

    function resetPlugins (dom) {
      var $dom = $(dom)
      try {
        $dom.find('.modal.in').modal('hide')
      } catch (ex) {
        $dom.find('.modal').removeClass('in').css({ display: 'none' }) // force bootstrap modals hidden (when they only have display:block css)
      } finally {
        $dom.find('.modal-backdrop').removeClass('in').css({ display: 'none' })
        return populateDOMChanges(dom)
      }
    }

    function resetBindings (page) {
      var memento = resetActions(page)
      done.promise.finally(memento.restore)
      return stabilize(scope, 500)
    }

    function compileSourceCode (page) {
      return compilePageDom(scope).then(function (pageDom) {
        var exportCSS = extractDomStyles(pageDom).join('\n')
        page.sourceCode = $(pageDom).get(0).innerHTML
        page.exportedCSS = exportCSS

        $(pageDom).remove()
      })
    }

    function savePage (page) {
      var original = scope.page
      if (!page.updateHistory) page.updateHistory = original && original.updateHistory || []
      page.updateHistory.push({ date: new Date(), user: Authentication.cardkit.user.displayName })
      page.client = scope.pageClient || scope.selectedClient || scope.client

      var pageId = (original || page)._id
      var savingPage = prepareSavingPage(page, original && original.saveWholePage)
      var updated = Pages.update({ pageId: pageId }, savingPage).$promise

      updated = updated.catch(function (err) {
        console.warn(err.status, requestErrorMessage(err))
        if (err.status != 400) return $q.reject(err)
        savingPage = prepareSavingPage(page, true)
        return savingPage.$update({ pageId: pageId })
      })

      return updated.then(function (page) {
        scope.newPage.updateHistory = page.updateHistory
        return page
      })
    }

    function publishPage (page) {
      return publishPages(page.client, [page])
                .catch(function (response) { console.warn(response) })
                .then(promiseStable(scope))
                .then(function () { return page })
    }
  }
})()
