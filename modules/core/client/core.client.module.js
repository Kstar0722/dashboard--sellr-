'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core', [ 'ngAnimate', 'ngAria', 'ngMaterial', 'ngFileUpload', 'ui.sortable', 'ngCsv', 'ngSanitize', 'environment', 'toastr', 'chart.js' ]);
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);
ApplicationConfiguration.registerModule('core.supplier', ['core']);
ApplicationConfiguration.registerModule('core.supplier.routes', ['ui.router']);
ApplicationConfiguration.registerModule('core.editor', ['core']);
ApplicationConfiguration.registerModule('core.editor.routes', ['ui.router']);
ApplicationConfiguration.registerModule('core.curator', ['core']);
ApplicationConfiguration.registerModule('core.curator.routes', ['ui.router']);
ApplicationConfiguration.registerModule('core.manager', ['core']);
ApplicationConfiguration.registerModule('core.manager.routes', ['ui.router']);
ApplicationConfiguration.registerModule('core.storeOwner', ['core']);
ApplicationConfiguration.registerModule('core.storeOwner.routes', ['ui.router']);
