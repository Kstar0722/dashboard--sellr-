'use strict'

module.exports = {
  client: {
    lib: {
      css: [
        'public/lib/bootstrap/dist/css/bootstrap.min.css',
        // 'public/lib/bootstrap-multiselect/dist/css/bootstrap-multiselect.css',

        // 'public/lib/toastr/toastr.css',
        'public/lib/jquery-ui/themes/black-tie/jquery-ui.css',
        'public/lib/angular-hotkeys/build/hotkeys.css',
        // 'public/lib/v-accordion/dist/v-accordion.css',
        'public/lib/medium-editor/dist/css/medium-editor.css',
        'public/lib/medium-editor/dist/css/themes/default.css',
        'public/lib/selectize/dist/css/selectize.css',
        'public/lib/ng-tags-input/ng-tags-input.css',
        'public/lib_exts/medium-editor-insert-plugin.fixed.css',
        // 'public/lib/angular-ui-tree/dist/angular-ui-tree.min.css',

        // material design
        'public/lib/angular-material/angular-material.css',
        'public/lib/angular-material-icons/angular-material-icons.css'
      ],
      js: [
        'public/lib/jquery/dist/jquery.min.js',
        'public/lib/jquery-ui/jquery-ui.min.js',
        'public/lib/angular-animate/angular-animate.js',
        // 'public/lib/v-accordion/dist/v-accordion.js',
        'public/lib/angular-ui-sortable/sortable.js',
        // 'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-cookies/angular-cookies.js',
        // 'public/lib/angular-touch/angular-touch.js',
        'public/lib/angular-sanitize/angular-sanitize.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        // 'public/lib/angular-ui-utils/ui-utils.js',
        // 'public/lib/ace/src-noconflict/ace.js',
        // 'public/lib/ace/src-noconflict/ext-language_tools.js',
        // 'public/lib/ace/src-noconflict/theme-monokai.js',
        'public/lib/aws-sdk/dist/aws-sdk.min.js',
        'public/lib/bootstrap/dist/js/bootstrap.js',
        // 'public/lib/bootstrap-multiselect/dist/js/bootstrap-multiselect.js',
        'public/lib/less/dist/less.min.js',
        // 'public/lib/lodash/lodash.min.js',
        // 'public/lib/toastr/toastr.js',
        'public/lib/medium-editor/dist/js/medium-editor.js',
        'public/lib/ng-idle/angular-idle.min.js',
        'public/lib/angular-hotkeys/build/hotkeys.js',
        'public/lib/angular-aria/angular-aria.js',
        // 'public/lib_exts/angular-material.extended.js',
        'public/lib/angular-material-icons/angular-material-icons.js',
        'public/lib/underscore/underscore.js',
        'public/lib/angular-filter/dist/angular-filter.js',
        'public/lib/ngvideo/dist/ng-video.js',
        'public/lib/blueimp-canvas-to-blob/js/canvas-to-blob.js',
        'public/lib/blob-util/dist/blob-util.js',
        'public/lib_exts/html2canvas.improved.js',
        'public/lib/selectize/dist/js/standalone/selectize.js',
        'public/lib/ng-tags-input/ng-tags-input.js',
        'public/lib/angular-selectize2/dist/angular-selectize.js',
        'public/lib/angular-ui-tree/dist/angular-ui-tree.js',
        'public/lib/angular-gravatar/build/angular-gravatar.js',
        'public/lib_exts/mimetype-js.fixed.js',
        'public/lib/moment/moment.js',
        'public/lib/angular-moment/angular-moment.js',
        'public/lib/filepicker-js-bower/filepicker.js',
        'public/lib/angular-filepicker/dist/angular_filepicker.js',
        // 'public/lib/angular-post-message/dist/angular-post-message.js',

        // medium-editor-insert-plugin dependencies
        'public/lib/handlebars/handlebars.runtime.js',
        //'public/lib/jquery-sortable/source/js/jquery-sortable.js', // required for images only, but conflicts with anglar-ui-sortable
        // Unfortunately, jQuery File Upload Plugin has a few more dependencies itself
        'public/lib/blueimp-file-upload/js/vendor/jquery.ui.widget.js',
        'public/lib/blueimp-file-upload/js/jquery.iframe-transport.js',
        'public/lib/blueimp-file-upload/js/jquery.fileupload.js',
        // 'public/lib/medium-editor-insert-plugin/dist/js/medium-editor-insert-plugin.js'
        'public/lib_exts/medium-editor-insert-plugin.fixed.js',

        'public/lib/angular-lazy-img/release/angular-lazy-img.js',
        'public/lib/angular-cache/dist/angular-cache.js',
        'public/lib/angular-debounce/dist/angular-debounce.js'
      ]
    }
  }
}
