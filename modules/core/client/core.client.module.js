'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core', ['ngAnimate', 'ngAria', 'ngMaterial', 'ngFileUpload', 'ui.sortable', 'ngCsv', 'ngSanitize', 'environment', 'toastr', 'chart.js']);
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);
ApplicationConfiguration.registerModule('core.supplier', ['core']);
ApplicationConfiguration.registerModule('core.supplier.routes', ['ui.router']);

ApplicationConfiguration.registerModule('core.manager', ['core']);
ApplicationConfiguration.registerModule('core.manager.routes', ['ui.router']);
