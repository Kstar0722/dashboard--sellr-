'use strict';

module.exports = {
	client: {
		lib: {
			css: [
				//'public/lib/bootstrap/dist/css/bootstrap.css',
				//'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/lib/angular-material/angular-material.min.css',
				'public/lib/angular-material/angular-material.layouts.min.css',
				'public/lib/angular-chart.js/dist/angular-chart.min.css',
				'public/lib/angular-toastr/dist/angular-toastr.min.css',
				'public/lib/medium-editor/dist/css/medium-editor.css',
				'public/lib/medium-editor/dist/css/themes/default.css'
			],
			js: [
                'public/lib/jquery/dist/jquery.js',
                'public/lib/jquery-ui/jquery-ui.js',
                'public/lib/angular/angular.js',
                'public/lib/angular-resource/angular-resource.js',
                'public/lib/angular-animate/angular-animate.js',
                'public/lib/angular-ui-utils/ui-utils.js',
                'public/lib/angular-ui-router/release/angular-ui-router.js',
                'public/lib/es5-shim/es5-shim.js',
                'public/lib/angular-file-upload/angular-file-upload.js',
                'public/lib/angular-messages/angular-messages.js',
                'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
                'public/lib/angular-toastr/dist/angular-toastr.tpls.js',
                'public/lib/underscore/underscore.js',
                'public/lib/ng-file-upload/ng-file-upload.js',
                'public/lib/ng-file-upload-shim/ng-file-upload-shim.js',
                'public/lib/aws-sdk/dist/aws-sdk.js',
                'public/lib/video.js/dist/video.js',
                'public/lib/angular-ui-sortable/sortable.js',
                'public/lib/checklist-model/checklist-model.js',
                'public/lib/angularUtils-pagination/dirPagination.js',
                'public/lib/ng-table/dist/ng-table.min.js',
                'public/lib/angular-sanitize/angular-sanitize.js',
                'public/lib/ng-csv/build/ng-csv.min.js',
                'public/lib/angular-aria/angular-aria.js',
                'public/lib/angular-material/angular-material.js',
                'public/lib/angular-environment/dist/angular-environment.js',
                'public/lib/Chart.js/Chart.js',
                'public/lib/angular-chart.js/dist/angular-chart.js',
                'public/lib/moment/moment.js',
                'public/lib/angular-audio/app/angular.audio.js',
                'public/lib/jasmine-core/lib/jasmine-core/jasmine.js',
                'public/lib/medium-editor/dist/js/medium-editor.js',
                'public/lib/angular-medium-editor/dist/angular-medium-editor.js'
			]
		},
		css: [
			'modules/*/client/css/*.css'
		],
		less: [
			'modules/*/client/less/*.less'
		],
		sass: [
			'modules/*/client/scss/*.scss'
		],
		js: [
			'modules/core/client/app/config.js',
			'modules/core/client/app/init.js',
			'modules/*/client/*.js',
			'modules/*/client/**/*.js'
		],
		views: ['modules/*/client/views/**/*.html'],
		templates: ['build/templates.js']
	},
	server: {
		gruntConfig: 'gruntfile.js',
		gulpConfig: 'gulpfile.js',
		allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
		models: 'modules/*/server/models/**/*.js',
		routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
		sockets: 'modules/*/server/sockets/**/*.js',
		config: 'modules/*/server/config/*.js',
		policies: 'modules/*/server/policies/*.js',
		views: 'modules/*/server/views/*.html'
	}
};
