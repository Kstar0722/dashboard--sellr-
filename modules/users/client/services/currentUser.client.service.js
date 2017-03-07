angular.module('users').service('CurrentUserService', ['Users', '$state',
  function (Users, $state) {
    var me = this
    me.user = ''
    me.locations = ''
    me.currentUserRoles = []
    me.userBeingEdited = {}
    me.myPermissions = localStorage.getItem('roles')
    Users.query({ expand: 'stores' }).then(function (data, err) {
      me.userList = data
      console.log('admin returned %O', data)
    })
    me.update = function () {
      Users.query(function (data) {
        me.userList = data
        window.location.reload()
                // $state.go('admin.users',{} , {reload:true});
                // $state.go('admin.users.user-edit',{} , {reload:true})
        console.log('admin returned %O', data)
      })
    }

    return me
  }
])
