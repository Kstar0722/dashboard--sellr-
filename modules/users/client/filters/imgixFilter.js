angular.module('users')
.filter('imgix', function () {
  return function (url, w, h, q) {
    var newUrl = url
    if (url) {
      if (url.split('/cdn.expertoncue.com/')[ 1 ]) {
        url = url.split('/cdn.expertoncue.com/')[ 1 ]
        newUrl = 'https://sllr.imgix.net/' + url + '?w=' + w + '&h=' + h + '&q=' + q + '&auto=compress,format'
      } else if (url.split('cdn.expertoncue.com.s3.amazonaws.com/')[ 1 ]) {
        url = url.split('cdn.expertoncue.com.s3.amazonaws.com/')[ 1 ]
        newUrl = 'https://sllr.imgix.net/' + url + '?w=' + w + '&h=' + h + '&q=' + q + '&auto=compress,format'
      }
    }
    return newUrl
  }
})
