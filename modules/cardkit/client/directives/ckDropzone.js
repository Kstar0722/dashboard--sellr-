'use strict'

angular
    .module('cardkit.core')
    .directive('ckDropzone', ['$window', 's3Storage', 'mimeTypeService', function ($window, s3Storage, mimeTypeService) {
      return {
        restrict: 'E',
        scope: {
          handle: '&',
          value: '=ngModel',
          requestedKind: '@kind'
        },
        replace: true,
        templateUrl: '/modules/cardkit/client/directives/ckDropzone.html',
        link: function (scope, element, attrs) {
          if (!$window.File || !$window.FileReader) return
          scope.kind = scope.requestedKind

          scope.fileExtension = function (filePath) {
            if (!filePath) return
            filePath = filePath.toString()
            var ext = _.last(filePath.split('.')).toLowerCase()
            if (filePath == ext || ext.length > 5) return
            return ext
          }

          scope.filename = function (filepath) {
            if (!filepath) return
            var lower = filepath.toString().toLowerCase()
            if (lower.indexOf('s3.amazonaws.com') >= 0 || lower.indexOf('cdn.cardkit.io') >= 0) {
              return s3Storage.filename(filepath)
            }
            return filepath
          }

          scope.$watch('value', function (value) {
            scope.kind = scope.requestedKind || mimeTypeService.lookupType(value)
          })

          scope.$watch('$parent.uploadProgress', function (uploadProgress) {
            scope.uploading = typeof uploadProgress === 'number'
            scope.uploadProgress = uploadProgress
          })

          element.on('dragover', FileDragHover)
          element.on('dragleave', FileDragHover)
          element.on('drop', FileSelectHandler)

          function FileDragHover (e) {
            e.stopPropagation()
            e.preventDefault()
            if (e.type == 'dragover') element.addClass('dragover')
            else element.removeClass('dragover')
          }

          function FileSelectHandler (e) {
                    // cancel event and hover styling
            FileDragHover(e)

                    // fetch FileList object
            var files = e.originalEvent.target.files || e.originalEvent.dataTransfer.files

                    // process all File objects
            scope.handle({ files: files })
          }
        }
      }
    }])
