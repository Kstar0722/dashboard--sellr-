'use strict'

angular.module('users').factory('MediumS3ImageUploader', ['$window', 'uploadService', 'toastr', function ($window, uploadService, toastr) {
  var isContentEmpty = function (element) {
    var $element = $(element)
    return $element.length === 0 || $element.text().trim() === '' && $element.find('img').length === 0
  }

  var handleGlobalDragAndDrop = function (callback) {
    window.addEventListener('dragover', function (e) {
      e = e || window.event
      e.preventDefault()
    }, false)

    window.addEventListener('drop', function (e) {
      e = e || window.event
      e.preventDefault()
      var handled = (callback || $.noop)(e)
      if (handled) e.stopPropagation()
    }, false)
  }

  return $window.MediumEditor.Extension.extend({
    name: 'image-dropping-to-s3',
    init: function () {
      this.subscribe('editableDrag', this.handleDrag.bind(this))
      this.subscribe('editableDrop', this.handleDrop.bind(this))

      handleGlobalDragAndDrop(function (event) {
        var editor = $(this.base.getFocusedElement()).closest('.editable')
        if (editor.length) {
          this.handleDrop(event, editor)
          return true
        }
      }.bind(this))

      var self = this
      var pluginName = 'mediumInsert'
      var oldImagesFn = $.fn[pluginName + 'Images']

      $.fn[pluginName + 'Images'] = function (options) {
        oldImagesFn.apply(this, arguments)
        return this.each(function () {
          var plugin = $(this).data('plugin_' + pluginName + 'Images')
          plugin.uploadAdd = function (e, data) {
            return self.upload(data.files)
          }
          return plugin.uploadAdd
        })
      }
    },
    handleDrag: function (event) {
      var className = 'medium-editor-dragover'
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
      if (event.type === 'dragover') {
        event.target.classList.add(className)
        this.base.selectElement(event.target)
      } else if (event.type === 'dragleave') {
        event.target.classList.remove(className)
      }
    },
    handleDrop: function (event, editor) {
      var className = 'medium-editor-dragover'
      event.preventDefault()
      event.stopPropagation()
      event.target.classList.remove(className)
      $(editor).find('.medium-editor-dragover').removeClass('medium-editor-dragover')
      this.upload(event.dataTransfer.files)
      event.target.classList.remove(className)
    },
    upload: function (files) {
      if (!files) return
      files = Array.prototype.slice.call(files, 0)

      return files.some(function (file) {
        if (!file.type.match('image')) return

        var id = 'medium-img-' + +(new Date())
        var fileReader = new FileReader()
        fileReader.readAsDataURL(file)

        var focused = this.base.getFocusedElement()
        if (focused && !isContentEmpty(focused)) {
          var selection = this.base.exportSelection()
          selection.start = selection.end
          this.base.importSelection(selection)
        }

        $(this.base.elements).data('plugin_mediumInsert').hideButtons()
        this.base.pasteHTML('<img class="medium-image-loading" id="' + id + '">')
        $('#' + id).wrap('<span class="image">')

        fileReader.onload = function () {
          var img = this.base.options.ownerDocument.getElementById(id)
          if (!img) return

          img.removeAttribute('id')
          img.removeAttribute('class')
          img.src = fileReader.result

          var $image = $(img).closest('.image').addClass('uploading')
          var $progress = $('<span>').addClass('progress').text('Uploading... 0%').appendTo($image)

          var mediaConfig = {
            mediaRoute: 'media',
            folder: 'editor',
            fileType: 'IMAGE',
            type: 'SUPPLIER',
            accountId: localStorage.getItem('accountId')
          }
                    // log('product config %0', mediaConfig)
          return uploadService.upload(file, mediaConfig).then(function (response, err) {
            var url = response[0].publicUrl
            img.src = url
            $(img).trigger('change')
            return url
          }, function (err) {
            $image.remove()
            console.error(err)
            toastr.error('Failed to upload image')
          }, function (progress) {
            $progress.text('Uploading... ' + progress + '%')
            $(img).trigger('change')
          }).finally(function () {
            $image.removeClass('uploading')
            $progress.remove()
            this.base.trigger('editableInput', null, this.base.elements[0])
          }.bind(this))
        }.bind(this)

        return fileReader.onload
      }.bind(this))
    }
  })
}])
