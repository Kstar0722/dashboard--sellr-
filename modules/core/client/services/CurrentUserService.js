angular.module('core').service('CurrentUserService', ['Users', '$state',
  function (Users, $state) {
    var me = this
    me.user = ''
    me.locations = ''
    me.currentUserRoles = []
    me.userBeingEdited = {}
    me.myPermissions = localStorage.getItem('roles')
    Users.query({ expand: 'stores' }).then(function (data, err) {
      me.userList = data
    })
    me.update = function () {
      Users.query(function (data) {
        me.userList = data
        window.location.reload()
      })
    }

    return me
  }
])
