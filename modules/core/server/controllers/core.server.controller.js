'use strict'

/**
 * Render the main application page
 */
exports.renderIndex = function (req, res) {
  var index
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'QA') {
    index = 'modules/core/server/views/prod'
  } else {
    index = 'modules/core/server/views/dev'
  }
  res.render(index, {
    user: req.user || null
  })
}

/**
 * Render the server error page
 */
exports.renderServerError = function (req, res) {
  res.status(500).render('modules/core/server/views/500', {
    error: 'Oops! Something went wrong...'
  })
}

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.renderNotFound = function (req, res) {
  res.status(404).format({
    'text/html': function () {
      res.render('modules/core/server/views/404', {
        url: req.originalUrl
      })
    },
    'application/json': function () {
      res.json({
        error: 'Path not found'
      })
    },
    'default': function () {
      res.send('Path not found')
    }
  })
}
