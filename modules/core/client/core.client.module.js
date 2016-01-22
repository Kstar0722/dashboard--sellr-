'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core', ['ngMaterial', 'ngFileUpload']);
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);
ApplicationConfiguration.registerModule('core.supplier', ['core']);
ApplicationConfiguration.registerModule('core.supplier.routes', ['ui.router']);
