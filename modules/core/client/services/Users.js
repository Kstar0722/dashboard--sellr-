angular.module('core').factory('Users', ['$http', 'constants', '$q', '$analytics', 'toastr', '$mdDialog', '$timeout', 'Authentication',
  function ($http, constants, $q, $analytics, toastr, $mdDialog, $timeout, Authentication) {
    var me = this

    me.get = function (userId) {
      var defer = $q.defer()
      $http.get(constants.API_URL + '/users/' + userId.userId).then(function (response, err) {
        $http.get(constants.API_URL + '/users/roles/' + userId.userId).then(function (res, err) {
          response.data[0].roles = []
          res.data.forEach(function (role) {
            response.data[0].roles.push(role['roleId'])
            response.data[0].accountId = role['accountId']
          })
          defer.resolve(response.data[0])
        })
      })
      return defer.promise
    }

    me.query = function (params, silent) {
      var defer = $q.defer()
      var httpOptions = silent ? { params: params, ignoreLoadingBar: true } : {params: params}
      $http.get(constants.API_URL + '/users', httpOptions).then(function (response, err) {
        if (err) {
          defer.reject(err)
        }
        var users = _.map(response.data, initUser)
        defer.resolve(users)
      })
      return defer.promise
    }

    me.put = function (user) {
      var payload = {
        payload: user
      }
      return $http.put(constants.API_URL + '/users/' + user.userId, payload)
    }

    me.resetPassword = function (email) {
      var payload = {
        payload: {
          email: email
        }
      }
      return $http.post(constants.API_URL + '/users/auth/forgot', payload)
    }

    me.create = function (user) {
      var payload = {
        payload: user
      }
      return $http.post(constants.API_URL + '/users', payload).then(successCreateUserHandler).catch(errorCreateUserHandler)
    }

    me.createUserFacebook = function (user) {
      var payload = {
        payload: user
      }
      return $http.post(constants.API_URL + '/users/facebook', payload).then(successCreateUserHandler).catch(errorCreateUserHandler)
    }

    function successCreateUserHandler (response) {
      console.log('user signed up', response.data)
      var user = initUser(response.data)
      $analytics.eventTrack('User Signed Up', {
        email: user.email,
        name: user.name || user.displayName || (user.firstName + ' ' + user.lastName),
        phone: user.phone
      })
      return user
    }

    function errorCreateUserHandler (response) {
      console.error('create user failed', response.data)
      if (response.data.name !== 'AlreadyRegistered') {
        var msg = 'Failed to create new account'
        if ((response.data || {}).message) msg += '. ' + response.data.message
        toastr.error(msg)
      }
      throw response
    }

    me.confirmDeleteUser = function (user) {
      var defer = $q.defer()
      var userFullname = user.displayName || (user.firstName + ' ' + user.lastName)

      var confirm = $mdDialog.prompt()
        .title('Delete user `' + userFullname + '`?')
        .textContent('Please type the full name of the user to confirm.')
        .ok('Delete')
        .cancel('Cancel')

      $mdDialog.cancel().then(function () {
        $timeout(function () {
          $('body > .md-dialog-container').addClass('delete confirm')
        })

        return $mdDialog.show(confirm).then(function (code) {
          if (!code) return

          if (userFullname.toUpperCase().trim() !== code.toUpperCase().trim()) {
            toastr.error('Wrong confirmation code')
            return
          }

          return deleteUserFOREVER(user).then(function () {
            defer.resolve(user)
          })
        })
      }).catch(function (err) {
        defer.reject(err)
      })

      return defer.promise
    }

    me.rolesOptions = [
      {
        label: 'Administrator',
        roles: [1002, 1003, 1004, 1007, 1009, 1010, 1011]
      },
      {
        label: 'Owner',
        roles: [1002, 1003, 1009]
      },
      {
        label: 'Manager',
        roles: [1002, 1003, 1007]
      },
      {
        label: 'Supplier',
        roles: [1003, 1007]
      },
      {
        label: 'Editor',
        roles: [1003, 1010]
      },
      {
        label: 'Curator',
        roles: [1003, 1010, 1011]
      }
    ]

    me.initUser = initUser

    function initUser (user) {
      if (!user) return user
      user.createdDateMoment = user.createdDate && moment(user.createdDate)
      user.createdDateStr = user.createdDateMoment && user.createdDateMoment.format('lll')
      user.role = convertUserRolesToLabel(user.roles)
      return user
    }

    function convertUserRolesToLabel (roles) {
      var rolesTemp = roles
      rolesTemp = rolesTemp.split(',')
      rolesTemp = _.map(rolesTemp, function (strRole) {
        return Authentication.rolesMap[strRole]
      })
      rolesTemp = _.sortBy(rolesTemp, function (num) { return num })
      var resultObj = _.find(me.rolesOptions, function (r) { return _.isEqual(r.roles, rolesTemp) })
      if (resultObj) {
        return resultObj.label
      } else {
        return '-'
      }
    }

    me.deleteUserFOREVER = deleteUserFOREVER
    function deleteUserFOREVER (user) {
      var userId = user.userId || user
      var url = constants.API_URL + '/users/' + userId
      return $http.delete(url).then(onDeleteAccountSuccess, onDeleteAccountError)

      function onDeleteAccountSuccess (res) {
        console.log('accounts Service, deleteUser %O', res)
      }

      function onDeleteAccountError (err) {
        console.error(err)
        throw err
      }
    }

    return me
  }
])
