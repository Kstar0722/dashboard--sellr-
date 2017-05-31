(function () {
  'use strict'

  angular
        .module('cardkit.cards')
        .factory('cardsHtmlHelper', cardsHtmlHelper)

  cardsHtmlHelper.$inject = ['$rootScope', '$q']

  function cardsHtmlHelper ($rootScope, $q) {
    var service = {
      cleanUpCardHtml: cleanUpCardHtml,
      compileCardHtml: compileCardHtml,
      assembleCardHtml: assembleCardHtml,
      generateUniqueName: generateUniqueName
    }
    return service

    function cleanUpCardHtml (html) {
      var newHtml = html

            // jQuery bug: it can't handle <a> inside <a> and split them up.
            // you can try and compare: $('<div><a href="#test1"><div>test <a href="#test2">link</a></div></a><div>').html()
            // $(html).remove('.medium-insert-buttons');

            // strip out .medium-insert-buttons element manually
      var start = newHtml.indexOf('<div class="medium-insert-buttons')
      while (start >= 0) {
        var end = newHtml.indexOf('</div>', start)
        newHtml = newHtml.substring(0, start) + newHtml.substring(end + '</div>'.length)
        start = newHtml.indexOf('<div class="medium-insert-buttons')
      }

            // remove not yet uploaded images
      var $tmp = $('<div>').html(newHtml)
      $tmp.find('.image.uploading').remove()
      newHtml = $tmp.html()

            // remove redundant classes caused by Angular inline bindings in class attribute that are saved improperly
            // (probably due to race condition between DOM saving and Angular animation).
      newHtml = newHtml.replace(/[^ {}"\\]*-add-add[^ {}"\\]*/g, '')

            // remove duplicated classes that crash the whole page builder down.
      $('<div>').html(newHtml).find('[class]').each(function () {
        var list = this.classList
        var classes = _.uniq(list)

        var redundantClasses = _.filter(classes, function (cl) {
          return cl.indexOf('-add-add') || cl.indexOf('add-remove')
        })
        _.each(redundantClasses, function (cl) {
          list.remove(cl)
        })

        var duplicates = _.filter(classes, function (cl) {
          return _.filter(list, function (li) {
            return cl == li
          }).length > 1
        })
        _.each(duplicates, function (cl) {
          list.remove(cl) // including duplicates
          list.add(cl)
        })
      })

      newHtml = assembleCardHtml(newHtml)

      return newHtml
    }

    function compileCardHtml (html, card, immediate, placeholders, ignoreBrokenBindings) {
      if (typeof html === 'object') {
        ignoreBrokenBindings = placeholders
        placeholders = immediate
        immediate = card
        card = html
        return compileCardHtml(card.html, card, immediate, placeholders, ignoreBrokenBindings)
      }

      immediate = typeof immediate === 'boolean' ? immediate : true

      html = cleanUpCardHtml(html)
      html = html.replace(/\n/g, '')

      if (ignoreBrokenBindings) {
        html = removeIncompleteBindings(html)
      }

      if (placeholders) {
        html = bindPlaceholders(html, card)
      }

            // compile Repeat card variables
      var repeatVars = _.uniq(getMatches(html, /{{\/([^}]+)}}/g))
      repeatVars.forEach(function (repeat) {
        var repeatBlockRegex = new RegExp('{{' + repeat + '}}(.*?){{/' + repeat + '}}', 'gi')
        html = html.replace(repeatBlockRegex, function (m, content) {
          var action = _.findItemByKey(card.actions, repeat)
          var count = action && parseInt(action[repeat], 10) || 0

                    // resolve template
          var $content = $('<div>').html(content)
          var template = $content.find('>template').htmlOuter() || ('<template>' + content + '</template>')

                    // resolve items
          var $items = $content.find('>item').filter(function (i) {
            return i < count
          })
          var items = $items.htmlOuter() + _.replicate(count - $items.length, '<item>' + $(template).html() + '</item>')

          var result = '<div class="repeat-variable" name="' + repeat + '">' + template + items + '</div>'
          return result
        })
      })

            // strip out extra closing repeat tags, like {{/count}} without pair
      html = html.replace(/{{\/[^}]+}}/gi, '')

            // compile Template Variables
      if (!immediate) {
        var $html = $('<div>').html(html)

        var deferredHtml = []
        var $postTemplate = $html.find('[data-post-template]')
        if ($postTemplate.length) {
          var single = $postTemplate.attr('data-single') == 'true'
          var num = single ? 1 : 3
          var samples = _.range(num).map(function (i) {
            return buildSamplePost(i, num, single)
          })
          deferredHtml.push(loadCardPosts($postTemplate, card.client.companyName, samples))
        }

        var $productTemplate = $html.find('[data-product-template]')
        if ($productTemplate.length) {
          var single = $productTemplate.attr('data-single') == 'true'
          var num = single ? 1 : 10
          var samples = _.range(num).map(function (i) {
            return buildSampleProduct(i, num)
          })
          deferredHtml.push(loadCardProducts($productTemplate, card.client.companyName, samples))
        }

        var $categoryTemplate = $html.find('[data-product-category-template]')
        if ($categoryTemplate.length) {
          var samples = _.range(num).map(function (i) {
            return buildSampleProduct(i, null, true)
          })
          deferredHtml.push(loadCardProductCategories($categoryTemplate, card.client.companyName, samples))
        }

        var $dynamicTemplate = $html.find('[data-dynamic-template]')
        if ($dynamicTemplate.length) {
          deferredHtml.push(loadDynamicTemplate($dynamicTemplate, card.client.companyName))
        }

        if (deferredHtml.length > 0) {
          return $q.all(deferredHtml).then(function () {
            return $html.html()
          })
        }
      }

      return immediate ? html : $q.when(html)
    }

    function assembleCardHtml (html) {
      var $container = $('<div>').html(html)

      $container.find('.repeat-variable').each(function () {
        var varName = $(this).attr('name')
        var html = $(this).find('template').html()
        $(this).replaceWith('{{' + varName + '}}' + html + '{{/' + varName + '}}')
      })

      $container.find('.autogenerated').remove()

      html = $container.html()
      return html
    }

    function generateUniqueName (name, client) {
      var text = ''
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      for (var i = 0; i < 8; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
      }
      if (client) {
        return _.safeUrl('client/' + client.toLowerCase() + '/' + text + '-' + name)
      } else {
        return _.safeUrl('app/' + text + '-' + name)
      }
    }

        //
        // PRIVATE FUNCTIONS
        //

    function getMatches (text, regex, index) {
      index = typeof index === 'number' ? index : 1
      var matches, output = []
      while (matches = regex.exec(text)) {
        output.push(matches[index])
      }
      return output
    }

    function bindPlaceholders (html, card) {
      var scope = $rootScope.$new()
      angular.extend(scope, _.mergeActions(card.actions))

      html = html.replace(/{{([^}]+)}}/g, function (match, expr) {
        if (expr.match(/url\b/i)) return '' // skip urls
        if (scope.$eval(expr) === undefined) return '{' + expr.trim() + '}'
        return match
      })

      return html
    }

    function removeIncompleteBindings (html) {
      html = html.replace(/{{[^{}]*(..)?/g, function (m, g) {
        if (!g || g != '}}') return m.replace(/^{{\S*/, '')
        return m
      })
      return html
    }

    function buildSamplePost (i, count, single) {
      var published = moment.utc().add(-count + i, 'days')
      var isoParts = published.format().split('T')
      var content = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n' +
                'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Donec elementum ligula eu sapien consequat eleifend.\n' +
                'Donec nec dolor erat, condimentum sagittis sem. Praesent porttitor porttitor risus, dapibus rutrum ipsum gravida et. Integer lectus nisi, facilisis sit amet eleifend nec, pharetra ut augue. Integer quam nunc, consequat nec egestas ac, volutpat ac nisi.\n' +
                'Sed consectetur dignissim dignissim. Donec pretium est sit amet ipsum fringilla feugiat. Aliquam erat volutpat. Maecenas scelerisque, orci sit amet cursus tincidunt, libero nisl eleifend tortor, vitae cursus risus mauris vitae nisi. Cras laoreet ultrices ligula eget tempus.'
      var excerpt = content.substr(0, 600) + '...'

      return {
        _id: i + 1,
        title: 'Sample Post Title ' + (i + 1),
        published: published,
        formattedDate: published.format('LL'),
        formattedTime: published.format('LT'),
        dateISO: isoParts[0],
        timeISO: isoParts[1],
        author: { displayName: 'John Smith' },
        content: content,
        excerpt: excerpt,
        featuredImage: { url: 'https://placeholdit.imgix.net/~text?txtsize=19&txt=image&w=600&h=400' },
        categories: ['business', 'development', 'lifestyle']
      }
    }

    function buildSampleProduct (i, count, separateCategories) {
      var title = 'Sample Product Title ' + (i + 1)
      var planTitle = separateCategories ? ['Whiskey', 'French Wine', 'Craft Beers'][i % 3] : 'Whiskey'
      var planId = separateCategories ? (i % 3) + 1 : 1
      var onsale = i % 3 == 0
      return {
        productId: i + 1,
        Title: title,
        Description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit.',
        planId: planId,
        PlanName: planTitle,
        Image: 'https://placehold.it/300x400/ccc/333?text=Image&',
        Prices: [
                    { price: 30.5, oprice: onsale ? 33.5 : '', onsale: onsale, size: '' },
                    { price: 45.5, oprice: onsale ? 40.5 : '', onsale: onsale, size: '1.5L' }
        ],
        Slug: _.buildUrl(title),
        PlanSlug: _.buildUrl(planTitle)
      }
    }
  }
})()
