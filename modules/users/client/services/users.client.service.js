'use strict'
/* globals angular, moment, _ */

// Users service used for communicating with the users REST endpoint
angular.module('users.admin').factory('Users', ['$http', 'constants', '$q', '$analytics', 'toastr',
  function ($http, constants, $q, $analytics, toastr) {
    var me = this

    me.get = function (userId) {
      var defer = $q.defer()
      $http.get(constants.API_URL + '/users/' + userId.userId).then(function (response, err) {
        $http.get(constants.API_URL + '/users/roles/' + userId.userId).then(function (res, err) {
          console.log(res)
          console.log(response)
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

    me.query = function (params) {
      var defer = $q.defer()
      $http.get(constants.API_URL + '/users', { params: params }).then(function (response, err) {
        if (err) {
          defer.reject(err)
        }
        var users = _.map(response.data, initUser);
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
      var defer = $q.defer()
      var payload = {
        payload: {
          email: email
        }
      }
      $http.post(constants.API_URL + '/users/auth/forgot', payload).then(function (response) {
        var resetLink = 'https://sellrdashboard.com/authentication/reset?token=' + response.data.token + '&email=' + response.data.email;

        var mailOptions = {
          payload: {
            source: 'password',
            email: response.data.email,
            title: 'Password Reset Success',
            body: '<body> <p>Hey there! <br> You have requested to have your password reset for your account at the Sellr Dashboard </p> ' +
              '<p>Please visit this url to reset your password:</p> ' +
              '<p><a href="' + resetLink + '">' + resetLink + '</a></p> ' +
              "<strong>If you didn't make this request, you can ignore this email.</strong> <br /> <br /> <p>The Sellr Support Team</p> </body>"
          }
        }
        if (response) {
          $http.post(constants.API_URL + '/emails', mailOptions).then(function (response2) {
            defer.resolve(response)
          }, function (error2) {
            defer.reject(error2)
          })
        }
      }, function (error) {
        defer.reject(error)
      })
      return defer.promise
    }

    me.create = function (user) {
      var payload = {
        payload: user
      };

      return $http.post(constants.API_URL + '/users', payload).then(function (response) {
        console.log('user signed up', response.data);
        var user = initUser(response.data);
        $analytics.eventTrack('User Signed Up', {
          email: user.email,
          name: user.name || user.displayName || (user.firstName + ' ' + user.lastName),
          phone: user.phone
        });
        return user;
      }).catch(function (response) {
        console.error('create user failed', response.data);
        if (response.data.name != 'AlreadyRegistered') {
          var msg = 'Failed to create new account';
          if ((response.data || {}).message) msg += '. ' + response.data.message;
          toastr.error(msg);
        }
        throw response;
      });
    };

    me.initUser = initUser;

    function initUser(user) {
      if (!user) return user;
      user.createdDateMoment = user.createdDate && moment(user.createdDate);
      user.createdDateStr = user.createdDateMoment && user.createdDateMoment.format('lll');
      return user;
    }

    return me
  }
])
