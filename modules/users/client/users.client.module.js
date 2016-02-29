'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core', 'ngCsv', 'ngSanitize', 'chart.js']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);
ApplicationConfiguration.registerModule('users.supplier', ['core.supplier']);
ApplicationConfiguration.registerModule('users.supplier.routes', ['core.supplier.routes']);
ApplicationConfiguration.registerModule('users.manager', ['core.manager']);
ApplicationConfiguration.registerModule('users.manager.routes', ['core.manager.routes']);
