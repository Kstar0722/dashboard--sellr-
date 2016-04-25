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
				'public/lib/angular-toastr/dist/angular-toastr.min.css'
			],
			js: [
				'public/lib/jquery/dist/jquery.min.js',
				'public/lib/jquery-ui/jquery-ui.min.js',
				'public/lib/angular/angular.min.js',
				'public/lib/angular-ui-sortable/sortable.min.js',
				'public/lib/aws-sdk/dist/aws-sdk.min.js',
				'public/lib/angular-aria/angular-aria.min.js',
				'public/lib/angular-resource/angular-resource.min.js',
				'public/lib/angular-animate/angular-animate.min.js',
				'public/lib/angular-messages/angular-messages.min.js',
				'public/lib/angular-ui-router/release/angular-ui-router.min.js',
				'public/lib/angular-ui-utils/ui-utils.min.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
				'public/lib/angular-file-upload/angular-file-upload.min.js',
				'public/lib/underscore/underscore-min.js',
				'public/lib/ng-file-upload/ng-file-upload-all.min.js',
				'public/lib/checklist-model/checklist-model.min.js',
				'public/lib/angular-sanitize/angular-sanitize.js',
				'public/lib/ng-csv/build/ng-csv.min.js',
				'public/lib/angular-environment/dist/angular-environment.min.js',
				'public/lib/Chart.js/Chart.min.js',
				'public/lib/angular-chart.js/dist/angular-chart.js',
				'public/lib/moment/min/moment.min.js',
				'public/lib/angular-material/angular-material.min.js',
				'public/lib/angular-toastr/dist/angular-toastr.tpls.min.js',
				'public/lib/moment/min/locales.min.js',
				'public/lib/angular-intercom/angular-intercom.min.js',
				'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
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
