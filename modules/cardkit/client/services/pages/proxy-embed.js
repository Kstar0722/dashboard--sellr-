(function () {
  if (!window.$) {
    console.error('$ is undefined, required for proxy-embed.js')
    return
  }

  $(document).ready(function () {
    $(window).on('message', receiveMessage)
    window.parent.postMessage('loaded', '*')
  })

  function receiveMessage (e) {
    var msg = parseJSON(e.originalEvent.data)
    if (!msg) return

    if (msg.type == 'inject' && msg.html) {
      $('<div>').html(msg.html).contents().attr('id', msg.id).addClass('injected').appendTo(document.body)
    } else if (msg.type == 'eval' && msg.code) {
      $.globalEval(msg.code)
    }
  }

  function parseJSON (str) {
    try {
      return JSON.parse(str)
    } catch (ex) {
    }
  }
})()
