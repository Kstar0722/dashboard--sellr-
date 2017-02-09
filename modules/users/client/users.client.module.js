'use strict'

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core'])
ApplicationConfiguration.registerModule('users.admin', ['core.admin'])
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes'])
ApplicationConfiguration.registerModule('users.supplier', ['core.supplier'])
ApplicationConfiguration.registerModule('users.supplier.routes', ['core.supplier.routes'])
ApplicationConfiguration.registerModule('users.curator', ['core.curator'])
ApplicationConfiguration.registerModule('users.curator.routes', ['core.curator.routes'])
ApplicationConfiguration.registerModule('users.editor', ['core.editor'])
ApplicationConfiguration.registerModule('users.editor.routes', ['core.editor.routes'])
ApplicationConfiguration.registerModule('users.manager', ['core.manager'])
ApplicationConfiguration.registerModule('users.manager.routes', ['core.manager.routes'])
ApplicationConfiguration.registerModule('users.storeOwner', ['core.storeOwner'])
ApplicationConfiguration.registerModule('users.storeOwner.routes', ['core.storeOwner.routes'])
