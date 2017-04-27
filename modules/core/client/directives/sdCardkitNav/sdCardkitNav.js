'use strict'

angular.module('core')
  .directive('sdCardkitNav', ['$http', 'constants', function ($http, constants) {
    return {
      templateUrl: '/modules/core/client/directives/sdCardkitNav/sdCardkitNav.html',
      link: function (scope, element, attrs) {
        $http.get(combinePath(constants.CARDKIT_URL, 'pages/json/Sellr/Live/_blank')).then(function (response) {
          var page = response.data[0]
          if (!page) return

          var html = page['Html Markup']
          var navigation = page['Navigation Markup']

          var styleDom = buildStyle(page.CSS)
          if (styleDom) element.append(styleDom)

          element.append(toElements(html))
          element.append(toElements(navigation))

          bindLinks(element, constants.GETSELLR_URL)
        })
      }
    }

    function buildStyle (css) {
      if (!css) return

      var styleNode = document.createElement('style')
      styleNode.type = 'text/css'

      var styleText = document.createTextNode(css)
      styleNode.appendChild(styleText)

      return styleNode
    }

    function toElements (html) {
      return $('<div>').html(html).children()
    }

    function bindLinks (element, domain) {
      if (!domain) return
      $(element).find('a[href]').each(function () {
        var $a = $(this)
        var href = $a.attr('href')
        if (!href || isAbsoluteUrl(href)) return
        $a.attr('href', combinePath(domain, href.replace(/^\/+/, '')))
      })
    }

    function isAbsoluteUrl (url) {
      return url.match(/^(https?|ftp)/i)
    }

    function combinePath (part1, part2) {
      if (!part1) return part2
      if (!part2) return part1
      if (part1[part1.length - 1] !== '/') part1 += '/'
      if (part2[0] === '/') part2 = part2.substr(1)
      return part1 + part2
    }
  }])
